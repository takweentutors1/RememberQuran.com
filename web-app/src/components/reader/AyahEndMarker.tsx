"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Compact Ayah End Marker (علامة نهاية الآية المفردة)
 * Clean, minimal, authentic black calligraphic emblem without the large outer gold ring:
 * - 8-point scalloped star / octagonal crested ring
 * - Crisp contrast in light & dark mode
 * - Mathematically centered Eastern Arabic numerals
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size for 1, 2, or 3+ digits
  const svgFontSize = digitCount >= 3 ? "11px" : digitCount === 2 ? "13px" : "15.5px"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center size-[1.25em] shrink-0">
        {/* Compact Centered Black Aya Marker Emblem */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EAE3D6] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Light Fill for Number Legibility */}
          <circle
            cx="16"
            cy="16"
            r="12.5"
            fill="#FFFDF9"
            className="dark:fill-[#1A1612]"
          />

          {/* 8-pointed / scalloped crenellations around the circle */}
          <path
            d="
              M 16,1.8 L 18.2,3.8 L 21.2,2.8 L 22.8,5.5 L 26,5.8 L 26.5,9 L 29.2,10.5 L 28.5,13.5 L 30.5,16 L 28.5,18.5 L 29.2,21.5 L 26.5,23 L 26,26.2 L 22.8,26.5 L 21.2,29.2 L 18.2,28.2 L 16,30.2 L 13.8,28.2 L 10.8,29.2 L 9.2,26.5 L 6,26.2 L 5.5,23 L 2.8,21.5 L 3.5,18.5 L 1.5,16 L 3.5,13.5 L 2.8,10.5 L 5.5,9 L 6,5.8 L 9.2,5.5 L 10.8,2.8 L 13.8,3.8 Z
            "
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Solid Heavy Inner Border */}
          <circle
            cx="16"
            cy="16"
            r="12.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />

          {/* Delicate Inner Beaded Line */}
          <circle
            cx="16"
            cy="16"
            r="10.8"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="1.2 1"
            opacity="0.8"
          />

          {/* Mathematically Centered Arabic Numeral */}
          <text
            x="16"
            y="16"
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
        </svg>
      </span>
    </span>
  )
}
