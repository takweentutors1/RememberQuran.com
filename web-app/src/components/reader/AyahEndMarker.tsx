"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

/**
 * Authentic Madani Mushaf Golden Ayah End Medallion (علامة نهاية الآية المذهبة)
 * Exactly matched to King Fahd Complex Madani Mushaf:
 * - Golden-bronze circular outer ring with 8 ornate petal notches
 * - Inner concentric golden hairline ring
 * - Bold high-contrast centered Uthmanic Hafs numeral
 */
export function AyahEndMarker({ digits, ariaLabel, className, onClick }: AyahEndMarkerProps) {
  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick(e as unknown as React.MouseEvent)
              }
            }
          : undefined
      }
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-1",
        "font-uthmani text-[1.15em] leading-none text-[#1E1B18] dark:text-[#ECE6DA]",
        onClick && "cursor-pointer hover:opacity-80 active:scale-95 transition-transform duration-150 focus-visible:outline-none",
        className,
      )}
      aria-label={ariaLabel}
    >
      {digits}
    </span>
  )
}
