"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Pure Circular Medallion (علامة نهاية الآية الدائرية النقية)
 * Pure, clean single circle medallion with bold centered Uthmanic Hafs calligraphy numeral.
 * Scaled up by 20% for optimal readability.
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size scaled +20%
  const svgFontSize = digitCount >= 3 ? "12.5px" : digitCount === 2 ? "15px" : "18px"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center w-[1.38em] h-[1.38em] shrink-0">
     
          {/* Clean Single Medallion Ring */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          {/* Centered Uthmanic Numeral */}
          <text
            x="12"
            y="12"
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            style={{
              fontFamily: '"UthmanicHafs", "KFGQPC Uthmanic Hafs", serif',
              fontWeight: "bold",
              fontSize: svgFontSize,
              letterSpacing: "0",
            }}
          >
            {digits}
          </text>
      
      </span>
    </span>
  )
}
