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
    <div className={cn("relative mx-auto my-6 sm:my-8 w-full max-w-[760px] px-2 sm:px-4", className)}>
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
          "p-2 sm:p-3 md:p-4",
        )}
      >
        {/* Subtle Outer Frame Rule */}
        <div className="relative rounded-xs border border-[#C2A676]/60 dark:border-[#7A6440]/60 p-2 sm:p-3 md:p-4">
          {/* Main Quranic Text Body (15-line flow) */}
          <main className="relative z-10 min-h-[360px] py-1">
            {children}
          </main>

          {/* Bottom Page Footer: Centered Oriental Page Numeral in matching Gold Cartouche */}
          <footer
            aria-label={`Page ${pageNumber}`}
            className="mt-4 sm:mt-6 border-t border-[#C2A676]/60 dark:border-[#7A6440]/60 pt-3 flex items-center justify-center select-none"
          >
            <div className="relative inline-flex items-center justify-center w-[36px] h-[44px]">
              <svg
                viewBox="0 0 32 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 size-full text-[#9C7944] dark:text-[#C5A365] drop-shadow-2xs overflow-visible"
              >
                <ellipse
                  cx="16"
                  cy="19"
                  rx="12.5"
                  ry="14.5"
                  fill="#FAF4E8"
                  fillOpacity="0.85"
                  className="dark:fill-[#201C17] dark:fill-opacity-90"
                />
                <path
                  d="M 16,1.5 C 17.5,3.8 20.5,4.5 22,6.5 C 20.5,7.2 18.5,6.5 16,8.5 C 13.5,6.5 11.5,7.2 10,6.5 C 11.5,4.5 14.5,3.8 16,1.5 Z"
                  fill="currentColor"
                  fillOpacity="0.8"
                />
                <circle cx="16" cy="1.2" r="0.9" fill="currentColor" />
                <circle cx="11.5" cy="5.5" r="0.65" fill="currentColor" opacity="0.7" />
                <circle cx="20.5" cy="5.5" r="0.65" fill="currentColor" opacity="0.7" />
                <path
                  d="M 16,36.5 C 17.5,34.2 20.5,33.5 22,31.5 C 20.5,30.8 18.5,31.5 16,29.5 C 13.5,31.5 11.5,30.8 10,31.5 C 11.5,33.5 14.5,34.2 16,36.5 Z"
                  fill="currentColor"
                  fillOpacity="0.8"
                />
                <circle cx="16" cy="36.8" r="0.9" fill="currentColor" />
                <circle cx="11.5" cy="32.5" r="0.65" fill="currentColor" opacity="0.7" />
                <circle cx="20.5" cy="32.5" r="0.65" fill="currentColor" opacity="0.7" />
                <ellipse
                  cx="16"
                  cy="19"
                  rx="13.2"
                  ry="14.8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <ellipse
                  cx="16"
                  cy="19"
                  rx="11.2"
                  ry="12.8"
                  stroke="currentColor"
                  strokeWidth="0.7"
                  strokeDasharray="1.5 1"
                  opacity="0.9"
                />
                <circle cx="2.2" cy="19" r="0.85" fill="currentColor" />
                <circle cx="29.8" cy="19" r="0.85" fill="currentColor" />
              </svg>
              <span className="relative z-10 font-bold font-mono tabular-nums text-sm text-[#231A0F] dark:text-[#F4ECE0] leading-none text-center">
                {toArabicDigits(pageNumber)}
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}


