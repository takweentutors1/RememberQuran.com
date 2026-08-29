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
  const formattedSurahName = surahNameArabic ? `سورة ${surahNameArabic.replace(/^سورة\s+/i, "")}` : ""

  return (
    <div className={cn("relative mx-auto my-6 sm:my-8 w-full max-w-[800px]", className)}>
      {/* Outer Margin Badges (Desktop) */}
      {marginBadges.length > 0 && (
        <div className="absolute -right-3 top-16 hidden flex-col gap-3 lg:flex translate-x-full pr-3">
          {marginBadges.map((badge) => (
            <div
              key={badge.id}
              dir="rtl"
              className={cn(
                "flex flex-col items-center justify-center rounded-md border border-[#8E6C42]/50 bg-[#F4EFE6]/90 dark:bg-[#2A241C]/90 px-3 py-2 text-center shadow-xs",
                "transition-transform hover:scale-105",
              )}
            >
              <span className="quran-arabic text-sm font-semibold text-[#8E6C42] dark:text-[#C5A375] leading-tight">
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

      {/* Top Header Split Bar: Right = Juz Ordinal, Left = Surah Name */}
      <header
        dir="rtl"
        lang="ar"
        aria-label={`صفحة ${pageNumber}`}
        className="relative z-10 mx-auto mb-3 sm:mb-4 flex max-w-sm items-center justify-between rounded-xs border border-[#D5CEBF] dark:border-[#4A3F33] bg-[#F7F3E9] dark:bg-[#1E1914] px-4 py-1 text-xs sm:text-sm font-medium text-[#5D5447] dark:text-[#C5BBAA] shadow-2xs select-none"
      >
        {/* Right Cell: Juz Name */}
        <div className="flex-1 text-center font-serif quran-arabic">
          {juzNumber ? `الجزء ${juzOrdinal}` : ""}
        </div>

        {/* Center Dividing Line */}
        <div className="h-3.5 w-px bg-[#D5CEBF] dark:bg-[#4A3F33]" />

        {/* Left Cell: Surah Name */}
        <div className="flex-1 text-center font-serif quran-arabic">
          {formattedSurahName}
        </div>
      </header>

      {/* Main Mushaf Page Container with Plain Clean Background */}
      <div
        className={cn(
          "relative overflow-hidden transition-colors duration-300",
          "bg-[#FDFBF7] dark:bg-[#141311] text-[#1E1B18] dark:text-[#E8E2D5]",
          "border border-[#D8D0C2] dark:border-[#383026] rounded-xs shadow-md p-4 sm:p-7 md:p-9",
        )}
      >
        {/* Elegant Minimalist Double Gold Inner Frame */}
        <div className="relative rounded-xs border border-[#8E6C42]/50 p-3.5 sm:p-6 md:p-7">
          {/* Subtle Corner Finials */}
          <div className="pointer-events-none absolute top-1 right-1 size-2 border-t border-r border-[#8E6C42]" />
          <div className="pointer-events-none absolute top-1 left-1 size-2 border-t border-l border-[#8E6C42]" />
          <div className="pointer-events-none absolute bottom-1 right-1 size-2 border-b border-r border-[#8E6C42]" />
          <div className="pointer-events-none absolute bottom-1 left-1 size-2 border-b border-l border-[#8E6C42]" />

          {/* Main Quranic Text Area */}
          <main className="relative z-10 min-h-[350px]">
            {children}
          </main>
        </div>
      </div>

      {/* Bottom Page Footer: Classical Framed Oriental Page Counter Cartouche */}
      <footer
        aria-label={`Page ${pageNumber}`}
        className="relative z-10 mt-3 sm:mt-4 flex items-center justify-center select-none"
      >
        <div className="inline-flex items-center justify-center rounded-xs border border-[#D5CEBF] dark:border-[#4A3F33] bg-[#F7F3E9] dark:bg-[#1E1914] px-4 py-0.5 shadow-2xs">
          <span className="quran-arabic font-uthmani text-sm sm:text-base font-semibold text-[#5D5447] dark:text-[#C5BBAA] leading-none">
            {toArabicDigits(pageNumber)}
          </span>
        </div>
      </footer>
    </div>
  )
}


