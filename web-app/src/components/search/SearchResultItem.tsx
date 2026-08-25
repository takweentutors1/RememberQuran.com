"use client"

import Link from "next/link"
import { splitEmHighlights } from "@/lib/searchApi"
import { TRANSLATION_IDS } from "@/lib/translations"
import type { SearchResult } from "@/types/study"
import { cn } from "@/lib/utils"

interface SearchResultItemProps {
  result: SearchResult
}

export function SearchResultItem({ result }: SearchResultItemProps) {
  const { verse_key, chapter_id, verse_number, words, translations } = result
  const href = `/${chapter_id}/${verse_number}`

  // Prefer Saheeh International or Clear Quran; fall back to first available
  const translation =
    translations.find((t) => t.resource_id === TRANSLATION_IDS.SAHEEH_INTERNATIONAL) ??
    translations.find((t) => t.resource_id === TRANSLATION_IDS.CLEAR_QURAN) ??
    translations[0]

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg border border-border bg-background p-4",
        "transition-colors duration-[120ms] hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {/* Verse key badge */}
      <span className="mb-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
        {verse_key}
      </span>

      {/* Arabic words — RTL, highlight matched words */}
      {words.length > 0 && (
        <p
          className="font-arabic mb-2 text-right text-xl leading-loose"
          dir="rtl"
          lang="ar"
        >
          {words.map((w, i) => (
            <span
              key={i}
              className={
                w.highlight ? "font-semibold text-foreground" : "text-muted-foreground"
              }
            >
              {w.text}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      )}

      {/* Translation with <em> highlights split into segments */}
      {translation && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {splitEmHighlights(translation.text).map((seg, i) =>
            seg.highlight ? (
              <span key={i} className="font-medium text-foreground">
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      )}
    </Link>
  )
}
