"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import type { Chapter, PaginationMeta, Verse } from "@/types/quran"

interface SurahPayload {
  chapter: Chapter
  verses: Verse[]
}

interface SurahPagePayload extends SurahPayload {
  pagination: PaginationMeta
}

interface SurahContentContextValue {
  chapter: Chapter | null
  verses: Verse[]
  surahId: number | null
  pendingSurahId: number | null
  targetAyahId: number | undefined
  isLoading: boolean
  loadSurah: (id: number, targetAyahId?: number) => void
  prefetchSurah: (id: number) => void
  /** Full payload from legacy hydrate (complete verses) */
  hydrate: (payload: SurahPayload & { targetAyahId?: number }) => void
  /** SSR bootstrap: chapter only — verses load progressively on the client */
  bootstrap: (chapter: Chapter, targetAyahId?: number) => void
  /**
   * Infinite scroll: whichever surah is currently appended and highest in
   * the stack — the fetch cursor for "what comes next". Null once nothing
   * has bootstrapped yet, 114 once the Quran is fully appended.
   */
  latestSurahId: number | null
  /** Infinite scroll: fetch and append (surahId + 1)'s verses below the current stack. */
  appendNextSurah: () => void
  /** Infinite scroll: true while an append fetch is in flight. */
  isAppending: boolean
  /**
   * Infinite scroll: whichever surah is currently centered in the viewport
   * as the reader scrolls through appended content. Deliberately separate
   * from `surahId` (which stays pinned to the base/route surah) so features
   * scoped to the base surah — like the hide-Arabic memorisation range —
   * aren't disturbed by scroll drift.
   */
  activeSurahId: number | null
  setActiveSurah: (id: number) => void
}

const SurahContentContext = createContext<SurahContentContextValue | null>(null)

function parseSurahId(pathname: string): number | null {
  const match = pathname.match(/^\/(\d+)(?:\/|$)/)
  if (!match) return null
  const id = Number(match[1])
  return id >= 1 && id <= 114 ? id : null
}

function hasTargetAyah(verses: Verse[], targetAyahId?: number): boolean {
  if (!targetAyahId) return true
  return verses.some((v) => v.verse_number === targetAyahId)
}

