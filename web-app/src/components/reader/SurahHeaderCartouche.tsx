"use client"

import type { Chapter } from "@/types/quran"
import { toArabicDigits } from "./AyahText"
import { cn } from "@/lib/utils"
import { getSurahCalligraphyChar } from "@/lib/aqfFontMap"

interface SurahHeaderCartoucheProps {
  chapter: Chapter
  className?: string
}

/**
 * Authentic Madani Mushaf Surah Header Cartouche (عنوان السورة المذهب)
 * Inspired by King Fahd Complex Quran illuminated manuscript frontispieces.
 * Features:
 * - Intricate vector arabesque & acanthus foliage side wings (Zakhrafah)
 * - Classical central arched Miḥrāb / dome cartouche
 * - Traditional metadata: Makki/Madani indicator & Ayah count
 * - Calligraphic Surah title
 */
export function SurahHeaderCartouche({ chapter, className }: SurahHeaderCartoucheProps) {
  const surahNameClean = chapter.name_arabic.replace(/^سورة\s+/i, "")
  const isMadani = chapter.revelation_place === "madinah"
  const placeText = isMadani ? "مَدَنِيَّة" : "مَكِّيَّة"
  const versesText = `${toArabicDigits(chapter.verses_count)} آيَاتُهَا`
  const surahCalligraphyGlyph = getSurahCalligraphyChar(chapter.id)

  return (
    <div
      dir="rtl"
      lang="ar"
      role="region"
      aria-label={`سورة ${chapter.name_arabic}`}
      className={cn(
        "relative mx-auto my-2 sm:my-3 w-full select-none max-w-[680px]",
        className,
      )}
    >
      {/* Outer Ornamental Frame Box */}
      <div className="relative w-full h-[62px] sm:h-[72px] md:h-[80px] rounded-[3px] border-[1.5px] border-[#9E783E] dark:border-[#B59152] bg-[#FAF6EE] dark:bg-[#1E1912] shadow-xs overflow-hidden flex items-center justify-between px-2 sm:px-3">
        
        {/* Intricate Classical Background Vignette */}
        <div className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-25 bg-[radial-gradient(#9E783E_1px,transparent_1px)] [background-size:6px_6px]" />

        {/* Outer Frame Double-Border */}
        <div className="pointer-events-none absolute inset-[2px] rounded-[2px] border border-[#9E783E]/50 dark:border-[#B59152]/50" />
        <div className="pointer-events-none absolute inset-[4px] rounded-[1px] border border-[#9E783E]/25 dark:border-[#B59152]/25" />

        {/* ─── RIGHT WING: Arabesque Foliage + Revelation Place (مكية / مدنية) ─── */}
        <div className="relative z-10 flex items-center h-full flex-1 min-w-0 justify-start overflow-hidden">
          {/* Detailed Islamic Arabesque Scroll SVG */}
          <svg
            className="absolute inset-y-0 right-0 h-full w-full max-w-[180px] sm:max-w-[220px] text-[#9E783E] dark:text-[#C5A365] opacity-80"
            viewBox="0 0 200 70"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Foliage vine base curves */}
            <path
              d="M0,35 Q30,10 60,35 T120,35 T180,35"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="2 1"
            />
            {/* Intricate spiraling floral leaves */}
            <path
              d="M10,35 C15,18 35,12 45,28 C55,10 75,18 70,35 C85,20 105,22 100,38 C115,22 135,28 130,42 C145,28 165,30 160,48"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path
              d="M10,35 C15,52 35,58 45,42 C55,60 75,52 70,35 C85,50 105,48 100,32 C115,48 135,42 130,28 C145,42 165,40 160,22"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity="0.08"
            />
            {/* Arabesque Leaf Nodes & Palmettes */}
            <circle cx="25" cy="35" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="55" cy="25" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="55" cy="45" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="85" cy="35" r="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="115" cy="22" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="115" cy="48" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="145" cy="35" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
            
            {/* Corner Decorative Finial */}
            <path d="M195,5 L185,5 L195,15 Z" fill="currentColor" opacity="0.6" />
            <path d="M195,65 L185,65 L195,55 Z" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Revelation Place Pill */}
          <div className="relative z-10 mr-1 sm:mr-3 px-2 sm:px-3 py-1 rounded-sm border border-[#9E783E]/60 dark:border-[#B59152]/60 bg-[#FAF6EE]/90 dark:bg-[#1E1912]/90 backdrop-blur-xs shadow-2xs">
            <span className="quran-arabic text-[11px] sm:text-xs md:text-[13px] font-bold text-[#634921] dark:text-[#E2C792] whitespace-nowrap leading-none block">
              {placeText}
            </span>
          </div>
        </div>

        {/* ─── CENTER CARTOUCHE: Miḥrāb Dome with Calligraphic Surah Name ─── */}
        <div className="relative z-20 shrink-0 mx-1 sm:mx-2 px-4 sm:px-8 py-1 sm:py-1.5 min-w-[160px] sm:min-w-[220px] md:min-w-[260px] h-[82%] rounded-md border-2 border-[#9E783E] dark:border-[#C5A365] bg-[#FFFDF9] dark:bg-[#18130D] shadow-sm flex items-center justify-center">
          
          {/* Subtle Inner Framing Border */}
          <div className="pointer-events-none absolute inset-[2px] rounded-xs border border-[#9E783E]/40" />

          {/* Side Mihrab Arch Trim */}
          <div className="pointer-events-none absolute -right-[1px] top-1/2 -translate-y-1/2 w-2 h-4 border-r-2 border-y-2 border-[#9E783E] rounded-r-full bg-[#FAF6EE] dark:bg-[#1E1912]" />
          <div className="pointer-events-none absolute -left-[1px] top-1/2 -translate-y-1/2 w-2 h-4 border-l-2 border-y-2 border-[#9E783E] rounded-l-full bg-[#FAF6EE] dark:bg-[#1E1912]" />

          {/* Calligraphic Surah Emblem Title */}
          {surahCalligraphyGlyph ? (
            <h2 className="aqf-bsml text-2xl sm:text-3xl md:text-[2.25rem] text-[#2C1D0C] dark:text-[#F8EEDB] tracking-normal leading-none drop-shadow-2xs text-center">
              {surahCalligraphyGlyph}
            </h2>
          ) : (
            <h2 className="quran-arabic font-uthmani text-xl sm:text-2xl md:text-[1.85rem] font-extrabold text-[#2C1D0C] dark:text-[#F8EEDB] tracking-wide leading-none drop-shadow-2xs text-center">
              سُورَةُ {surahNameClean}
            </h2>
          )}
        </div>

        {/* ─── LEFT WING: Arabesque Foliage + Ayah Count (آياتها) ─── */}
        <div className="relative z-10 flex items-center h-full flex-1 min-w-0 justify-end overflow-hidden">
          {/* Detailed Islamic Arabesque Scroll SVG (Flipped for symmetry) */}
          <svg
            className="absolute inset-y-0 left-0 h-full w-full max-w-[180px] sm:max-w-[220px] text-[#9E783E] dark:text-[#C5A365] opacity-80 scale-x-[-1]"
            viewBox="0 0 200 70"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,35 Q30,10 60,35 T120,35 T180,35"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="2 1"
            />
            <path
              d="M10,35 C15,18 35,12 45,28 C55,10 75,18 70,35 C85,20 105,22 100,38 C115,22 135,28 130,42 C145,28 165,30 160,48"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path
              d="M10,35 C15,52 35,58 45,42 C55,60 75,52 70,35 C85,50 105,48 100,32 C115,48 135,42 130,28 C145,42 165,40 160,22"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <circle cx="25" cy="35" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="55" cy="25" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="55" cy="45" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="85" cy="35" r="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="115" cy="22" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="115" cy="48" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="145" cy="35" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
            <path d="M195,5 L185,5 L195,15 Z" fill="currentColor" opacity="0.6" />
            <path d="M195,65 L185,65 L195,55 Z" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Verses Count Pill */}
          <div className="relative z-10 ml-1 sm:ml-3 px-2 sm:px-3 py-1 rounded-sm border border-[#9E783E]/60 dark:border-[#B59152]/60 bg-[#FAF6EE]/90 dark:bg-[#1E1912]/90 backdrop-blur-xs shadow-2xs">
            <span className="quran-arabic text-[11px] sm:text-xs md:text-[13px] font-bold text-[#634921] dark:text-[#E2C792] whitespace-nowrap leading-none block">
              {versesText}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
