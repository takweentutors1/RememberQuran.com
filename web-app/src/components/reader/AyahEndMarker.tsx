"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
}

/**
 * Authentic Madani Mushaf Ayah End Marker (علامة نهاية الآية المذهبة)
 * Inspired by King Fahd Complex Quran illuminated manuscript page & ayah ornaments:
 * - Oval/cartouche floral emblem with top/bottom floral crown crests (shurufat)
 * - Fine double gold outline with inner parchment illumination
 * - Perfectly centered Eastern Arabic numeral isolated from line-height and word-spacing
 */
export function AyahEndMarker({ digits, ariaLabel, className }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic font sizing for 1, 2, or 3+ digits to keep perfectly centered inside the oval
  const digitSizeClass =
    digitCount >= 3
      ? "text-[0.40em] tracking-[-0.04em]"
      : digitCount === 2
        ? "text-[0.52em] tracking-[-0.02em]"
        : "text-[0.64em] tracking-normal"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-1",
        "translate-y-[-1px]",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center w-[1.35em] h-[1.5em] shrink-0">
        {/* Authentic Madani Mushaf Oval Cartouche Ornament SVG */}
        <svg
          viewBox="0 0 32 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full text-[#9C7944] dark:text-[#C5A365] drop-shadow-2xs overflow-visible"
        >
          {/* Inner Cream/Parchment Tint Fill */}
          <ellipse
            cx="16"
            cy="19"
            rx="12.5"
            ry="14.5"
            fill="#FAF4E8"
            fillOpacity="0.85"
            className="dark:fill-[#201C17] dark:fill-opacity-90"
          />

          {/* Top Crown Floral Finial / Palmette (Zakhrafah) */}
          <path
            d="M 16,1.5 C 17.5,3.8 20.5,4.5 22,6.5 C 20.5,7.2 18.5,6.5 16,8.5 C 13.5,6.5 11.5,7.2 10,6.5 C 11.5,4.5 14.5,3.8 16,1.5 Z"
            fill="currentColor"
            fillOpacity="0.8"
          />
          <circle cx="16" cy="1.2" r="0.9" fill="currentColor" />
          <circle cx="11.5" cy="5.5" r="0.65" fill="currentColor" opacity="0.7" />
          <circle cx="20.5" cy="5.5" r="0.65" fill="currentColor" opacity="0.7" />

          {/* Bottom Crown Floral Finial / Palmette (Flipped) */}
          <path
            d="M 16,36.5 C 17.5,34.2 20.5,33.5 22,31.5 C 20.5,30.8 18.5,31.5 16,29.5 C 13.5,31.5 11.5,30.8 10,31.5 C 11.5,33.5 14.5,34.2 16,36.5 Z"
            fill="currentColor"
            fillOpacity="0.8"
          />
          <circle cx="16" cy="36.8" r="0.9" fill="currentColor" />
          <circle cx="11.5" cy="32.5" r="0.65" fill="currentColor" opacity="0.7" />
          <circle cx="20.5" cy="32.5" r="0.65" fill="currentColor" opacity="0.7" />

          {/* Outer Heavy Cartouche Frame */}
          <ellipse
            cx="16"
            cy="19"
            rx="13.2"
            ry="14.8"
            stroke="currentColor"
            strokeWidth="1.2"
          />

          {/* Inner Delicate Concentric Framing Ellipse */}
          <ellipse
            cx="16"
            cy="19"
            rx="11.2"
            ry="12.8"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeDasharray="1.5 1"
            opacity="0.9"
          />

          {/* Side Floral Accent Beads */}
          <circle cx="2.2" cy="19" r="0.85" fill="currentColor" />
          <circle cx="29.8" cy="19" r="0.85" fill="currentColor" />
        </svg>

        {/* Eastern Arabic numeral inside the cartouche */}
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
