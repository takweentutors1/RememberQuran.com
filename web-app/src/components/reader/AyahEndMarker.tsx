"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Ayah End Marker (علامة نهاية الآية)
 * Optimized and fully responsive:
 * - Dynamic font sizing according to digit count (1, 2, or 3 digits) so numbers never overflow
 * - Strict CSS isolation from global word-spacing / letter-spacing
 * - Perfectly centered multi-layered King Fahd Complex gold rosette ornament
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic font sizing for 1, 2, or 3+ digits
  const digitSizeClass =
    digitCount >= 3
      ? "text-[0.38em] tracking-[-0.04em]"
      : digitCount === 2
        ? "text-[0.48em] tracking-[-0.02em]"
        : "text-[0.58em] tracking-normal"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center size-[1.5em] shrink-0">
        {/* Authentic Madani Mushaf Rosette SVG */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full text-[#9C7944] dark:text-[#C5A365] drop-shadow-2xs"
        >
          {/* Inner Soft Tint Fill */}
          <circle
            cx="20"
            cy="20"
            r="16.5"
            fill="#EFE8D8"
            fillOpacity="0.45"
            className="dark:fill-[#2A2319] dark:fill-opacity-50"
          />

          {/* 8 Radial Floral Petals / Radiating Spikes (Exact Madani Style) */}
          <path
            d="
              M 20,2.5 L 22,5.8 L 25.8,4 L 26.5,8 L 30.5,7.5 L 29.8,11.5 L 33.8,12.5 L 32,16 L 35.5,18.2 L 32.8,21 L 35.5,23.8 L 32,26 L 33.8,29.5 L 29.8,30.5 L 30.5,34.5 L 26.5,34 L 25.8,38 L 22,36.2 L 20,39.5 L 18,36.2 L 14.2,38 L 13.5,34 L 9.5,34.5 L 10.2,30.5 L 6.2,29.5 L 8,26 L 4.5,23.8 L 7.2,21 L 4.5,18.2 L 8,16 L 6.2,12.5 L 10.2,11.5 L 9.5,7.5 L 13.5,8 L 14.2,4 L 18,5.8 Z
            "
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Outer Heavy Circular Ring */}
          <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.3" />

          {/* Inner Delicate Concentric Ring */}
          <circle
            cx="20"
            cy="20"
            r="13"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="1.5 1"
            opacity="0.9"
          />
          <circle cx="20" cy="20" r="11.8" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

          {/* Four Cardinal Point Dots */}
          <circle cx="20" cy="4.8" r="0.75" fill="currentColor" />
          <circle cx="20" cy="35.2" r="0.75" fill="currentColor" />
          <circle cx="4.8" cy="20" r="0.75" fill="currentColor" />
          <circle cx="35.2" cy="20" r="0.75" fill="currentColor" />
        </svg>

        {/* Eastern Arabic numeral inside the rosette with strict isolation */}
        <span
          className={cn(
            "relative z-10 font-bold font-mono tabular-nums leading-none text-[#231A0F] dark:text-[#F4ECE0]",
            "flex items-center justify-center text-center",
            digitSizeClass,
          )}
          style={{
            wordSpacing: "normal",
            letterSpacing: "0",
          }}
        >
          {digits}
        </span>
      </span>
    </span>
  )
}
