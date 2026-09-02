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

          {/* Bottom Page Footer: Centered Oriental Page Numeral in Isolated Inner Core Emblem */}
          <footer
            aria-label={`Page ${pageNumber}`}
            className="mt-4 sm:mt-6 border-t border-[#C2A676]/60 dark:border-[#7A6440]/60 pt-3 flex items-center justify-center select-none"
          >
            <div className="relative inline-flex items-center justify-center w-[22px] h-[26px]">
              <svg
                viewBox="0 0 22 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
              >
                <circle
                  cx="11"
                  cy="13"
                  r="8"
                  fill="#FFFDF9"
                  className="dark:fill-[#181512]"
                />
                <path
                  d="
                    M 11,0.8
                    C 12.8,2.8 16,3.8 17.5,6.2
                    C 15.5,7.5 13.5,7.2 11,7.2
                    C 8.5,7.2 6.5,7.5 4.5,6.2
                    C 6,3.8 9.2,2.8 11,0.8 Z
                  "
                  fill="currentColor"
                />
                <circle cx="11" cy="0.8" r="0.75" fill="currentColor" />
                <circle cx="11" cy="4.5" r="0.7" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="7.8" cy="5.2" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="14.2" cy="5.2" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <path
                  d="
                    M 11,25.2
                    C 12.8,23.2 16,22.2 17.5,19.8
                    C 15.5,18.5 13.5,18.8 11,18.8
                    C 8.5,18.8 6.5,18.5 4.5,19.8
                    C 6,22.2 9.2,23.2 11,25.2 Z
                  "
                  fill="currentColor"
                />
                <circle cx="11" cy="25.2" r="0.75" fill="currentColor" />
                <circle cx="11" cy="21.5" r="0.7" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="7.8" cy="20.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="14.2" cy="20.8" r="0.6" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle
                  cx="11"
                  cy="13"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <text
                  x="11"
                  y="13"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="currentColor"
                  style={{
                    fontFamily: '"UthmanicHafs", "KFGQPC Uthmanic Hafs", serif',
                    fontWeight: "bold",
                    fontSize: "12px",
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


