"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Ornate Black Eye Cartouche (علامة نهاية الآية النواة)
 * Exact inner figure from screenshot without any outer circle:
 * - Solid black ornate top cap with pointed dome
 * - Solid black ornate bottom base with bottom point
 * - Clean horizontal oval chamber with bold centered Uthmanic Hafs calligraphy numeral
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size for 1, 2, or 3 digits
  const svgFontSize = digitCount >= 3 ? "9px" : digitCount === 2 ? "11px" : "13.5px"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center w-[1.2em] h-[1.35em] shrink-0">
        <svg
          viewBox="0 0 24 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EDE6DA] overflow-visible"
        >
          {/* Inner White Eye Room */}
          <ellipse
            cx="12"
            cy="14"
            rx="7.5"
            ry="5.5"
            fill="#FFFDF9"
            className="dark:fill-[#181512]"
          />

          {/* ─── SOLID ORNATE BLACK TOP CAP ─── */}
          <path
            d="
              M 12,2.5
              C 14,5 18,5.8 19.5,8.5
              C 17,9.8 15,9.5 12,9.5
              C 9,9.5 7,9.8 4.5,8.5
              C 6,5.8 10,5 12,2.5 Z
            "
            fill="currentColor"
          />
          {/* Top Point & Pearls */}
          <circle cx="12" cy="2" r="0.75" fill="currentColor" />
          <circle cx="12" cy="6.2" r="0.65" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="8.5" cy="7" r="0.55" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="15.5" cy="7" r="0.55" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── SOLID ORNATE BLACK BOTTOM BASE ─── */}
          <path
            d="
              M 12,25.5
              C 14,23 18,22.2 19.5,19.5
              C 17,18.2 15,18.5 12,18.5
              C 9,18.5 7,18.2 4.5,19.5
              C 6,22.2 10,23 12,25.5 Z
            "
            fill="currentColor"
          />
          {/* Bottom Point & Pearls */}
          <circle cx="12" cy="26" r="0.75" fill="currentColor" />
          <circle cx="12" cy="21.8" r="0.65" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="8.5" cy="21" r="0.55" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="15.5" cy="21" r="0.55" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── INNER HORIZONTAL EYE RING ─── */}
          <ellipse
            cx="12"
            cy="14"
            rx="7.5"
            ry="5.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />

          {/* ─── CENTERED UTHMANIC CALLIGRAPHY DIGIT ─── */}
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
