"use client"

import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahHeaderCartoucheProps {
  chapter: Chapter
  className?: string
}

/**
 * Authentic Madani Mushaf Surah Header Cartouche (عنوان السورة المذهب)
 * Rich illuminated Islamic manuscript aesthetic:
 * - Double gold hairline Arabesque border with corner finials
 * - Classical Islimi / Arabesque scrollwork medallion wings
 * - Regal Uthmanic calligraphic title banner with ornate brackets
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
        "relative mx-auto my-3 sm:my-3.5 w-full select-none",
        className,
      )}
      style={{ fontSize: "16px" }}
    >
      {/* Outer Illuminated Frame with Gold Foil Styling */}
      <div className="relative w-full rounded-xs border-2 border-[#A88448] dark:border-[#C5A059] bg-[#FAF6EE] dark:bg-[#1C1813] shadow-xs flex items-stretch overflow-hidden">
        
        {/* Right Arabesque Wing (RTL start) */}
        <div className="shrink-0 w-[20%] sm:w-[24%] md:w-[28%] border-l-2 border-[#A88448] dark:border-[#C5A059] flex items-center justify-center p-1 sm:p-2 relative bg-gradient-to-l from-[#F5EFE0] to-[#EFE5CD] dark:from-[#201C16] dark:to-[#171410]">
          <svg viewBox="0 0 160 56" className="w-full h-full text-[#96743A] dark:text-[#C5A059]" fill="none">
            {/* Outer Arabesque Flourish */}
            <path
              d="M 5,28 C 25,10 40,46 65,28 C 90,10 105,46 130,28 C 142,20 152,28 158,28"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Mirrored interlaced wave */}
            <path
              d="M 5,28 C 25,46 40,10 65,28 C 90,46 105,10 130,28 C 142,36 152,28 158,28"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Center rosette jewels */}
            <circle cx="28" cy="28" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="65" cy="28" r="4" fill="currentColor" opacity="0.9" />
            <circle cx="102" cy="28" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="138" cy="28" r="2.5" fill="currentColor" opacity="0.75" />
          </svg>
        </div>

        {/* ─── CENTER CARTOUCHE: Crisp Calligraphic Surah Title ─── */}
        <div className="flex-1 min-w-0 flex items-center justify-center px-3 sm:px-6 py-1 sm:py-1.5 bg-gradient-to-r from-[#FFFDF9] via-[#FAF6EE] to-[#FFFDF9] dark:from-[#181510] dark:via-[#1D1914] dark:to-[#181510]">
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="text-[#A88448] dark:text-[#C5A059] font-uthmani text-lg select-none" aria-hidden="true">
              ۞
            </span>
            <h2
              className="font-uthmani font-bold text-[#1E1B18] dark:text-[#F8F1E3] tracking-wide leading-normal text-center truncate py-0.5"
              style={{ fontSize: "2rem" }}
            >
              سُورَةُ {surahNameClean}
            </h2>
            <span className="text-[#A88448] dark:text-[#C5A059] font-uthmani text-lg select-none" aria-hidden="true">
              ۞
            </span>
          </div>
        </div>

        {/* Left Arabesque Wing (RTL end) */}
        <div className="shrink-0 w-[20%] sm:w-[24%] md:w-[28%] border-r-2 border-[#A88448] dark:border-[#C5A059] flex items-center justify-center p-1 sm:p-2 relative bg-gradient-to-r from-[#F5EFE0] to-[#EFE5CD] dark:from-[#201C16] dark:to-[#171410]">
          <svg viewBox="0 0 160 56" className="w-full h-full text-[#96743A] dark:text-[#C5A059]" fill="none">
            {/* Outer Arabesque Flourish */}
            <path
              d="M 155,28 C 135,10 120,46 95,28 C 70,10 55,46 30,28 C 18,20 8,28 2,28"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Mirrored interlaced wave */}
            <path
              d="M 155,28 C 135,46 120,10 95,28 C 70,46 55,10 30,28 C 18,36 8,28 2,28"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Center rosette jewels */}
            <circle cx="132" cy="28" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="95" cy="28" r="4" fill="currentColor" opacity="0.9" />
            <circle cx="58" cy="28" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="22" cy="28" r="2.5" fill="currentColor" opacity="0.75" />
          </svg>
        </div>

      </div>
    </div>
  )
}
