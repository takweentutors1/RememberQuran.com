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
 * Styled exactly like the traditional King Fahd Complex ornate oval cartouche / page medallion:
 * - Vertical oval medallion with top & bottom decorative finials and palmette scrolls
 * - Warm illuminated antique gold outline and subtle inner background fill
 * - Dynamic font sizing according to digit count (1, 2, or 3 digits) with strict isolation
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic font sizing for 1, 2, or 3+ digits
  const digitSizeClass =
    digitCount >= 3
      ? "text-[0.34em] tracking-[-0.04em]"
      : digitCount === 2
        ? "text-[0.44em] tracking-[-0.02em]"
        : "text-[0.54em] tracking-normal font-semibold"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-1",
        "translate-y-[-2px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center w-[1.35em] h-[1.65em] shrink-0">
        {/* Authentic Madani Mushaf Oval Cartouche Ornament SVG */}
        <svg
          viewBox="0 0 32 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full text-[#9E783E] dark:text-[#C5A365] drop-shadow-2xs"
        >
          {/* Inner Medallion Soft Parchment Fill */}
          <ellipse
            cx="16"
            cy="20"
            rx="11.5"
            ry="14.5"
            fill="#FAF6EE"
            fillOpacity="0.85"
            className="dark:fill-[#1E1912] dark:fill-opacity-85"
          />

          {/* Top Decorative Finial & Foliage Crest */}
          <path
            d="M 16,1.5 C 17.2,3.5 19.5,4.8 21.5,5.2 C 19.5,6.5 17.5,7 16,9 C 14.5,7 12.5,6.5 10.5,5.2 C 12.5,4.8 14.8,3.5 16,1.5 Z"
            fill="currentColor"
          />
          {/* Top Side Scroll Wings */}
          <path
            d="M 16,4 C 18.5,4 23,6 23.5,9 C 21,9 18.5,7.5 16,6.5 C 13.5,7.5 11,9 8.5,9 C 9,6 13.5,4 16,4 Z"
            fill="currentColor"
            opacity="0.85"
          />

          {/* Bottom Decorative Finial & Foliage Base */}
          <path
            d="M 16,38.5 C 17.2,36.5 19.5,35.2 21.5,34.8 C 19.5,33.5 17.5,33 16,31 C 14.5,33 12.5,33.5 10.5,34.8 C 12.5,35.2 14.8,36.5 16,38.5 Z"
            fill="currentColor"
          />
          {/* Bottom Side Scroll Wings */}
          <path
            d="M 16,36 C 18.5,36 23,34 23.5,31 C 21,31 18.5,32.5 16,33.5 C 13.5,33.5 11,31 8.5,31 C 9,34 13.5,36 16,36 Z"
            fill="currentColor"
            opacity="0.85"
          />

          {/* Outer Heavy Oval Border */}
          <ellipse
            cx="16"
            cy="20"
            rx="12"
            ry="15"
            stroke="currentColor"
            strokeWidth="1.2"
          />

          {/* Inner Delicate Framing Border */}
          <ellipse
            cx="16"
            cy="20"
            rx="9.8"
            ry="12.6"
            stroke="currentColor"
            strokeWidth="0.75"
          />

          {/* Side Arabesque Point Embellishments */}
          <circle cx="3.2" cy="20" r="0.85" fill="currentColor" />
          <circle cx="28.8" cy="20" r="0.85" fill="currentColor" />
        </svg>

        {/* Eastern Arabic numeral inside the cartouche with strict isolation */}
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
