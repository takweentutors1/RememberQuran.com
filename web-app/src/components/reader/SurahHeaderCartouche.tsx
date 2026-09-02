"use client"

import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahHeaderCartoucheProps {
  chapter: Chapter
  className?: string
}

/**
 * Authentic Madani Mushaf Surah Header Cartouche (عنوان السورة المذهب)
 * Exact replica of the King Fahd Complex woodblock arabesque manuscript cartouche:
 * - Intricate golden-brown woodblock arabesque border frame
 * - Crisp centered calligraphic title cartouche
 */
export function SurahHeaderCartouche({ chapter, className }: SurahHeaderCartoucheProps) {
  const surahNameClean = chapter.name_arabic.replace(/^سورة\s+/i, "")
  const pageSpan =
    chapter.pages && chapter.pages.length === 2
      ? chapter.pages[0] === chapter.pages[1]
        ? `Page ${chapter.pages[0]}`
        : `Pages ${chapter.pages[0]}–${chapter.pages[1]}`
      : null

  return (
    <div
      dir="rtl"
      lang="ar"
      role="region"
      aria-label={`سورة ${chapter.name_arabic}`}
      className={cn(
        "relative mx-auto my-3 sm:my-4 w-full select-none max-w-[680px]",
        className,
      )}
    >
      {/* Outer Arabesque Illuminated Border Box */}
      <div className="relative w-full h-[64px] sm:h-[76px] md:h-[84px] rounded-xs border-2 border-[#8C6D38] dark:border-[#B59152] bg-[#FAF6EE] dark:bg-[#1C1813] shadow-xs overflow-hidden flex items-stretch">
        
        {/* Right Arabesque Wing (RTL start) */}
        <div className="w-[28%] sm:w-[30%] border-l-2 border-[#8C6D38] dark:border-[#B59152] flex items-center justify-center p-1.5 relative overflow-hidden bg-[#FAF6EE] dark:bg-[#1C1813]">
          <svg viewBox="0 0 160 60" className="w-full h-full text-[#8C6D38]/70 dark:text-[#B59152]/70" fill="none" preserveAspectRatio="none">
            {/* Elegant double swirling ribbon arcs matching 2nd image */}
            <path d="M 10,30 C 35,5 65,55 90,30 C 115,5 140,45 155,30" stroke="currentColor" strokeWidth="1.8" />
            <path d="M 10,30 C 35,55 65,5 90,30 C 115,55 140,15 155,30" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" />
            <circle cx="45" cy="22" r="3.5" fill="currentColor" opacity="0.6" />
            <circle cx="105" cy="38" r="3.5" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

        {/* ─── CENTER CARTOUCHE: Crisp Calligraphic Surah Title ─── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 bg-[#FFFDF9] dark:bg-[#16130E] relative">
          <h2 className="quran-arabic font-uthmani text-2xl sm:text-3xl md:text-[2.2rem] font-bold text-[#1E1B18] dark:text-[#F6EBD9] tracking-wide leading-none py-0.5 text-center">
            سُورَةُ {surahNameClean}
          </h2>
        </div>

        {/* Left Arabesque Wing (RTL end) */}
        <div className="w-[28%] sm:w-[30%] border-r-2 border-[#8C6D38] dark:border-[#B59152] flex items-center justify-center p-1.5 relative overflow-hidden bg-[#FAF6EE] dark:bg-[#1C1813]">
          <svg viewBox="0 0 160 60" className="w-full h-full text-[#8C6D38]/70 dark:text-[#B59152]/70" fill="none" preserveAspectRatio="none">
            {/* Mirrored double swirling ribbon arcs matching 2nd image */}
            <path d="M 150,30 C 125,5 95,55 70,30 C 45,5 20,45 5,30" stroke="currentColor" strokeWidth="1.8" />
            <path d="M 150,30 C 125,55 95,5 70,30 C 45,55 20,15 5,30" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" />
            <circle cx="115" cy="22" r="3.5" fill="currentColor" opacity="0.6" />
            <circle cx="55" cy="38" r="3.5" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

      </div>
    </div>
  )
}
