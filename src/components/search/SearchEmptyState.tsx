"use client"

import { RotateCcw, Clock, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchEmptyStateProps {
  status: "idle" | "loading" | "done" | "error"
  query: string
  recentSearches: string[]
  onRecentClick: (q: string) => void
  onRetry: () => void
}

export function SearchEmptyState({
  status,
  query,
  recentSearches,
  onRecentClick,
  onRetry,
}: SearchEmptyStateProps) {
  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/40 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Search failed — check your connection and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium",
            "transition-colors duration-[120ms] hover:bg-accent/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <RotateCcw className="size-3" strokeWidth={2} />
          Retry
        </button>
      </div>
    )
  }

  if (status === "done" && query) {
    return (
      <div className="py-8 text-center">
        <Search className="mx-auto mb-3 size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No results for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try a different word, or search in Arabic without diacritics.
        </p>
      </div>
    )
  }

  // Idle state
  return (
    <div className="py-4">
      <p className="mb-4 text-xs text-muted-foreground">
        Search by keyword in English or Arabic — results show the matching ayah and
        translation.
      </p>

      {recentSearches.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3" />
            Recent
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onRecentClick(q)}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground",
                  "transition-colors duration-[120ms] hover:bg-accent hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
