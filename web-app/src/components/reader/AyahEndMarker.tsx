"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Circular Rosette Ayah End Marker (علامة نهاية الآية الدائرية المذهبة)
 * Inspired by King Fahd Complex Quran illuminated manuscript page & ayah ornaments:
 * - Perfect round circular rosette geometry
 * - Scalloped lace filigree border (16 rounded crenellations)
 * - 4 Cardinal Pointed Diamond Finials (North, South, East, West) + Top/Bottom crown crests
 * - Authentic Uthmanic Hafs calligraphy digits with exact mathematical centering
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size for 1, 2, or 3+ digits to keep spacious & perfectly centered
  const svgFontSize = digitCount >= 3 ? "11px" : digitCount === 2 ? "13.5px" : "16px"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center size-[1.42em] shrink-0">
        {/* Authentic Madani Mushaf Circular Lace Rosette SVG */}
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#9E783E] dark:text-[#C5A365] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Warm Parchment Background Fill */}
          <circle
            cx="22"
            cy="22"
            r="16.5"
            fill="#FAF5EB"
            fillOpacity="0.9"
            className="dark:fill-[#1E1912] dark:fill-opacity-95"
          />

          {/* ─── 4 CARDINAL POINTED FLEURONS / FINIALS ─── */}
          {/* Top Diamond Point + Crown Arc */}
          <path
            d="M 22,2.2 L 23.8,5.5 L 22,7.2 L 20.2,5.5 Z"
            fill="currentColor"
          />
          <path
            d="M 18.5,6 C 20,4.5 24,4.5 25.5,6 C 24,7.2 20,7.2 18.5,6 Z"
            fill="currentColor"
            opacity="0.8"
          />
          <circle cx="22" cy="1.8" r="0.75" fill="currentColor" />

          {/* Bottom Diamond Point + Crown Arc */}
          <path
            d="M 22,41.8 L 23.8,38.5 L 22,36.8 L 20.2,38.5 Z"
            fill="currentColor"
          />
          <path
            d="M 18.5,38 C 20,39.5 24,39.5 25.5,38 C 24,36.8 20,36.8 18.5,38 Z"
            fill="currentColor"
            opacity="0.8"
          />
          <circle cx="22" cy="42.2" r="0.75" fill="currentColor" />

          {/* Right Diamond Point */}
          <path
            d="M 41.8,22 L 38.5,23.8 L 36.8,22 L 38.5,20.2 Z"
            fill="currentColor"
          />
          <circle cx="42.2" cy="22" r="0.75" fill="currentColor" />

          {/* Left Diamond Point */}
          <path
            d="M 2.2,22 L 5.5,23.8 L 7.2,22 L 5.5,20.2 Z"
            fill="currentColor"
          />
          <circle cx="1.8" cy="22" r="0.75" fill="currentColor" />

          {/* ─── SCALLOPED / BEADED LACE FILIGREE BORDER (16 Petal Arcs) ─── */}
          <circle
            cx="22"
            cy="22"
            r="16.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="22"
            cy="22"
            r="14.8"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="2 1.5"
            opacity="0.95"
          />
          <circle
            cx="22"
            cy="22"
            r="13.2"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.6"
          />

          {/* 8 Delicate Corner Accent Dots around the perimeter */}
          <circle cx="33.5" cy="10.5" r="0.8" fill="currentColor" opacity="0.8" />
          <circle cx="10.5" cy="10.5" r="0.8" fill="currentColor" opacity="0.8" />
          <circle cx="33.5" cy="33.5" r="0.8" fill="currentColor" opacity="0.8" />
          <circle cx="10.5" cy="33.5" r="0.8" fill="currentColor" opacity="0.8" />

          {/* ─── MATHEMATICALLY CENTERED CALLIGRAPHIC NUMERAL ─── */}
          <text
            x="22"
            y="22"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#231A0F"
            className="dark:fill-[#F4ECE0]"
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
