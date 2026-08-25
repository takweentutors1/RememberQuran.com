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
  loadSurah: (id: number) => void
  prefetchSurah: (id: number) => void
  /** Full payload from legacy hydrate (complete verses) */
  hydrate: (payload: SurahPayload & { targetAyahId?: number }) => void
  /** SSR bootstrap: chapter only — verses load progressively on the client */
  bootstrap: (chapter: Chapter, targetAyahId?: number) => void
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

  const cacheRef = useRef<Map<number, SurahPayload>>(new Map())
  const inflightRef = useRef<Map<number, Promise<SurahPayload>>>(new Map())
  const hydratedRef = useRef(false)
  const loadingRef = useRef(false)
  const loadGenerationRef = useRef(0)

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
          merged = [...first.verses, ...rest.flat()].sort(
            (a, b) => a.verse_number - b.verse_number,
          )
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

  const applyPayload = useCallback(
    (payload: SurahPayload, nextTargetAyahId?: number) => {
      setChapter(payload.chapter)
      setVerses(payload.verses)
      setSurahId(payload.chapter.id)
      setTargetAyahId(nextTargetAyahId)
      hydratedRef.current = true
    },
    [],
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
          setChapter(payload.chapter)
          setVerses(payload.verses)
          setSurahId(payload.chapter.id)
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
    [applyPayload, fetchSurahProgressive],
  )

  const prefetchSurah = useCallback(
    (id: number) => {
      void fetchSurahProgressive(id).catch(() => undefined)
      router.prefetch(`/${id}`)
    },
    [fetchSurahProgressive, router],
  )

  const loadSurah = useCallback(
    (id: number) => {
      if (loadingRef.current && pendingSurahId === id) return
      if (id === surahId && verses.length > 0 && !loadingRef.current) return

      const generation = ++loadGenerationRef.current
      loadingRef.current = true
      setIsLoading(true)
      setPendingSurahId(id)
      setTargetAyahId(undefined)
      router.push(`/${id}`, { scroll: false })

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

  useEffect(() => {
    const id = parseSurahId(pathname)
    if (!id || !hydratedRef.current || id === surahId || loadingRef.current) {
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
