import { NextResponse } from "next/server"
import { getChapter, getVersesPage, slimVerse, getAllVerses } from "@/lib/quranApi"

interface RouteContext {
  params: Promise<{ surahId: string }>
}

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
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

      return NextResponse.json(
        {
          chapter,
          verses: pageData.verses,
          pagination: pageData.pagination,
        },
        { headers: CACHE_HEADERS },
      )
    }

    const [chapter, verses] = await Promise.all([
      getChapter(id),
      getAllVerses(id),
    ])

    if (!chapter) {
      return NextResponse.json({ error: "Surah not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        chapter,
        verses: verses.map(slimVerse),
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: verses.length,
        },
      },
      { headers: CACHE_HEADERS },
    )
  } catch {
    return NextResponse.json({ error: "Failed to load surah" }, { status: 500 })
  }
}
