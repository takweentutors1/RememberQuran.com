"use client"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
}

export function AyahEndMarker({ digits, ariaLabel }: AyahEndMarkerProps) {
  return (
    <span
      className="inline-flex items-center justify-center align-middle select-none mx-1 translate-y-[-1px]"
      aria-label={ariaLabel}
    >
      <span className="relative inline-flex items-center justify-center size-[1.55em] text-[0.62em]">
        {/* Authentic Multi-layer Rosette SVG Ornament */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full text-[#9E783E] dark:text-[#D4AF37] drop-shadow-xs"
        >
          {/* Subtle Outer Glow Fill */}
          <circle cx="20" cy="20" r="18" fill="currentColor" fillOpacity="0.06" />

          {/* 8-Point Interlaced Star / Petal Ring */}
          <path
            d="M20 1.5 L24.5 9.5 L33.5 6.5 L30.5 15.5 L38.5 20 L30.5 24.5 L33.5 33.5 L24.5 30.5 L20 38.5 L15.5 30.5 L6.5 33.5 L9.5 24.5 L1.5 20 L9.5 15.5 L6.5 6.5 L15.5 9.5 Z"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="currentColor"
            fillOpacity="0.08"
          />

          {/* Outer Solid Ring */}
          <circle cx="20" cy="20" r="16.5" stroke="currentColor" strokeWidth="1.2" />

          {/* Inner Dotted Accent Ring */}
          <circle
            cx="20"
            cy="20"
            r="13.8"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="1.5 1.5"
            opacity="0.85"
          />

          {/* 8 Accent Corner Dots */}
          <circle cx="20" cy="3.5" r="1.1" fill="currentColor" />
          <circle cx="20" cy="36.5" r="1.1" fill="currentColor" />
          <circle cx="3.5" cy="20" r="1.1" fill="currentColor" />
          <circle cx="36.5" cy="20" r="1.1" fill="currentColor" />
          <circle cx="8.3" cy="8.3" r="0.9" fill="currentColor" />
          <circle cx="31.7" cy="8.3" r="0.9" fill="currentColor" />
          <circle cx="8.3" cy="31.7" r="0.9" fill="currentColor" />
          <circle cx="31.7" cy="31.7" r="0.9" fill="currentColor" />
        </svg>

        {/* Eastern Arabic numeral inside the rosette */}
        <span className="relative z-10 font-bold font-mono tabular-nums leading-none text-[#2C2114] dark:text-[#F2E8D5] pt-0.5">
          {digits}
        </span>
      </span>
    </span>
  )
}

