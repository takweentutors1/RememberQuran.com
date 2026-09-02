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
      <div className="relative w-full h-[64px] sm:h-[76px] md:h-[84px] rounded-xs border-2 border-[#8C6D38] dark:border-[#B59152] bg-[#FAF6EE] dark:bg-[#1C1813] shadow-md overflow-hidden flex items-center justify-center px-3 sm:px-6">
        
        {/* Full Arabesque Background Woodblock Engraving SVG */}
        <svg
          className="absolute inset-0 w-full h-full text-[#8C6D38]/40 dark:text-[#B59152]/30 pointer-events-none"
          viewBox="0 0 700 90"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Top & Bottom Repeating Scalloped Borders */}
          <path
            d="M 0,6 Q 25,18 50,6 T 100,6 T 150,6 T 200,6 T 250,6 T 300,6 T 350,6 T 400,6 T 450,6 T 500,6 T 550,6 T 600,6 T 650,6 T 700,6"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            d="M 0,84 Q 25,72 50,84 T 100,84 T 150,84 T 200,84 T 250,84 T 300,84 T 350,84 T 400,84 T 450,84 T 500,84 T 550,84 T 600,84 T 650,84 T 700,84"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          {/* Left Floral Foliage Vines */}
          <path
            d="M 15,45 C 35,15 70,15 90,45 C 110,75 145,75 165,45"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="50" cy="30" r="5" fill="currentColor" opacity="0.6" />
          <circle cx="130" cy="60" r="5" fill="currentColor" opacity="0.6" />
          <path d="M 30,45 C 40,25 60,25 70,45 C 80,65 100,65 110,45" stroke="currentColor" strokeWidth="1.5" />

          {/* Right Floral Foliage Vines */}
          <path
            d="M 685,45 C 665,15 630,15 610,45 C 590,75 555,75 535,45"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="650" cy="30" r="5" fill="currentColor" opacity="0.6" />
          <circle cx="570" cy="60" r="5" fill="currentColor" opacity="0.6" />
          <path d="M 670,45 C 660,25 640,25 630,45 C 620,65 600,65 590,45" stroke="currentColor" strokeWidth="1.5" />

          {/* Side Floral Rosettes */}
          <circle cx="35" cy="45" r="14" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="665" cy="45" r="14" stroke="currentColor" strokeWidth="1.8" />
        </svg>

        {/* ─── CENTER CARTOUCHE: Clear Manuscript Frame with Calligraphic Surah Name ─── */}
        <div className="relative z-10 px-6 sm:px-12 py-1 sm:py-1.5 min-w-[200px] sm:min-w-[280px] md:min-w-[320px] rounded-xs border-2 border-[#8C6D38] dark:border-[#B59152] bg-[#FFFDF9] dark:bg-[#14110C] shadow-sm flex items-center justify-center">
          
          {/* Subtle Inner Double Hairline */}
          <div className="pointer-events-none absolute inset-[2px] rounded-xs border border-[#8C6D38]/50" />

          {/* Surah Name Title */}
          <h2 className="quran-arabic font-uthmani text-2xl sm:text-3xl md:text-[2.1rem] font-bold text-[#2A1D0D] dark:text-[#F6EBD9] tracking-wide leading-none py-0.5 text-center">
            سُورَةُ {surahNameClean}
          </h2>
        </div>

      </div>
    </div>
  )
}
