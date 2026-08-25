import { NextResponse } from "next/server"
import { resolveAsbabKey } from "@/lib/asbabIndex"
import type { AsbabContent } from "@/types/study"

const ASBAB_BASE_URL =
  "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-asbab-al-nuzul-by-al-wahidi"

const CITATION = /\[\d+:\d+\]/

/** Genuine Wahidi entries open with the quoted verse + [s:a] citation; the
 * dataset pads uncovered ayahs with unrelated mystical commentary — treat
 * that as "no asbab" (same test as scripts/build-asbab-index.mjs). */
function isGenuineWahidi(text: string): boolean {
  const t = text.trimStart()
  return t.startsWith("(") && CITATION.test(t.slice(0, 250))
}

/**
 * The source text is plain text but littered with U+FFFD replacement chars
 * where curly quotes/apostrophes/ellipses were lost upstream. Unrecoverable
 * exactly, but predictable: between letters it was an apostrophe, before a
 * capital an opening quote, otherwise a closing quote/ellipsis.
 */
function cleanAsbabText(text: string): string {
  return text
    .replace(/(\p{L})�(\p{L})/gu, "$1'$2")
    .replace(/�(?=\p{Lu})/gu, "“")
    .replace(/�(?=[.,;:)\]])/gu, "…")
    .replace(/�/g, "”")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

interface RouteContext {
  params: Promise<{ surahId: string; ayahId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { surahId, ayahId } = await context.params
  const surah = Number(surahId)
  const ayah = Number(ayahId)

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

  const empty: AsbabContent = { text: null }
  const headers = {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  }

  // Group members (empty_ayahs) resolve to the head ayah that holds the text
  const sourceKey = resolveAsbabKey(`${surah}:${ayah}`)
  const [srcSurah, srcAyah] = sourceKey.split(":").map(Number)

  try {
    const res = await fetch(`${ASBAB_BASE_URL}/${srcSurah}/${srcAyah}.json`, {
      cache: "force-cache",
      headers: { Accept: "application/json" },
    })

    // Missing files are expected — most ayahs have no recorded asbab
    if (res.status === 404) {
      return NextResponse.json(empty, { headers })
    }
    if (!res.ok) {
      throw new Error(`Asbab CDN error ${res.status}`)
    }

    const data = (await res.json()) as { text?: unknown }
    const raw = typeof data.text === "string" ? data.text : ""

    if (!raw || !isGenuineWahidi(raw)) {
      return NextResponse.json(empty, { headers })
    }

    const payload: AsbabContent = { text: cleanAsbabText(raw) }
    return NextResponse.json(payload, { headers })
  } catch {
    return NextResponse.json({ error: "Failed to load asbab" }, { status: 500 })
  }
}
