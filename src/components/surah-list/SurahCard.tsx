import Link from "next/link"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahCardProps {
  chapter: Chapter
}

/**
 * Home chapter tile.
 *
 * The surah number sits inside an 8-point rosette — the classic "rub el
 * hizb" star (two overlapping squares) used to mark divisions in the mushaf
 * — rendered as a real SVG so its two squares can bloom independently on
 * hover rather than a single frame flipping in place. `size-10` keeps the
 * ornament at a fixed 40×40 badge that scales with the root font size (zoom,
 * user font-size preferences) exactly like every other rem-sized control on
 * the page, so it stays correct at any viewport.
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
      <span className="relative grid size-10 shrink-0 place-items-center">
        <svg
          aria-hidden
          viewBox="0 0 40 40"
          className="absolute inset-0 size-full text-muted-foreground transition-colors duration-(--dur-slow) ease-(--ease-out) group-hover:text-gold"
        >
          <rect
            x="8"
            y="8"
            width="24"
            height="24"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            style={{ transformOrigin: "20px 20px" }}
            className="transition-transform duration-(--dur-slow) ease-(--ease-out) group-hover:-rotate-[14deg]"
          />
          <g transform="rotate(45 20 20)">
            <rect
              x="8"
              y="8"
              width="24"
              height="24"
              rx="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              style={{ transformOrigin: "20px 20px" }}
              className="transition-transform duration-(--dur-slow) ease-(--ease-out) group-hover:rotate-[59deg]"
            />
          </g>
        </svg>
        <span
          data-numeric
          className="relative text-xs font-medium text-muted-foreground transition-colors duration-(--dur-slow) ease-(--ease-out) group-hover:text-gold"
        >
          {chapter.id}
        </span>
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
