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

          {/* Bottom Page Footer: Centered Oriental Page Numeral in matching Circular Gold Rosette */}
          <footer
            aria-label={`Page ${pageNumber}`}
            className="mt-4 sm:mt-6 border-t border-[#C2A676]/60 dark:border-[#7A6440]/60 pt-3 flex items-center justify-center select-none"
          >
            <div className="relative inline-flex items-center justify-center size-[38px]">
              <svg
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full text-[#9E783E] dark:text-[#C5A365] drop-shadow-2xs overflow-visible"
              >
                <circle
                  cx="22"
                  cy="22"
                  r="16.5"
                  fill="#FAF5EB"
                  fillOpacity="0.9"
                  className="dark:fill-[#1E1912] dark:fill-opacity-95"
                />
                <path
                  d="M 22,2.2 L 23.8,5.5 L 22,7.2 L 20.2,5.5 Z"
                  fill="currentColor"
                />
                <path
                  d="M 18.5,6 C 20,4.5 24,4.5 25.5,6 C 24,7.2 20,7.2 18.5,6 Z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <circle cx="22" cy="1.8" r="0.75" fill="currentColor" />
                <path
                  d="M 22,41.8 L 23.8,38.5 L 22,36.8 L 20.2,38.5 Z"
                  fill="currentColor"
                />
                <path
                  d="M 18.5,38 C 20,39.5 24,39.5 25.5,38 C 24,36.8 20,36.8 18.5,38 Z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <circle cx="22" cy="42.2" r="0.75" fill="currentColor" />
                <path
                  d="M 41.8,22 L 38.5,23.8 L 36.8,22 L 38.5,20.2 Z"
                  fill="currentColor"
                />
                <circle cx="42.2" cy="22" r="0.75" fill="currentColor" />
                <path
                  d="M 2.2,22 L 5.5,23.8 L 7.2,22 L 5.5,20.2 Z"
                  fill="currentColor"
                />
                <circle cx="1.8" cy="22" r="0.75" fill="currentColor" />
                <circle
                  cx="22"
                  cy="22"
                  r="16.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="14.8"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeDasharray="2 1.5"
                  opacity="0.95"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="13.2"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
                <circle cx="33.5" cy="10.5" r="0.8" fill="currentColor" opacity="0.8" />
                <circle cx="10.5" cy="10.5" r="0.8" fill="currentColor" opacity="0.8" />
                <circle cx="33.5" cy="33.5" r="0.8" fill="currentColor" opacity="0.8" />
                <circle cx="10.5" cy="33.5" r="0.8" fill="currentColor" opacity="0.8" />
                <text
                  x="22"
                  y="22"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#231A0F"
                  className="dark:fill-[#F4ECE0]"
                  style={{
                    fontFamily: '"UthmanicHafs", "KFGQPC Uthmanic Hafs", serif',
                    fontWeight: "bold",
                    fontSize: "14px",
                    letterSpacing: "0",
                  }}
                >
                  {toArabicDigits(pageNumber)}
                </text>
              </svg>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}


