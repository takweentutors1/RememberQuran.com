import { NextResponse } from "next/server"
import { getChapter, getVersesPage, slimVerse, getAllVerses, getVersesByPage } from "@/lib/quranApi"
import type { Verse } from "@/types/quran"

interface RouteContext {
  params: Promise<{ surahId: string }>
}

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
}

/**
 * Reading mode renders whole Madani-mushaf pages, and short surahs routinely
 * share a page with their neighbor (e.g. page 597 holds all of At-Tin *and*
 * the start of Al-'Alaq). A per-surah verse fetch alone can never produce
 * that — it only has this surah's own ayahs — so wherever this surah's
 * first or last mushaf page might be shared, pull in the complete page and
 * merge any verses that belong to the neighboring surah.
 */
async function withPageBoundaries(
  verses: Verse[],
  opts: { includesFirstAyah: boolean; includesLastAyah: boolean },
): Promise<Verse[]> {
  if (verses.length === 0) return verses

  const pagesToFetch = new Set<number>()
  if (opts.includesFirstAyah) pagesToFetch.add(verses[0].page_number)
  if (opts.includesLastAyah) pagesToFetch.add(verses[verses.length - 1].page_number)
  if (pagesToFetch.size === 0) return verses

  const extraPages = await Promise.all(
    Array.from(pagesToFetch, (p) => getVersesByPage(p).catch(() => [] as Verse[])),
  )

  const known = new Set(verses.map((v) => v.verse_key))
  const merged = [...verses]
  for (const pageVerses of extraPages) {
    for (const v of pageVerses) {
      if (!known.has(v.verse_key)) {
        known.add(v.verse_key)
        merged.push(v)
      }
    }
  }
  if (merged.length === verses.length) return verses

  return merged.sort((a, b) => {
    if (a.page_number !== b.page_number) return a.page_number - b.page_number
    const [aSurah, aAyah] = a.verse_key.split(":").map(Number)
    const [bSurah, bAyah] = b.verse_key.split(":").map(Number)
    return aSurah !== bSurah ? aSurah - bSurah : aAyah - bAyah
  })
}

/**
 * Progressive surah loading:
 * - `?page=1` → first 50 ayahs (fast first paint)
 * - `?page=N` → later pages
 * - no page → full surah (legacy / prefetch of short surahs)
 */
export async function GET(request: Request, context: RouteContext) {
  const { surahId } = await context.params
  const id = Number(surahId)

  if (isNaN(id) || id < 1 || id > 114) {
    return NextResponse.json({ error: "Invalid surah id" }, { status: 400 })
  }

  const pageParam = new URL(request.url).searchParams.get("page")
  const page = pageParam === null ? null : Number(pageParam)

  if (pageParam !== null && (isNaN(page!) || page! < 1)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 })
  }

  try {
    if (page !== null) {
      const [chapter, pageData] = await Promise.all([
        getChapter(id),
        getVersesPage(id, page),
      ])

      if (!chapter) {
        return NextResponse.json({ error: "Surah not found" }, { status: 404 })
      }

      const verses = await withPageBoundaries(pageData.verses, {
        includesFirstAyah: pageData.pagination.current_page === 1,
        includesLastAyah: pageData.pagination.current_page === pageData.pagination.total_pages,
      })

      return NextResponse.json(
        {
          chapter,
          verses,
          pagination: pageData.pagination,
        },
        { headers: CACHE_HEADERS },
      )
    }

    const [chapter, allVerses] = await Promise.all([
      getChapter(id),
      getAllVerses(id),
    ])

    if (!chapter) {
      return NextResponse.json({ error: "Surah not found" }, { status: 404 })
    }

    const verses = await withPageBoundaries(allVerses.map(slimVerse), {
      includesFirstAyah: true,
      includesLastAyah: true,
    })

    return NextResponse.json(
      {
        chapter,
        verses,
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: allVerses.length,
        },
      },
      { headers: CACHE_HEADERS },
    )
  } catch {
    return NextResponse.json({ error: "Failed to load surah" }, { status: 500 })
  }
}
