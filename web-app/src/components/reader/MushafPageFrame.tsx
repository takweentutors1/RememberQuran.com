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
 * - Special full-page arabesque floral illuminated border (Zakhrafa) for opening pages (Surah 1 & 2)
 * - Arched inner dome frame recreating the iconic Madinah Mushaf frontispiece
 * - Multi-layer gold-ruled framing with decorative corner finials for standard pages
 * - Subtle minimalist dual-cell header bar (Juz & Surah)
 * - Framed oriental page counter medallion in the footer
 * - Parchment textured background with authentic page depth
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
  const isOpeningIlluminatedPage = pageNumber === 1 || pageNumber === 2

  return (
    <div className={cn("relative mx-auto my-6 sm:my-8 w-full max-w-[820px]", className)}>
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
        className="relative z-10 mx-auto mb-3 sm:mb-4 flex max-w-md items-center justify-between rounded-sm border border-[#D5CEBF] dark:border-[#4A3F33] bg-[#F7F3E9] dark:bg-[#1E1914] px-4 py-1 text-xs sm:text-sm font-medium text-[#5D5447] dark:text-[#C5BBAA] shadow-2xs select-none"
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

      {/* Main Mushaf Page Container with Authentic Manuscript Framing */}
      <div
        className={cn(
          "relative overflow-hidden transition-colors duration-300",
          "bg-[#FAF7F0] dark:bg-[#1B1612] text-[#22201D] dark:text-[#E8E2D5]",
          "border border-[#D0C5B0] dark:border-[#4A3E31] rounded-sm shadow-md",
          isOpeningIlluminatedPage
            ? "p-2.5 sm:p-5 md:p-6"
            : "p-3 sm:p-6 md:p-8",
        )}
      >
        {/* Special Full-Page Arabesque Illumination (Zakhrafa) for Opening Pages */}
        {isOpeningIlluminatedPage ? (
          <div className="relative rounded-xs border-2 border-[#8E6C42] bg-[#FAF6EE] dark:bg-[#201A14] p-3 sm:p-5 md:p-6 shadow-inner">
            {/* Authentic Ornate Border Fill & Arched Dome SVG Frame */}
            <div className="pointer-events-none absolute inset-0 size-full overflow-hidden opacity-35 dark:opacity-30">
              <svg className="size-full" preserveAspectRatio="none" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Decorative outer ornamental grid */}
                <rect x="4" y="4" width="392" height="592" stroke="#8E6C42" strokeWidth="1.5" fill="none" />
                <rect x="8" y="8" width="384" height="584" stroke="#8E6C42" strokeWidth="0.75" strokeDasharray="3 2" fill="none" />
                
                {/* Upper Arched Decorative Mihrab Dome line */}
                <path
                  d="M20 180 C20 70, 70 20, 200 20 C330 20, 380 70, 380 180"
                  stroke="#8E6C42"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M26 182 C26 78, 76 26, 200 26 C324 26, 374 78, 374 182"
                  stroke="#8E6C42"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                  fill="none"
                />

                {/* Lower Arched Balancing Dome line */}
                <path
                  d="M20 420 C20 530, 70 580, 200 580 C330 580, 380 530, 380 420"
                  stroke="#8E6C42"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M26 418 C26 522, 76 574, 200 574 C324 574, 374 522, 374 418"
                  stroke="#8E6C42"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                  fill="none"
                />

                {/* Corner Floral Arabesques */}
                <circle cx="20" cy="20" r="12" stroke="#8E6C42" strokeWidth="0.75" fill="none" />
                <circle cx="380" cy="20" r="12" stroke="#8E6C42" strokeWidth="0.75" fill="none" />
                <circle cx="20" cy="580" r="12" stroke="#8E6C42" strokeWidth="0.75" fill="none" />
                <circle cx="380" cy="580" r="12" stroke="#8E6C42" strokeWidth="0.75" fill="none" />
              </svg>
            </div>

            {/* Inner Arched Domed Container holding page contents */}
            <main className="relative z-10 min-h-[380px] flex flex-col items-center justify-center text-center">
              {children}
            </main>
          </div>
        ) : (
          /* Standard Mushaf Page Frame with Double Gold Ruling */
          <div className="relative rounded-xs border border-[#8E6C42]/60 p-3 sm:p-5 md:p-6">
            {/* Corner Ornaments */}
            <div className="pointer-events-none absolute top-1 right-1 size-2.5 border-t border-r border-[#8E6C42]" />
            <div className="pointer-events-none absolute top-1 left-1 size-2.5 border-t border-l border-[#8E6C42]" />
            <div className="pointer-events-none absolute bottom-1 right-1 size-2.5 border-b border-r border-[#8E6C42]" />
            <div className="pointer-events-none absolute bottom-1 left-1 size-2.5 border-b border-l border-[#8E6C42]" />

            <main className="relative z-10 min-h-[350px]">
              {children}
            </main>
          </div>
        )}
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

