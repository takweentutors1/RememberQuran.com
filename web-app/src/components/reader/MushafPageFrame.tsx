"use client"

import type { ReactNode } from "react"
import { toArabicDigits } from "./AyahText"
import { cn } from "@/lib/utils"

interface MarginBadge {
  id: string
  label: string
  sublabel?: string
  type: "juz" | "hizb" | "rub"
}

interface MushafPageFrameProps {
  pageNumber: number
  juzNumber?: number
  surahNameArabic?: string
  children: ReactNode
  marginBadges?: MarginBadge[]
  className?: string
}

/**
 * Authentic Printed Mushaf Page Frame (إطار المصحف الشريف)
 * Clean, plain, high-contrast manuscript canvas:
 * - Minimalist double gold hairline framing with subtle corner finials
 * - Crisp plain warm background (#FDFBF7 in light, #141311 in dark)
 * - Clear, readable header and footer cartouches
 */
const JUZ_NAMES_ARABIC: Record<number, string> = {
  1: "الأول",
  2: "الثاني",
  3: "الثالث",
  4: "الرابع",
  5: "الخامس",
  6: "السادس",
  7: "السابع",
  8: "الثامن",
  9: "التاسع",
  10: "العاشر",
  11: "الحادي عشر",
  12: "الثاني عشر",
  13: "الثالث عشر",
  14: "الرابع عشر",
  15: "الخامس عشر",
  16: "السادس عشر",
  17: "السابع عشر",
  18: "الثامن عشر",
  19: "التاسع عشر",
  20: "العشرون",
  21: "الحادي والعشرون",
  22: "الثاني والعشرون",
  23: "الثالث والعشرون",
  24: "الرابع والعشرون",
  25: "الخامس والعشرون",
  26: "السادس والعشرون",
  27: "السابع والعشرون",
  28: "الثامن والعشرون",
  29: "التاسع والعشرون",
  30: "الثلاثون",
}

export function MushafPageFrame({
  pageNumber,
  juzNumber,
  surahNameArabic,
  children,
  marginBadges = [],
  className,
}: MushafPageFrameProps) {
  const juzOrdinal = juzNumber ? JUZ_NAMES_ARABIC[juzNumber] || toArabicDigits(juzNumber) : ""
  const cleanSurahName = surahNameArabic ? surahNameArabic.replace(/^سورة\s+/i, "") : ""

  return (
    <div className={cn("relative mx-auto my-6 sm:my-8 w-full max-w-[840px] px-2 sm:px-4", className)}>
      {/* Outer Margin Badges (Desktop) */}
      {marginBadges.length > 0 && (
        <div className="absolute -right-3 top-12 hidden flex-col gap-3 lg:flex translate-x-full pr-3">
          {marginBadges.map((badge) => (
            <div
              key={badge.id}
              dir="rtl"
              className={cn(
                "flex flex-col items-center justify-center rounded-sm border border-[#C2A676]/60 bg-[#FAF7EE] dark:bg-[#201C17] px-3.5 py-2 text-center shadow-xs",
                "transition-transform hover:scale-105",
              )}
            >
              <span className="quran-arabic text-sm font-semibold text-[#8C6D38] dark:text-[#D4AF37] leading-tight">
                {badge.label}
              </span>
              {badge.sublabel && (
                <span className="mt-0.5 text-[10px] font-mono tabular-nums text-muted-foreground">
                  {badge.sublabel}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Mushaf Page Container - Exact King Fahd Complex Manuscript Geometry */}
      <div
        className={cn(
          "relative overflow-hidden transition-colors duration-300",
          "bg-[#FBF9F4] dark:bg-[#151412] text-[#1E1B18] dark:text-[#ECE6DA]",
          "border border-[#D8D1C3] dark:border-[#383227] rounded-sm shadow-md",
          "p-3.5 sm:p-6 md:p-8",
        )}
      >
        {/* Subtle Outer Frame Rule */}
        <div className="relative rounded-xs border border-[#C2A676]/60 dark:border-[#7A6440]/60 p-3 sm:p-5 md:p-6">
          {/* Authentic Top Header Bar inside the frame */}
          <header
            dir="rtl"
            lang="ar"
            aria-label={`صفحة ${pageNumber}`}
            className="mb-4 sm:mb-6 flex items-center justify-between border-b border-[#C2A676]/60 dark:border-[#7A6440]/60 pb-2.5 px-2 select-none"
          >
            {/* Surah Name (Outer/Inner traditional header cell) */}
            <div className="flex items-center gap-1.5 font-serif quran-arabic text-sm sm:text-base font-semibold text-[#3C3224] dark:text-[#DCD2C0]">
              <span className="text-xs text-[#8C6D38] dark:text-[#C5A375]">سورة</span>
              <span>{cleanSurahName}</span>
            </div>

            {/* Subtle Center Rosette / Star Accent */}
            <div className="flex items-center gap-1.5 opacity-60">
              <span className="h-px w-6 sm:w-12 bg-[#C2A676] dark:bg-[#7A6440]" />
              <span className="text-[10px] text-[#8C6D38] dark:text-[#D4AF37]">۞</span>
              <span className="h-px w-6 sm:w-12 bg-[#C2A676] dark:bg-[#7A6440]" />
            </div>

            {/* Juz Header Cell */}
            <div className="flex items-center gap-1.5 font-serif quran-arabic text-sm sm:text-base font-semibold text-[#3C3224] dark:text-[#DCD2C0]">
              {juzNumber ? (
                <>
                  <span className="text-xs text-[#8C6D38] dark:text-[#C5A375]">الجزء</span>
                  <span>{juzOrdinal}</span>
                </>
              ) : null}
            </div>
          </header>

          {/* Main Quranic Text Body (15-line flow) */}
          <main className="relative z-10 min-h-[360px] py-1">
            {children}
          </main>

          {/* Bottom Page Footer: Centered Oriental Page Numeral */}
          <footer
            aria-label={`Page ${pageNumber}`}
            className="mt-4 sm:mt-6 border-t border-[#C2A676]/60 dark:border-[#7A6440]/60 pt-2 flex items-center justify-center select-none"
          >
            <span className="quran-arabic font-uthmani text-sm sm:text-base font-bold text-[#4B3E2C] dark:text-[#D0C6B4] leading-none">
              {toArabicDigits(pageNumber)}
            </span>
          </footer>
        </div>
      </div>
    </div>
  )
}


