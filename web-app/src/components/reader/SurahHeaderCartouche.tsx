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
  return (
    <div
      dir="rtl"
      lang="ar"
      role="region"
      aria-label={`سورة ${chapter.name_arabic}`}
      className={cn(
        "relative mx-auto my-6 w-full max-w-2xl select-none",
        className,
      )}
    >
      {/* Ornate Traditional Arabesque Frame */}
      <div className="relative overflow-hidden rounded-md border-2 border-[#8E6C42]/80 bg-[#F4EFE6] dark:bg-[#2A241C] p-2.5 sm:p-4 shadow-sm">
        {/* Inner thin decorative hairline */}
        <div className="pointer-events-none absolute inset-1 rounded-sm border border-[#8E6C42]/40" />

        {/* Intricate Corner Knot Ornaments */}
        <div className="pointer-events-none absolute top-1 right-1 size-3 border-t-2 border-r-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute top-1 left-1 size-3 border-t-2 border-l-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute bottom-1 right-1 size-3 border-b-2 border-r-2 border-[#8E6C42]" />
        <div className="pointer-events-none absolute bottom-1 left-1 size-3 border-b-2 border-l-2 border-[#8E6C42]" />

        {/* Background Subtle Arabesque Pattern Texture */}
        <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#8E6C42_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* Central Calligraphic Surah Title */}
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 py-1">
          {/* Right Flourish Motif */}
          <div className="hidden sm:flex items-center gap-1 text-[#8E6C42]/70">
            <span className="text-xs">❖</span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-[#8E6C42]/70 to-transparent" />
          </div>

          {/* Surah Title Calligraphy */}
          <div className="flex items-center gap-2">
            <h2 className="quran-arabic text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-[#3B2816] dark:text-[#F3E9D2] tracking-wide leading-tight drop-shadow-2xs">
              سُورَةُ {chapter.name_arabic.replace(/^سورة\s+/i, "")}
            </h2>
          </div>

          {/* Left Flourish Motif */}
          <div className="hidden sm:flex items-center gap-1 text-[#8E6C42]/70">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-[#8E6C42]/70 to-transparent" />
            <span className="text-xs">❖</span>
          </div>
        </div>
      </div>
    </div>
  )
}
