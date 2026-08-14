"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { searchQuran } from "@/lib/searchApi"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { SearchResult } from "@/types/study"
import { SearchResultItem } from "./SearchResultItem"
import { SearchEmptyState } from "./SearchEmptyState"

type Status = "idle" | "loading" | "done" | "error"

const DEBOUNCE_MS = 300
const MAX_RECENT = 5

interface SearchPageClientProps {
  initialQuery: string
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<Status>(initialQuery ? "loading" : "idle")
  const [totalCount, setTotalCount] = useState(0)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    "rq-recent-searches",
    [],
  )

  // Refs to prevent stale closures and race conditions
  const latestQuery = useRef(query)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstSearch = useRef(true)

  const pushRecent = useCallback(
    (q: string) => {
      if (!q.trim()) return
      setRecentSearches((prev) => {
        const filtered = prev.filter((r) => r !== q)
        return [q, ...filtered].slice(0, MAX_RECENT)
      })
    },
    [setRecentSearches],
  )

  const runSearch = useCallback(
    async (q: string, page = 1, append = false) => {
      if (!q.trim()) {
        setStatus("idle")
        setResults([])
        setTotalCount(0)
        setNextPage(null)
        return
      }

      if (!append) setStatus("loading")
      else setLoadingMore(true)

      try {
        const data = await searchQuran(q, page)

        // Discard if a newer query has taken over
        if (q !== latestQuery.current) return

        setResults((prev) => (append ? [...prev, ...data.results] : data.results))
        setTotalCount(data.totalCount)
        setNextPage(data.nextPage)
        setStatus("done")
        if (!append) pushRecent(q)
      } catch {
        if (q !== latestQuery.current) return
        setStatus("error")
      } finally {
        setLoadingMore(false)
      }
    },
    [pushRecent],
  )

  // Debounce input changes (skip delay for shareable-URL initial query)
  useEffect(() => {
    latestQuery.current = query

    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Sync URL without creating history entries
    router.replace(query ? `/search?q=${encodeURIComponent(query)}` : "/search", {
      scroll: false,
    })

    const delay =
      isFirstSearch.current && initialQuery && query === initialQuery
        ? 0
        : DEBOUNCE_MS
    isFirstSearch.current = false
    debounceRef.current = setTimeout(() => runSearch(query), delay)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, router, runSearch, initialQuery])

  function handleLoadMore() {
    if (nextPage) runSearch(latestQuery.current, nextPage, true)
  }

  function handleRetry() {
    runSearch(latestQuery.current)
  }

  const showResults = status === "done" && results.length > 0
  const showEmpty =
    (status === "done" && results.length === 0) ||
    status === "idle" ||
    status === "error"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in Arabic or English…"
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-ring transition-[box-shadow] duration-[120ms] focus:ring-2"
        />
      </div>

      {/* Result count */}
      {status === "done" && results.length > 0 && (
        <p className="mb-4 text-xs text-muted-foreground">
          {totalCount.toLocaleString()} result{totalCount !== 1 ? "s" : ""} for{" "}
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/60" />
          ))}
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-2">
          {results.map((result) => (
            <SearchResultItem key={result.verse_key} result={result} />
          ))}
        </div>
      )}

      {/* Load more */}
      {showResults && nextPage && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {/* Empty / idle / error */}
      {showEmpty && (
        <SearchEmptyState
          status={status}
          query={query}
          recentSearches={recentSearches}
          onRecentClick={(q) => setQuery(q)}
          onRetry={handleRetry}
        />
      )}
    </div>
  )
}
