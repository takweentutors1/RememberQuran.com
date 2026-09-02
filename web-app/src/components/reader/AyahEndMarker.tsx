"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Single-Chamber Lace Emblem (علامة نهاية الآية المفردة المتقنة)
 * Exactly matched to Image 2:
 * - Single wide-chamber horizontal oval with clear breathing space
 * - Solid black top crown with 3 circular puncture pearls + top finial tip
 * - Solid black bottom crown with 3 circular puncture pearls + bottom finial tip
 * - Bold Uthmanic Hafs calligraphy digits with exact vertical and horizontal centering
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size for 1, 2, or 3 digits
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
      <span className="relative inline-flex items-center justify-center w-[1.3em] h-[1.5em] shrink-0">
        {/* Authentic Madani Mushaf Image-2 Lace Emblem SVG */}
        <svg
          viewBox="0 0 32 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Light Fill for High Contrast */}
          <ellipse
            cx="16"
            cy="19"
            rx="13.2"
            ry="12"
            fill="#FFFDF9"
            className="dark:fill-[#181512]"
          />

          {/* ─── TOP BLACK LACE CROWN WITH 3 PUNCTURE PEARLS ─── */}
          <path
            d="
              M 16,1.5
              C 18.5,4.5 22.5,5.2 24.5,7.8
              C 21.5,9.5 19,9 16,9.2
              C 13,9 10.5,9.5 7.5,7.8
              C 9.5,5.2 13.5,4.5 16,1.5 Z
            "
            fill="currentColor"
          />
          <circle cx="16" cy="1.2" r="0.85" fill="currentColor" />
          {/* 3 Top Puncture Pearls */}
          <circle cx="16" cy="6" r="0.9" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="11.5" cy="6.8" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="20.5" cy="6.8" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── BOTTOM BLACK LACE CROWN WITH 3 PUNCTURE PEARLS (Flipped) ─── */}
          <path
            d="
              M 16,36.5
              C 18.5,33.5 22.5,32.8 24.5,30.2
              C 21.5,28.5 19,29 16,28.8
              C 13,29 10.5,28.5 7.5,30.2
              C 9.5,32.8 13.5,33.5 16,36.5 Z
            "
            fill="currentColor"
          />
          <circle cx="16" cy="36.8" r="0.85" fill="currentColor" />
          {/* 3 Bottom Puncture Pearls */}
          <circle cx="16" cy="32" r="0.9" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="11.5" cy="31.2" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="20.5" cy="31.2" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── SMOOTH OVAL BORDER FRAME ─── */}
          <ellipse
            cx="16"
            cy="19"
            rx="13.2"
            ry="12"
            stroke="currentColor"
            strokeWidth="1.6"
          />

          {/* ─── MATHEMATICALLY CENTERED UTHMANIC NUMERAL ─── */}
          <text
            x="16"
            y="19"
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
