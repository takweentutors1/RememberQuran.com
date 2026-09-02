"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf CSS Circular Medallion (علامة نهاية الآية الدائرية)
 * Pure CSS round badge without SVG tags with bold centered Uthmanic Hafs numeral.
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic font size for 1, 2, or 3 digits
  const fontStyle =
    digitCount >= 3
      ? "text-[0.55em] tracking-tighter"
      : digitCount === 2
        ? "text-[0.68em] tracking-tight"
        : "text-[0.78em]"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-1",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "w-[1.25em] h-[1.25em] rounded-full",
          "border-[1.5px] border-current",
          "text-[#1A1612] dark:text-[#EDE6DA]",
          "font-bold font-uthmani leading-none",
          fontStyle,
        )}
        style={{
          fontFamily: '"UthmanicHafs", "KFGQPC Uthmanic Hafs", serif',
        }}
      >
        {digits}
      </span>
    </span>
  )
}
