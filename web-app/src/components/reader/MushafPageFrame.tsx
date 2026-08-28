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
 * Implements traditional Islamic manuscript aesthetics:
 * - Multi-layer gold-ruled framing with decorative corner finials
 * - Classic top header bar with Surah Name and Juz Number
 * - Centered bottom page number medallion
 * - Tactile parchment background with subtle spine shadow
 * - Outer margin badges for Juz/Hizb boundaries
 */
// Helper to convert Juz number to formal Arabic ordinal name (e.g. 1 -> الأول, 2 -> الثاني, 3 -> الثالث)
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
    <div className={cn("relative mx-auto my-6 sm:my-8 w-full max-w-[840px]", className)}>
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

      {/* Main Mushaf Page Container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-[#D5CEBF] dark:border-[#42392D]",
          "bg-[#FAF8F2] dark:bg-[#1E1914] p-3.5 sm:p-7 md:p-9 lg:p-10",
          "shadow-sm transition-colors duration-300",
        )}
      >
        {/* Top Header Split Bar: Left = Surah Name, Right = Juz Ordinal */}
        <header
          dir="rtl"
          lang="ar"
          aria-label={`صفحة ${pageNumber}`}
          className="relative z-10 mx-auto mb-6 sm:mb-8 flex max-w-lg items-center justify-between border border-[#D2C7B2] dark:border-[#524638] bg-[#F4EFE6]/60 dark:bg-[#25201A]/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-[#5D5447] dark:text-[#C5BBAA] select-none"
        >
          {/* Right Cell: Juz Name */}
          <div className="flex-1 text-center font-serif quran-arabic">
            {juzNumber ? `الجزء ${juzOrdinal}` : ""}
          </div>

          {/* Center Dividing Line */}
          <div className="h-4 w-px bg-[#D2C7B2] dark:bg-[#524638]" />

          {/* Left Cell: Surah Name */}
          <div className="flex-1 text-center font-serif quran-arabic">
            {formattedSurahName}
          </div>
        </header>

        {/* Core Page Verses Content */}
        <main className="relative z-10 min-h-[350px]">
          {children}
        </main>

        {/* Bottom Page Footer: Centered Page Number */}
        <footer
          aria-label={`Page ${pageNumber}`}
          className="relative z-10 mt-8 sm:mt-10 flex items-center justify-center pt-2 select-none"
        >
          <span className="quran-arabic text-sm sm:text-base font-semibold text-[#5D5447] dark:text-[#B5AA96] tracking-widest font-mono">
            {toArabicDigits(pageNumber)}
          </span>
        </footer>
      </div>
    </div>
  )
}
