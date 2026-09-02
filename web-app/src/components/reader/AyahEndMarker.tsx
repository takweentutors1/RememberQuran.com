"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Isolated Inner Core Emblem (قلب علامة نهاية الآية)
 * Strictly the Inner Core capsule only (no outer oval ring, no external top/bottom pins):
 * - Black arched dome crown on top with 3 white puncture pearls + pointed tip
 * - Black curved base on bottom with 3 white puncture pearls + bottom point
 * - Clean circular/oval center canvas with bold centered Uthmanic Hafs numeral
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size for 1, 2, or 3 digits
  const svgFontSize = digitCount >= 3 ? "9.5px" : digitCount === 2 ? "11.5px" : "14px"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center w-[1.15em] h-[1.38em] shrink-0">
        {/* Exact Isolated Inner Core Capsule SVG */}
        <svg
          viewBox="0 0 22 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Light Room */}
          <circle
            cx="11"
            cy="13"
            r="8"
            fill="#FFFDF9"
            className="dark:fill-[#181512]"
          />

          {/* ─── TOP BLACK DOME CROWN WITH 3 PEARLS ─── */}
          <path
            d="
              M 11,0.8
              C 12.8,2.8 16,3.8 17.5,6.2
              C 15.5,7.5 13.5,7.2 11,7.2
              C 8.5,7.2 6.5,7.5 4.5,6.2
              C 6,3.8 9.2,2.8 11,0.8 Z
            "
            fill="currentColor"
          />
          <circle cx="11" cy="0.8" r="0.75" fill="currentColor" />
          {/* 3 Top White Puncture Pearls */}
          <circle cx="11" cy="4.5" r="0.7" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="7.8" cy="5.2" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="14.2" cy="5.2" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── BOTTOM BLACK BASE CROWN WITH 3 PEARLS ─── */}
          <path
            d="
              M 11,25.2
              C 12.8,23.2 16,22.2 17.5,19.8
              C 15.5,18.5 13.5,18.8 11,18.8
              C 8.5,18.8 6.5,18.5 4.5,19.8
              C 6,22.2 9.2,23.2 11,25.2 Z
            "
            fill="currentColor"
          />
          <circle cx="11" cy="25.2" r="0.75" fill="currentColor" />
          {/* 3 Bottom White Puncture Pearls */}
          <circle cx="11" cy="21.5" r="0.7" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="7.8" cy="20.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
          <circle cx="14.2" cy="20.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />

          {/* ─── CAPSULE OUTLINE RING ─── */}
          <circle
            cx="11"
            cy="13"
            r="8"
            stroke="currentColor"
            strokeWidth="1.4"
          />

          {/* ─── MATHEMATICALLY CENTERED CALLIGRAPHIC NUMERAL ─── */}
          <text
            x="11"
            y="13"
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
