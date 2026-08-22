import { NextResponse } from "next/server"
import sanitizeHtml from "sanitize-html"
import { isTafsirSlug, getTafsirResource } from "@/lib/studyApi"
import type { QdcTafsirResponse, TafsirContent } from "@/types/study"

const TAFSIR_BASE_URL = "https://api.qurancdn.com/api/qdc"

/**
 * Single sanitization choke point for all tafsir HTML (and, in M5, every
 * additional book). Upstream text is trusted-ish but third-party — never
 * inject it unsanitized.
 */
function sanitizeTafsirHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "h3",
      "h4",
      "strong",
      "em",
      "b",
      "i",
      "ul",
      "ol",
      "li",
      "blockquote",
      "span",
      "br",
      "a",
    ],
    // `dir`/`lang` are safe on any allowed tag and preserve RTL direction on
    // inline Arabic ayah quotes embedded in English-language tafsir HTML —
    // without them, upstream RTL markup was stripped and quotes fell back to
    // the surrounding LTR flow.
    allowedAttributes: { a: ["href"], "*": ["dir", "lang"] },
    allowedSchemes: ["http", "https"],
    // Demote headings so tafsir content never outranks the panel title
    transformTags: {
      h1: "h3",
      h2: "h3",
      h5: "h4",
      h6: "h4",
    },
  })
}

interface RouteContext {
  params: Promise<{ slug: string; surahId: string; ayahId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug, surahId, ayahId } = await context.params
  const surah = Number(surahId)
  const ayah = Number(ayahId)

  if (!isTafsirSlug(slug)) {
    return NextResponse.json({ error: "Unknown tafsir" }, { status: 400 })
  }
  if (
    !Number.isInteger(surah) ||
    surah < 1 ||
    surah > 114 ||
    !Number.isInteger(ayah) ||
    ayah < 1 ||
    ayah > 286
  ) {
    return NextResponse.json({ error: "Invalid verse reference" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${TAFSIR_BASE_URL}/tafsirs/${slug}/by_ayah/${surah}:${ayah}`,
      {
        next: { revalidate: 86400 },
        headers: { Accept: "application/json" },
      },
    )
    if (res.status === 404) {
      // QDC rejects ayah keys that don't exist (e.g. 1:250)
      return NextResponse.json({ error: "Unknown ayah" }, { status: 404 })
    }
    if (!res.ok) {
      throw new Error(`Tafsir API error ${res.status}`)
    }

    const data = (await res.json()) as QdcTafsirResponse
    const tafsir = data.tafsir
    const resource = getTafsirResource(slug)

    const payload: TafsirContent = {
      slug,
      resourceName: tafsir?.resource_name ?? resource?.name ?? slug,
      text: sanitizeTafsirHtml(tafsir?.text ?? ""),
      coveredKeys: Object.keys(tafsir?.verses ?? {}).sort((a, b) => {
        const [aSurah, aAyah] = a.split(":").map(Number)
        const [bSurah, bAyah] = b.split(":").map(Number)
        return aSurah !== bSurah ? aSurah - bSurah : aAyah - bAyah
      }),
    }

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to load tafsir" }, { status: 500 })
  }
}
