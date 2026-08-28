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
 * inspired by traditional King Fahd Complex / Madani Mushafs.
 * Features an authentic gilded Islamic geometric frame, calligraphy banner,
 * revelation place badge, and ayah count medallion.
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
        "relative mx-auto my-4 sm:my-6 w-full max-w-xl select-none",
        className,
      )}
    >
      {/* Traditional Arabesque Cartouche Box */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-md border-2 border-[#A88B60]/90 dark:border-[#8E6C42] bg-[#FAF6EE] dark:bg-[#251F18] px-4 py-2 sm:py-3 shadow-xs">
        {/* Inner ornamental decorative double-lines */}
        <div className="pointer-events-none absolute inset-1 rounded-sm border border-[#A88B60]/40" />
        <div className="pointer-events-none absolute inset-[3px] border border-[#A88B60]/20" />

        {/* Four Corner Ornaments */}
        <div className="pointer-events-none absolute top-1 right-1 size-2 border-t-2 border-r-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute top-1 left-1 size-2 border-t-2 border-l-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute bottom-1 right-1 size-2 border-b-2 border-r-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute bottom-1 left-1 size-2 border-b-2 border-l-2 border-[#8E6C42]" />

        {/* Central Surah Calligraphy with side flourishes */}
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4 w-full">
          {/* Right Flourish Bar */}
          <div className="flex-1 flex items-center justify-end gap-1.5 opacity-60">
            <span className="h-px w-full max-w-[60px] bg-[#8E6C42]" />
            <span className="text-xs text-[#8E6C42]">❖</span>
          </div>

          {/* Surah Title */}
          <h2 className="quran-arabic text-xl sm:text-2xl lg:text-[1.85rem] font-bold text-[#3B2816] dark:text-[#F3E9D2] tracking-wide leading-tight drop-shadow-2xs whitespace-nowrap px-2">
            سُورَةُ {surahNameClean}
          </h2>

          {/* Left Flourish Bar */}
          <div className="flex-1 flex items-center justify-start gap-1.5 opacity-60">
            <span className="text-xs text-[#8E6C42]">❖</span>
            <span className="h-px w-full max-w-[60px] bg-[#8E6C42]" />
          </div>
        </div>
      </div>
    </div>
  )
}
