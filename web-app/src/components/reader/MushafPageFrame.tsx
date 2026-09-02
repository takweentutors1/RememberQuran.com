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

          {/* Bottom Page Footer: Centered Oriental Page Numeral in Image-2 Lace Emblem */}
          <footer
            aria-label={`Page ${pageNumber}`}
            className="mt-4 sm:mt-6 border-t border-[#C2A676]/60 dark:border-[#7A6440]/60 pt-3 flex items-center justify-center select-none"
          >
            <div className="relative inline-flex items-center justify-center w-[30px] h-[36px]">
              <svg
                viewBox="0 0 32 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full text-[#1A1612] dark:text-[#EDE6DA] drop-shadow-2xs overflow-visible"
              >
                <ellipse
                  cx="16"
                  cy="19"
                  rx="13.2"
                  ry="12"
                  fill="#FFFDF9"
                  className="dark:fill-[#181512]"
                />
                <path
                  d="
                    M 16,1.5
                    C 18.5,4.5 22.5,5.2 24.5,7.8
                    C 21.5,9.5 19,9 16,9.2
                    C 13,9 10.5,9.5 7.5,7.8
                    C 9.5,5.2 13.5,4.5 16,1.5 Z
                  "
                  fill="currentColor"
                />
                <circle cx="16" cy="1.2" r="0.85" fill="currentColor" />
                <circle cx="16" cy="6" r="0.9" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="11.5" cy="6.8" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="20.5" cy="6.8" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <path
                  d="
                    M 16,36.5
                    C 18.5,33.5 22.5,32.8 24.5,30.2
                    C 21.5,28.5 19,29 16,28.8
                    C 13,29 10.5,28.5 7.5,30.2
                    C 9.5,32.8 13.5,33.5 16,36.5 Z
                  "
                  fill="currentColor"
                />
                <circle cx="16" cy="36.8" r="0.85" fill="currentColor" />
                <circle cx="16" cy="32" r="0.9" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="11.5" cy="31.2" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <circle cx="20.5" cy="31.2" r="0.8" fill="#FFFDF9" className="dark:fill-[#181512]" />
                <ellipse
                  cx="16"
                  cy="19"
                  rx="13.2"
                  ry="12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <text
                  x="16"
                  y="19"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="currentColor"
                  style={{
                    fontFamily: '"UthmanicHafs", "KFGQPC Uthmanic Hafs", serif',
                    fontWeight: "bold",
                    fontSize: "13.5px",
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


