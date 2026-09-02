"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Single Inner Eye Emblem (علامة نهاية الآية المفردة الدقيقة)
 * Exact extraction of the inner part only (no outer balloon, no lantern frame):
 * - Clean horizontal oval chamber with thick black outer ring
 * - Compact top and bottom crescent floral crown caps
 * - Pure centered Uthmanic Hafs calligraphy digits
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size for 1, 2, or 3 digits
  const svgFontSize = digitCount >= 3 ? "10px" : digitCount === 2 ? "12px" : "14.5px"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center w-[1.25em] h-[1.38em] shrink-0">
        {/* Exact Single Inner Eye Emblem SVG */}
        <svg
          viewBox="0 0 24 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Light Fill for Contrast */}
          <ellipse
            cx="12"
            cy="14"
            rx="9"
            ry="7.5"
            fill="#FFFDF9"
            className="dark:fill-[#181512]"
          />

          {/* ─── TOP CRESCENT CROWN CAP ─── */}
          <path
            d="
              M 4.2,9.8
              C 6,4.5 18,4.5 19.8,9.8
              C 17.5,7.8 6.5,7.8 4.2,9.8 Z
            "
            fill="currentColor"
          />
          <circle cx="12" cy="3.5" r="0.8" fill="currentColor" />

          {/* ─── BOTTOM CRESCENT CROWN CAP ─── */}
          <path
            d="
              M 4.2,18.2
              C 6,23.5 18,23.5 19.8,18.2
              C 17.5,20.2 6.5,20.2 4.2,18.2 Z
            "
            fill="currentColor"
          />
          <circle cx="12" cy="24.5" r="0.8" fill="currentColor" />

          {/* ─── SOLID BLACK HORIZONTAL OVAL RING ─── */}
          <ellipse
            cx="12"
            cy="14"
            rx="9"
            ry="7.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          {/* ─── MATHEMATICALLY CENTERED UTHMANIC NUMERAL ─── */}
          <text
            x="12"
            y="14"
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
