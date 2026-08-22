"use client"

import { useRipple } from "@/hooks/useRipple"
import { cn } from "@/lib/utils"

export type SurahFilterValue = "all" | "makkah" | "madinah"

const OPTIONS: { value: SurahFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "makkah", label: "Makki" },
  { value: "madinah", label: "Madani" },
]

/**
 * Revelation-place filter for the Surah Explorer carousel.
 *
 * Controlled: the carousel now lives in a client component (`SurahExplorer`,
 * required for the Embla instance), so there is no longer a server-rendered
 * list to filter by attribute — the filter value lives in the parent and
 * drives which chapters are passed to Embla as slides.
 */
export function SurahFilter({
  value,
  onChange,
}: {
  value: SurahFilterValue
  onChange: (value: SurahFilterValue) => void
}) {
  const ripple = useRipple<HTMLButtonElement>()

  return (
    <div
      role="group"
      aria-label="Filter surahs by place of revelation"
      className="flex flex-wrap gap-1.5"
    >
      {OPTIONS.map(({ value: optionValue, label }) => {
        const selected = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(optionValue)}
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
