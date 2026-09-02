"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Emblem without Top Crown
 * - Smooth arched top
 * - Solid black base crown on bottom with 3 white puncture pearls + bottom point
 * - Clean circular/oval center canvas with bold centered Uthmanic Hafs numeral
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
      <span className="relative inline-flex items-center justify-center w-[1.15em] h-[1.3em] shrink-0">
        <svg
          viewBox="0 0 22 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Light Room */}
          <circle
            cx="11"
            cy="10.5"
            r="8"
            fill="#FFFDF9"
            className="dark:fill-[#181512]"
          />

          {/* ─── BOTTOM BLACK BASE CROWN WITH 3 PEARLS ─── */}
          <path
            d="
              M 11,23.2
              C 12.8,21.2 16,20.2 17.5,17.8
              C 15.5,16.5 13.5,16.8 11,16.8
              C 8.5,16.8 6.5,16.5 4.5,17.8
              C 6,20.2 9.2,21.2 11,23.2 Z
            "
            fill="currentColor"
          />
          <circle cx="11" cy="23.2" r="0.75" fill="currentColor" />
          {/* 3 Bottom White Puncture Pearls */}
          <circle cx="11" cy="19.5" r="0.7" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="7.8" cy="18.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="14.2" cy="18.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── CAPSULE OUTLINE RING ─── */}
          <circle
            cx="11"
            cy="10.5"
            r="8"
            stroke="currentColor"
            strokeWidth="1.4"
          />

          {/* ─── MATHEMATICALLY CENTERED CALLIGRAPHIC NUMERAL ─── */}
          <text
            x="11"
            y="10.5"
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
