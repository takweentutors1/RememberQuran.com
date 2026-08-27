"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"
import { SurahCard } from "./SurahCard"
import { SurahFilter, type SurahFilterValue } from "./SurahFilter"

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

function matchesQuery(chapter: Chapter, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  return (
    chapter.name_simple.toLowerCase().includes(q) ||
    chapter.name_complex.toLowerCase().includes(q) ||
    chapter.translated_name.name.toLowerCase().includes(q) ||
    chapter.name_arabic.includes(query.trim()) ||
    String(chapter.id) === q
  )
}

function SurahSearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative w-full max-w-[15rem]">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.8}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search surahs…"
        aria-label="Search surahs by name or number"
        className={cn(
          "h-8 w-full rounded-full border border-border bg-card py-1 pl-8 pr-7 text-xs",
          "transition-colors duration-(--dur-base) ease-(--ease-out)",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

/**
 * Full-directory explorer for the 114 surahs. Chapters wrap into a
 * responsive CSS grid instead of a single scrolling row: `auto-fill` with a
 * `minmax` floor lets the browser pick the column count per breakpoint —
 * one column on a phone, up to roughly ten on an ultrawide desktop — so
 * there's no breakpoint list to maintain and no card is ever squeezed
 * narrower than it can lay out its content.
 *
 * The revelation-place filter lives here as plain state rather than a DOM
 * attribute: the list is already client-rendered for search, so there is no
 * server-rendered output left to preserve by filtering-by-attribute.
 */
export function SurahExplorer({ chapters }: { chapters: Chapter[] }) {
  const [filter, setFilter] = useState<SurahFilterValue>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () =>
      chapters
        .filter((c) => filter === "all" || c.revelation_place === filter)
        .filter((c) => matchesQuery(c, query)),
    [chapters, filter, query],
  )

  return (
    <section aria-labelledby="all-surahs-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
            Directory
          </p>
          <h2
            id="all-surahs-heading"
            className="mt-1 text-xl font-medium tracking-tight"
          >
            {filtered.length} {filtered.length === 1 ? "surah" : "surahs"}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SurahSearchInput value={query} onChange={setQuery} />
          <SurahFilter value={filter} onChange={setFilter} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No surahs match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div
          dir="rtl"
          className={cn(
            "grid gap-3",
            "[grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]",
          )}
          role="list"
          aria-label="List of surahs"
        >
          {filtered.map((chapter) => (
            <div key={chapter.id} role="listitem">
              <SurahCard chapter={chapter} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
