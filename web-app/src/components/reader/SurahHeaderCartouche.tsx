"use client"

import type { Chapter } from "@/types/quran"
import { toArabicDigits } from "./AyahText"
import { cn } from "@/lib/utils"

interface SurahHeaderCartoucheProps {
  chapter: Chapter
  className?: string
}

/**
  * Classical illuminated Surah header cartouche (Unwan / عنوان السورة)
  * Faithfully inspired by King Fahd Complex / Madani Mushaf frontispieces.
  * Features authentic multi-layered arabesque framing, side arches, and
  * classical calligraphy title styling.
  */
export function SurahHeaderCartouche({ chapter, className }: SurahHeaderCartoucheProps) {
  const surahNameClean = chapter.name_arabic.replace(/^سورة\s+/i, "")

  return (
    <div
      dir="rtl"
      lang="ar"
      role="region"
      aria-label={`سورة ${chapter.name_arabic}`}
      className={cn(
        "relative mx-auto my-1.5 sm:my-2 w-full max-w-lg select-none",
        className,
      )}
    >
      {/* Traditional Arabesque Cartouche Container */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-md border-2 border-[#8E6C42] bg-[#FAF6EE] dark:bg-[#251E17] px-4 py-2 sm:py-2.5 shadow-sm">
        {/* Subtle Decorative Pattern Background */}
        <div className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-20 bg-[radial-gradient(#8E6C42_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* Inner ornamental decorative double-lines */}
        <div className="pointer-events-none absolute inset-[3px] rounded-xs border border-[#8E6C42]/50" />
        <div className="pointer-events-none absolute inset-[5px] border border-[#8E6C42]/30" />

        {/* Four Corner Rosette Finials */}
        <div className="pointer-events-none absolute top-1 right-1 size-2 border-t-2 border-r-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute top-1 left-1 size-2 border-t-2 border-l-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute bottom-1 right-1 size-2 border-b-2 border-r-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute bottom-1 left-1 size-2 border-b-2 border-l-2 border-[#8E6C42]" />

        {/* Central Surah Calligraphy Banner */}
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-5 w-full">
          {/* Right Flourish Arch Bar */}
          <div className="flex-1 flex items-center justify-end gap-1.5 opacity-70">
            <span className="h-px w-full max-w-[50px] bg-gradient-to-r from-transparent to-[#8E6C42]" />
            <span className="text-xs sm:text-sm text-[#8E6C42] leading-none">❖</span>
          </div>

          {/* Surah Title in classic Calligraphic styling */}
          <h2 className="quran-arabic font-uthmani text-xl sm:text-2xl md:text-[1.75rem] font-bold text-[#3B2918] dark:text-[#F2E8D5] tracking-wide leading-tight drop-shadow-2xs whitespace-nowrap px-3">
            سُورَةُ {surahNameClean}
          </h2>

          {/* Left Flourish Arch Bar */}
          <div className="flex-1 flex items-center justify-start gap-1.5 opacity-70">
            <span className="text-xs sm:text-sm text-[#8E6C42] leading-none">❖</span>
            <span className="h-px w-full max-w-[50px] bg-gradient-to-l from-transparent to-[#8E6C42]" />
          </div>
        </div>
      </div>
    </div>
  )
}

