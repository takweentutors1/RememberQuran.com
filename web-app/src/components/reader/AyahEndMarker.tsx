"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Compact Black Floral Cartouche (علامة نهاية الآية المفردة المتقنة)
 * Only the single compact inner floral emblem without any outer balloon/lantern chamber:
 * - Tight ornate black top & bottom palmette crowns
 * - Single crisp inner chamber
 * - Bold Uthmanic Hafs calligraphy digits with exact mathematical centering
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
      <span className="relative inline-flex items-center justify-center w-[1.18em] h-[1.38em] shrink-0">
        {/* Compact Single Black Floral Cartouche SVG */}
        <svg
          viewBox="0 0 26 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Light Fill for Contrast */}
          <ellipse
            cx="13"
            cy="15"
            rx="9.5"
            ry="9"
            fill="#FFFDF9"
            className="dark:fill-[#181512]"
          />

          {/* ─── TIGHT TOP BLACK FLORAL CROWN ─── */}
          <path
            d="
              M 13,0.8
              C 15,2.8 18.5,3.2 20,5.5
              C 17.5,6.8 15.5,6.5 13,6.5
              C 10.5,6.5 8.5,6.8 6,5.5
              C 7.5,3.2 11,2.8 13,0.8 Z
            "
            fill="currentColor"
          />
          <circle cx="13" cy="0.6" r="0.75" fill="currentColor" />
          <circle cx="13" cy="4.2" r="0.7" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="9.2" cy="4.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="16.8" cy="4.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── TIGHT BOTTOM BLACK FLORAL CROWN ─── */}
          <path
            d="
              M 13,29.2
              C 15,27.2 18.5,26.8 20,24.5
              C 17.5,23.2 15.5,23.5 13,23.5
              C 10.5,23.5 8.5,23.2 6,24.5
              C 7.5,26.8 11,27.2 13,29.2 Z
            "
            fill="currentColor"
          />
          <circle cx="13" cy="29.4" r="0.75" fill="currentColor" />
          <circle cx="13" cy="25.8" r="0.7" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="9.2" cy="25.2" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="16.8" cy="25.2" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── SINGLE OVAL BORDER ─── */}
          <ellipse
            cx="13"
            cy="15"
            rx="9.5"
            ry="9"
            stroke="currentColor"
            strokeWidth="1.4"
          />

          {/* ─── MATHEMATICALLY CENTERED NUMERAL ─── */}
          <text
            x="13"
            y="15"
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
