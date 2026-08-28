"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
}

export function AyahEndMarker({ digits, ariaLabel }: AyahEndMarkerProps) {
  return (
    <span
      className="inline-flex items-center justify-center align-middle select-none mx-1.5 translate-y-[-1px]"
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center size-[1.55em] text-[0.62em]">
        {/* Rosette SVG Ornament */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full text-[#A48255] dark:text-[#C5A375] drop-shadow-xs"
        >
          {/* Outer Ring */}
          <circle cx="18" cy="18" r="16.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.9" />
          {/* Inner Accent Ring */}
          <circle cx="18" cy="18" r="14.2" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5" fill="none" opacity="0.75" />
          {/* 8 Ornamental Petal Bulbs around circle */}
          <circle cx="18" cy="1.5" r="1.5" fill="currentColor" />
          <circle cx="18" cy="34.5" r="1.5" fill="currentColor" />
          <circle cx="1.5" cy="18" r="1.5" fill="currentColor" />
          <circle cx="34.5" cy="18" r="1.5" fill="currentColor" />
          <circle cx="6.3" cy="6.3" r="1.2" fill="currentColor" />
          <circle cx="29.7" cy="6.3" r="1.2" fill="currentColor" />
          <circle cx="6.3" cy="29.7" r="1.2" fill="currentColor" />
          <circle cx="29.7" cy="29.7" r="1.2" fill="currentColor" />
        </svg>

        {/* Eastern Arabic numeral inside the rosette */}
        <span className="relative z-10 font-bold font-mono tabular-nums leading-none text-[#2B2319] dark:text-[#E8DFC8] pt-0.5">
          {digits}
        </span>
      </span>
    </span>
  )
}
