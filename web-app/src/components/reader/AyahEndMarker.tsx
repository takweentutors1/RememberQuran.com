"use client"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
}

/**
 * Authentic Madani Mushaf Ayah End Marker (علامة نهاية الآية)
 * Exactly matched to King Fahd Complex printed Qur'an manuscript:
 * - Warm antique gold circular cartouche with soft fill
 * - Double outer gold circular border
 * - 8 scalloped floral petal finials / teeth
 * - Crisp centered Eastern Arabic-Indic numeral
 */
export function AyahEndMarker({ digits, ariaLabel }: AyahEndMarkerProps) {
  return (
    <span
      className="inline-flex items-center justify-center align-middle select-none mx-0.5 translate-y-[-2px]"
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center size-[1.42em] text-[0.62em]">
        {/* Authentic Madani Mushaf Rosette SVG */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full text-[#9C7944] dark:text-[#C5A365] drop-shadow-2xs"
        >
          {/* Inner Soft Tint Fill */}
          <circle cx="18" cy="18" r="14.5" fill="#EFE8D8" fillOpacity="0.45" className="dark:fill-[#2A2319] dark:fill-opacity-50" />

          {/* 8 Radial Floral Petals / Radiating Spikes (Exact Madani Style) */}
          <path
            d="
              M 18,2.2 L 19.8,5.2 L 23.2,3.5 L 23.8,7.2 L 27.5,6.8 L 26.8,10.5 L 30.5,11.2 L 28.8,14.5 L 32,16.5 L 29.5,19 L 32,21.5 L 28.8,23.5 L 30.5,26.8 L 26.8,27.5 L 27.5,31.2 L 23.8,30.8 L 23.2,34.5 L 19.8,32.8 L 18,35.8 L 16.2,32.8 L 12.8,34.5 L 12.2,30.8 L 8.5,31.2 L 9.2,27.5 L 5.5,26.8 L 7.2,23.5 L 4,21.5 L 6.5,19 L 4,16.5 L 7.2,14.5 L 5.5,11.2 L 9.2,10.5 L 8.5,6.8 L 12.2,7.2 L 12.8,3.5 L 16.2,5.2 Z
            "
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Outer Heavy Circular Ring */}
          <circle cx="18" cy="18" r="13.2" stroke="currentColor" strokeWidth="1.3" />

          {/* Inner Delicate Concentric Ring */}
          <circle cx="18" cy="18" r="11.4" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.2 0.8" opacity="0.9" />
          <circle cx="18" cy="18" r="10.2" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

          {/* Four Cardinal Point Dots */}
          <circle cx="18" cy="4.2" r="0.7" fill="currentColor" />
          <circle cx="18" cy="31.8" r="0.7" fill="currentColor" />
          <circle cx="4.2" cy="18" r="0.7" fill="currentColor" />
          <circle cx="31.8" cy="18" r="0.7" fill="currentColor" />
        </svg>

        {/* Eastern Arabic numeral inside the rosette */}
        <span className="relative z-10 font-bold font-mono tabular-nums leading-none text-[#231A0F] dark:text-[#F4ECE0] pt-0.5">
          {digits}
        </span>
      </span>
    </span>
  )
}