export function SurahContentProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [surahId, setSurahId] = useState<number | null>(null)
  const [pendingSurahId, setPendingSurahId] = useState<number | null>(null)
  const [targetAyahId, setTargetAyahId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [latestSurahId, setLatestSurahIdState] = useState<number | null>(null)
  const [isAppending, setIsAppending] = useState(false)
  const [activeSurahId, setActiveSurahIdState] = useState<number | null>(null)

  const cacheRef = useRef<Map<number, SurahPayload>>(new Map())
  const inflightRef = useRef<Map<number, Promise<SurahPayload>>>(new Map())
  const hydratedRef = useRef(false)
  const loadingRef = useRef(false)
  const loadGenerationRef = useRef(0)

  // Infinite-scroll append state — the base surah's own verses plus zero or
  // more surahs appended below it, kept as separate segments and flattened
  // on demand so a long appended surah's own progressive page-loads don't
  // require re-merging earlier segments.
  const baseSurahIdRef = useRef<number | null>(null)
  const baseVersesRef = useRef<Verse[]>([])
  const appendedSegmentsRef = useRef<Map<number, Verse[]>>(new Map())
  const appendedOrderRef = useRef<number[]>([])
  const latestSurahIdRef = useRef<number | null>(null)
  const isAppendingRef = useRef(false)
  const activeSurahIdRef = useRef<number | null>(null)

  const fetchPage = useCallback(
    async (id: number, page: number): Promise<SurahPagePayload> => {
      const res = await fetch(`/api/surah/${id}?page=${page}`)
      if (!res.ok) throw new Error(`Surah ${id} page ${page} failed to load`)
      return res.json() as Promise<SurahPagePayload>
    },
    [],
  )

  /**
   * Progressive load: paint page 1 ASAP, then merge remaining pages.
   * Completes into the in-memory cache only when all pages are present.
   */
  const fetchSurahProgressive = useCallback(
    async (
      id: number,
      opts?: {
        targetAyahId?: number
        onPartial?: (payload: SurahPayload, readyForTarget: boolean) => void
      },
    ): Promise<SurahPayload> => {
      const cached = cacheRef.current.get(id)
      if (cached) {
        opts?.onPartial?.(cached, true)
        return cached
      }

      const inflight = inflightRef.current.get(id)
      if (inflight) {
        const data = await inflight
        opts?.onPartial?.(data, true)
        return data
      }

      const request = (async (): Promise<SurahPayload> => {
        const first = await fetchPage(id, 1)
        let merged = first.verses

        opts?.onPartial?.(
          { chapter: first.chapter, verses: merged },
          hasTargetAyah(merged, opts.targetAyahId),
        )

        if (first.pagination.total_pages > 1) {
          const rest = await Promise.all(
            Array.from({ length: first.pagination.total_pages - 1 }, (_, i) =>
              fetchPage(id, i + 2).then((r) => r.verses),
            ),
          )
          // Sort by mushaf page, then verse_key — not raw verse_number alone.
          // Boundary pages can carry a neighboring surah's verses (see
          // withPageBoundaries in the API route), whose verse_number resets
          // to 1 just like this surah's own, so a verse_number-only sort
          // would interleave them.
          merged = [...first.verses, ...rest.flat()].sort((a, b) => {
            if (a.page_number !== b.page_number) return a.page_number - b.page_number
            const [aSurah, aAyah] = a.verse_key.split(":").map(Number)
            const [bSurah, bAyah] = b.verse_key.split(":").map(Number)
            return aSurah !== bSurah ? aSurah - bSurah : aAyah - bAyah
          })
        }

        const complete: SurahPayload = {
          chapter: first.chapter,
          verses: merged,
        }
        cacheRef.current.set(id, complete)
        opts?.onPartial?.(complete, true)
        return complete
      })()
        .catch((err) => {
          inflightRef.current.delete(id)
          throw err
        })
        .then((data) => {
          inflightRef.current.delete(id)
          return data
        })

      inflightRef.current.set(id, request)
      return request
    },
    [fetchPage],
  )

  const setLatestSurahId = useCallback((id: number | null) => {
    latestSurahIdRef.current = id
    setLatestSurahIdState(id)
  }, [])

  /**
   * Flatten base + appended segments into the single `verses` array the
   * reader renders, deduping by verse_key. Dedup matters because mushaf
   * page-boundary sharing (see withPageBoundaries in the API route) means a
   * surah's own last page and the next surah's own first page can each
   * independently pull in the same shared-page verses.
   */
  const recomputeVerses = useCallback(() => {
    const seen = new Set<string>()
    const all: Verse[] = []
    for (const v of baseVersesRef.current) {
      if (seen.has(v.verse_key)) continue
      seen.add(v.verse_key)
      all.push(v)
    }
    for (const id of appendedOrderRef.current) {
      const segment = appendedSegmentsRef.current.get(id)
      if (!segment) continue
      for (const v of segment) {
        if (seen.has(v.verse_key)) continue
        seen.add(v.verse_key)
        all.push(v)
      }
    }
    // A surah's own segment can arrive after a neighboring surah's fetch
    // has already pulled in a couple of its boundary verses (same
    // withPageBoundaries sharing), so simple concatenation can leave a
    // segment internally out of order (e.g. ayahs 3,4 landing before 1,2).
    // Re-sort with the same comparator fetchSurahProgressive already uses,
    // so cross-segment ordering is always consistent regardless of which
    // segment a given verse happened to arrive through.
    all.sort((a, b) => {
      if (a.page_number !== b.page_number) return a.page_number - b.page_number
      const [aSurah, aAyah] = a.verse_key.split(":").map(Number)
      const [bSurah, bAyah] = b.verse_key.split(":").map(Number)
      return aSurah !== bSurah ? aSurah - bSurah : aAyah - bAyah
    })
    setVerses(all)
  }, [])

  /** New base surah incoming — clear the append stack it replaces. */
  const resetAppendState = useCallback(
    (id: number) => {
      baseSurahIdRef.current = id
      baseVersesRef.current = []
      appendedSegmentsRef.current = new Map()
      appendedOrderRef.current = []
      isAppendingRef.current = false
      setIsAppending(false)
      activeSurahIdRef.current = null
      setActiveSurahIdState(null)
      setLatestSurahId(id)
    },
    [setLatestSurahId],
  )

  const applyPayload = useCallback(
    (payload: SurahPayload, nextTargetAyahId?: number) => {
      if (baseSurahIdRef.current !== payload.chapter.id) {
        resetAppendState(payload.chapter.id)
      }
      baseVersesRef.current = payload.verses
      setChapter(payload.chapter)
      setSurahId(payload.chapter.id)
      setTargetAyahId(nextTargetAyahId)
      hydratedRef.current = true
      recomputeVerses()
    },
    [recomputeVerses, resetAppendState],
  )

  const hydrate = useCallback(
    (payload: SurahPayload & { targetAyahId?: number }) => {
      cacheRef.current.set(payload.chapter.id, {
        chapter: payload.chapter,
        verses: payload.verses,
      })
      applyPayload(payload, payload.targetAyahId)
    },
    [applyPayload],
  )

  const bootstrap = useCallback(
    (nextChapter: Chapter, nextTargetAyahId?: number) => {
      const generation = ++loadGenerationRef.current
      const cached = cacheRef.current.get(nextChapter.id)

      setTargetAyahId(nextTargetAyahId)
      hydratedRef.current = true

      if (cached) {
        applyPayload(cached, nextTargetAyahId)
        setIsLoading(false)
        setPendingSurahId(null)
        loadingRef.current = false
        return
      }

      // Show chapter chrome immediately; verses stream in
      resetAppendState(nextChapter.id)
      setChapter(nextChapter)
      setSurahId(nextChapter.id)
      setVerses([])
      loadingRef.current = true
      setIsLoading(true)
      setPendingSurahId(nextChapter.id)

      void fetchSurahProgressive(nextChapter.id, {
        targetAyahId: nextTargetAyahId,
        onPartial: (payload, readyForTarget) => {
          if (generation !== loadGenerationRef.current) return
          applyPayload(payload, nextTargetAyahId)
          if (readyForTarget) {
            loadingRef.current = false
            setIsLoading(false)
            setPendingSurahId(null)
          }
        },
      })
        .catch(() => {
          if (generation !== loadGenerationRef.current) return
          loadingRef.current = false
          setIsLoading(false)
          setPendingSurahId(null)
        })
    },
    [applyPayload, fetchSurahProgressive, resetAppendState],
  )

  const prefetchSurah = useCallback(
    (id: number) => {
      void fetchSurahProgressive(id).catch(() => undefined)
      router.prefetch(`/${id}`)
    },
    [fetchSurahProgressive, router],
  )

  const loadSurah = useCallback(
    (id: number, nextTargetAyahId?: number) => {
      if (loadingRef.current && pendingSurahId === id) return
      if (id === surahId && verses.length > 0 && !loadingRef.current) {
        if (nextTargetAyahId) {
          setTargetAyahId(nextTargetAyahId)
          router.push(`/${id}/${nextTargetAyahId}`, { scroll: false })
        }
        return
      }

      const generation = ++loadGenerationRef.current
      loadingRef.current = true
      setIsLoading(true)
      setPendingSurahId(id)
      setTargetAyahId(nextTargetAyahId)

      const href = nextTargetAyahId ? `/${id}/${nextTargetAyahId}` : `/${id}`
      router.push(href, { scroll: false })

      void fetchSurahProgressive(id, {
        targetAyahId: nextTargetAyahId,
        onPartial: (payload, readyForTarget) => {
          if (generation !== loadGenerationRef.current) return
          applyPayload(payload, nextTargetAyahId)
          if (readyForTarget) {
            loadingRef.current = false
            setIsLoading(false)
            setPendingSurahId(null)
          }
        },
      })
        .catch(() => {
          if (generation !== loadGenerationRef.current) return
          loadingRef.current = false
          setIsLoading(false)
          setPendingSurahId(null)
        })
    },
    [
      applyPayload,
      fetchSurahProgressive,
      pendingSurahId,
      router,
      surahId,
      verses.length,
    ],
  )

  const appendNextSurah = useCallback(() => {
    if (isAppendingRef.current) return
    const current = latestSurahIdRef.current
    if (current == null || current >= 114) return
    const nextId = current + 1
    if (appendedSegmentsRef.current.has(nextId)) return

    const baseAtStart = baseSurahIdRef.current
    isAppendingRef.current = true
    setIsAppending(true)
    appendedOrderRef.current.push(nextId)
    setLatestSurahId(nextId)

    void fetchSurahProgressive(nextId, {
      onPartial: (payload) => {
        if (baseSurahIdRef.current !== baseAtStart) return
        appendedSegmentsRef.current.set(nextId, payload.verses)
        recomputeVerses()
      },
    })
      .catch(() => {
        if (baseSurahIdRef.current !== baseAtStart) return
        // Silent failure — roll the cursor back so the sentinel can retry
        // later, matching the reader's "never block reading" convention.
        appendedOrderRef.current = appendedOrderRef.current.filter((id) => id !== nextId)
        appendedSegmentsRef.current.delete(nextId)
        setLatestSurahId(current)
        recomputeVerses()
      })
      .finally(() => {
        if (baseSurahIdRef.current !== baseAtStart) return
        isAppendingRef.current = false
        setIsAppending(false)
      })
  }, [fetchSurahProgressive, recomputeVerses, setLatestSurahId])

  const setActiveSurah = useCallback((id: number) => {
    if (activeSurahIdRef.current === id) return
    activeSurahIdRef.current = id
    setActiveSurahIdState(id)
  }, [])

  useEffect(() => {
    const id = parseSurahId(pathname)
    // usePathname() also reacts to the plain window.history.replaceState
    // calls infinite scroll makes as the active surah advances — id ===
    // activeSurahIdRef.current means this pathname change is us reporting
    // a surah whose content is already loaded via the append stack, not a
    // real navigation, so there's nothing to (re)fetch.
    if (
      !id ||
      !hydratedRef.current ||
      id === surahId ||
      id === activeSurahIdRef.current ||
      loadingRef.current
    ) {
      return
    }

    const generation = ++loadGenerationRef.current
    loadingRef.current = true
    setIsLoading(true)
    setPendingSurahId(id)
    setTargetAyahId(undefined)

    void fetchSurahProgressive(id, {
      onPartial: (payload, readyForTarget) => {
        if (generation !== loadGenerationRef.current) return
        applyPayload(payload)
        if (readyForTarget) {
          loadingRef.current = false
          setIsLoading(false)
          setPendingSurahId(null)
        }
      },
    })
      .catch(() => {
        if (generation !== loadGenerationRef.current) return
        loadingRef.current = false
        setIsLoading(false)
        setPendingSurahId(null)
      })
  }, [pathname, surahId, fetchSurahProgressive, applyPayload])

  return (
    <SurahContentContext.Provider
      value={{
        chapter,
        verses,
        surahId,
        pendingSurahId,
        targetAyahId,
        isLoading,
        loadSurah,
        prefetchSurah,
        hydrate,
        bootstrap,
        latestSurahId,
        appendNextSurah,
        isAppending,
        activeSurahId,
        setActiveSurah,
      }}
    >
      {children}
    </SurahContentContext.Provider>
  )
}

export function useSurahContent() {
  const ctx = useContext(SurahContentContext)
  if (!ctx) {
    throw new Error("useSurahContent must be used within SurahContentProvider")
  }
  return ctx
}

export function useSurahContentOptional() {
  return useContext(SurahContentContext)
}
