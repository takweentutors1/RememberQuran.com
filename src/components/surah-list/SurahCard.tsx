import Link from "next/link"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahCardProps {
  chapter: Chapter
}

/**
 * Home chapter tile.
 *
 * The surah number sits inside a diamond frame — a manuscript ornament that
 * rotates 45° → 90° and takes on gold as the pointer approaches. The frame is
 * a `::before` pseudo-element (see the `diamond-frame` utility in globals.css)
 * rather than an inline SVG: it costs no DOM nodes, and with 114 of these on
 * the page that difference is measurable.
 *
 * The Arabic name is the visual anchor on the trailing edge.
 */
export function SurahCard({ chapter }: SurahCardProps) {
  const isMakki = chapter.revelation_place === "makkah"

  return (
    <Link
      href={`/${chapter.id}`}
      className={cn(
        "group lift relative flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span
        data-numeric
        className="diamond-frame size-10 shrink-0 text-xs font-medium text-muted-foreground transition-colors duration-(--dur-slow) ease-(--ease-out) group-hover:text-gold"
      >
        {chapter.id}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium leading-tight text-foreground">
          {chapter.name_simple}
        </span>
        <span className="mt-0.5 block truncate text-xs text-subtle">
          {chapter.translated_name.name}
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-subtle">
          <span data-numeric>{chapter.verses_count} ayahs</span>
          <span aria-hidden>·</span>
          <span
            className={cn(
              "rounded px-1.5 py-px text-[10px] font-medium leading-none",
              isMakki
                ? "bg-gold-soft text-gold-strong"
                : "bg-accent text-accent-foreground",
            )}
          >
            {isMakki ? "Makki" : "Madani"}
          </span>
        </span>
      </span>

      <span
        className="shrink-0 font-uthmani text-[26px] leading-none text-reader-ink/85 transition-colors duration-(--dur-base) ease-(--ease-out) group-hover:text-reader-ink"
        dir="rtl"
        lang="ar"
      >
        {chapter.name_arabic}
      </span>
    </Link>
  )
}
