"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Vertical Oval Cartouche Emblem (علامة نهاية الآية والصفحة المتقنة)
 * Exactly matched to the Madani Mushaf page/ayah emblem:
 * - Vertical oval form factor with wide inner horizontal breathing space
 * - Intricate solid black top and bottom palmette crowns (shurufat / zakhrafah)
 * - Beaded / dotted inner concentric framing ring
 * - Mathematically centered Uthmanic Hafs calligraphy numerals (1, 2, or 3 digits)
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
      <span className="relative inline-flex items-center justify-center w-[1.35em] h-[1.52em] shrink-0">
        {/* Authentic Madani Vertical Oval Cartouche SVG */}
        <svg
          viewBox="0 0 32 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Light Fill for High Legibility */}
          <ellipse
            cx="16"
            cy="19"
            rx="12.5"
            ry="14.5"
            fill="#FFFDF9"
            className="dark:fill-[#181512]"
          />

          {/* ─── TOP FLORAL CROWN / PALMETTE FINIAL (Solid Black) ─── */}
          <path
            d="
              M 16,1.2 
              C 17.8,3.5 21.2,4.2 22.8,6.8 
              C 20.8,7.5 18.8,6.8 16,9.2 
              C 13.2,6.8 11.2,7.5 9.2,6.8 
              C 10.8,4.2 14.2,3.5 16,1.2 Z
            "
            fill="currentColor"
          />
          <circle cx="16" cy="1" r="0.9" fill="currentColor" />
          <circle cx="11.2" cy="5.5" r="0.75" fill="currentColor" />
          <circle cx="20.8" cy="5.5" r="0.75" fill="currentColor" />

          {/* ─── BOTTOM FLORAL CROWN / PALMETTE FINIAL (Solid Black Flipped) ─── */}
          <path
            d="
              M 16,36.8 
              C 17.8,34.5 21.2,33.8 22.8,31.2 
              C 20.8,30.5 18.8,31.2 16,28.8 
              C 13.2,31.2 11.2,30.5 9.2,31.2 
              C 10.8,33.8 14.2,34.5 16,36.8 Z
            "
            fill="currentColor"
          />
          <circle cx="16" cy="37" r="0.9" fill="currentColor" />
          <circle cx="11.2" cy="32.5" r="0.75" fill="currentColor" />
          <circle cx="20.8" cy="32.5" r="0.75" fill="currentColor" />

          {/* ─── OUTER HEAVY OVAL FRAME ─── */}
          <ellipse
            cx="16"
            cy="19"
            rx="13.2"
            ry="14.8"
            stroke="currentColor"
            strokeWidth="1.4"
          />

          {/* ─── INNER DELICATE BEADED / DOTTED CONCENTRIC RING ─── */}
          <ellipse
            cx="16"
            cy="19"
            rx="11.2"
            ry="12.8"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeDasharray="1.5 1.2"
            opacity="0.9"
          />

          {/* Side Floral Accent Beads */}
          <circle cx="2" cy="19" r="0.9" fill="currentColor" />
          <circle cx="30" cy="19" r="0.9" fill="currentColor" />

          {/* ─── MATHEMATICALLY CENTERED UTHMANIC DIGITS ─── */}
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
