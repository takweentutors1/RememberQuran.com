"use client"

import { cn } from "@/lib/utils"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

/**
 * Authentic Madani Mushaf Golden Ayah End Medallion (علامة نهاية الآية المذهبة)
 * Exactly matched to King Fahd Complex Madani Mushaf:
 * - Golden-bronze circular outer ring with 8 ornate petal notches
 * - Inner concentric golden hairline ring
 * - Bold high-contrast centered Uthmanic Hafs numeral
 */
export function AyahEndMarker({ digits, ariaLabel, className, onClick }: AyahEndMarkerProps) {
  const digitCount = digits ? digits.trim().length : 1

  // Dynamic SVG font size for 1, 2, or 3 digits
  const svgFontSize = digitCount >= 3 ? "9.5px" : digitCount === 2 ? "12px" : "14.5px"

  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick(e as unknown as React.MouseEvent)
              }
            }
          : undefined
      }
      className={cn(
        "inline-flex items-center justify-center align-middle select-none mx-0.5",
        "translate-y-[-2px]",
        onClick && "cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full",
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center w-[1.25em] h-[1.25em] shrink-0">
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full text-[#8C6D38] dark:text-[#C5A365] overflow-visible drop-shadow-2xs"
        >
          {/* Outer Scalloped Petal Ring (8 points) */}
          <path
            d="
              M 14,1.5
              C 17,1.5 19,3.5 21,5
              C 23.5,6.5 25.5,8.5 26,11
              C 26.5,13.5 26.5,16.5 25.5,19
              C 24.5,21.5 22.5,23.5 20,25
              C 17.5,26.5 14.5,26.5 12,26
              C 9.5,25.5 7.5,23.5 6,21
              C 4.5,18.5 4.5,15.5 5,13
              C 5.5,10.5 7.5,8.5 9.5,6.5
              C 11.5,4.5 12.5,1.5 14,1.5 Z
            "
            stroke="currentColor"
            strokeWidth="1.3"
            fill="currentColor"
            fillOpacity="0.04"
          />

          {/* Inner Golden Hairline Ring */}
          <circle
            cx="14"
            cy="14"
            r="8.8"
            stroke="currentColor"
            strokeWidth="0.9"
            fill="none"
          />

          {/* Centered Bold Numeral */}
          <text
            x="14"
            y="14"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#1E1B18"
            className="dark:fill-[#ECE6DA]"
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
