import { NextResponse } from "next/server"
import type { SearchResponse, SearchResult } from "@/types/study"

const QDC_SEARCH_URL = "https://api.qurancdn.com/api/qdc/search"

/** Live QDC search shape (verified 2026-07) — not the older `search.results` layout */
interface QdcSearchResponse {
  result?: {
    navigation?: Array<{ result_type?: string; name?: string; key?: number | string }>
    verses?: Array<{
      verse_key?: string
      words?: Array<{ char_type?: string; text?: string; highlight?: boolean }>
      translations?: Array<{
        resource_id?: number
        resource_name?: string
        text?: string
      }>
    }>
  }
  pagination?: {
    per_page?: number
    current_page?: number
    next_page?: number | null
    total_pages?: number
    total_records?: number
  }
}

function parseVerseKey(verseKey: string): { chapterId: number; verseNumber: number } {
  const [s, a] = verseKey.split(":")
  return { chapterId: Number(s) || 0, verseNumber: Number(a) || 0 }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const raw = searchParams.get("q")?.trim() ?? ""
  if (!raw || raw.length > 100) {
    return NextResponse.json({ error: "q must be 1–100 characters" }, { status: 400 })
  }

  const size = Math.min(20, Math.max(1, Number(searchParams.get("size") ?? 20) || 20))
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)
  // "arabic" | "translation" | anything else (including absent/"all") — this
  // was previously read by the mobile app's scope filter chips and silently
  // dropped here, so switching scopes never actually changed the results.
  const scope = searchParams.get("scope")

  const url = `${QDC_SEARCH_URL}?q=${encodeURIComponent(raw)}&size=${size}&page=${page}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    })

    if (!res.ok) {
      throw new Error(`QDC search error ${res.status}`)
    }

    const data = (await res.json()) as QdcSearchResponse
    const verses = data.result?.verses ?? []
    const pagination = data.pagination

    const results: SearchResult[] = verses.map((r) => {
      const verse_key = r.verse_key ?? ""
      const { chapterId, verseNumber } = parseVerseKey(verse_key)
      return {
        verse_key,
        chapter_id: chapterId,
        verse_number: verseNumber,
        words: (r.words ?? [])
          .filter((w) => w.char_type !== "end")
          .map((w) => ({
            text: w.text ?? "",
            highlight: w.highlight ?? false,
          })),
        translations: (r.translations ?? []).map((t) => ({
          resource_id: t.resource_id ?? 0,
          text: t.text ?? "",
        })),
      }
    })

    // Post-filter rather than a QDC-side param — QDC's search API has no
    // documented "search only Arabic / only translation" mode, but every
    // result already carries both, so scoping down to whichever matched is
    // just a filter here. "arabic" keeps results QDC itself flagged via
    // word.highlight. "translation" keeps results whose translation text
    // contains a QDC-inserted <em> tag — QDC marks its own translation
    // matches this way (see SearchHighlightText on the mobile client, which
    // parses these same tags to render highlights), so this reuses QDC's
    // actual match detection rather than re-guessing it with a substring
    // check that could diverge (stemming, pluralization, etc.).
    // totalCount/nextPage still reflect QDC's unscoped pagination —
    // recomputing an accurate scoped total would mean fetching and filtering
    // every page up front, which isn't worth it for a lightweight filter.
    const scopedResults =
      scope === "arabic"
        ? results.filter((r) => r.words.some((w) => w.highlight))
        : scope === "translation"
          ? results.filter((r) =>
              r.translations.some((t) => t.text.includes("<em>")),
            )
          : results

    const payload: SearchResponse = {
      results: scopedResults,
      totalCount: pagination?.total_records ?? 0,
      currentPage: pagination?.current_page ?? page,
      nextPage: pagination?.next_page ?? null,
    }

    return NextResponse.json(payload, {
      headers: {
        // Short browser cache — search is query-specific; avoid sticky empty
        // responses after a mapping fix. CDN can still soft-revalidate.
        "Cache-Control": "private, max-age=60, stale-while-revalidate=86400",
      },
    })
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
