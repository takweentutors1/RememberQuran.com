"use client"

import { useState } from "react"
import { useRipple } from "@/hooks/useRipple"
import { cn } from "@/lib/utils"

export type SurahFilterValue = "all" | "makkah" | "madinah"

const OPTIONS: { value: SurahFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "makkah", label: "Makki" },
  { value: "madinah", label: "Madani" },
]

/**
 * Revelation-place filter for the 114-surah grid.
 *
 * Deliberately does *not* own the list. It writes `data-filter` onto the grid
 * container and CSS does the hiding (see globals.css). That keeps all 114
 * cards as server-rendered RSC output — no hydration of the list, no client
 * re-render on filter change, and the filter costs one attribute write.
 *
 * Filtering by attribute also means the DOM order is stable, so browser
 * find-in-page and back/forward scroll restoration keep working.
 */
export function SurahFilter({ targetId }: { targetId: string }) {
  const [active, setActive] = useState<SurahFilterValue>("all")
  const ripple = useRipple<HTMLButtonElement>()

  function apply(value: SurahFilterValue) {
    setActive(value)
    document.getElementById(targetId)?.setAttribute("data-filter", value)
  }

  return (
    <div
      role="group"
      aria-label="Filter surahs by place of revelation"
      className="flex flex-wrap gap-1.5"
    >
      {OPTIONS.map(({ value, label }) => {
        const selected = active === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => apply(value)}
            onPointerDown={ripple.onPointerDown}
            className={cn(
              "ripple-host rounded-full border px-3 py-1.5 text-xs font-medium",
              "transition-[transform,background-color,border-color,color] duration-(--dur-base) ease-(--ease-out)",
              "hover:-translate-y-px active:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-strong hover:text-foreground",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
