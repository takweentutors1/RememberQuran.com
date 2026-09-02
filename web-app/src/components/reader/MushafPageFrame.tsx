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

          {/* Bottom Page Footer: Centered Oriental Page Numeral in matching Compact Black Emblem */}
          <footer
            aria-label={`Page ${pageNumber}`}
            className="mt-4 sm:mt-6 border-t border-[#C2A676]/60 dark:border-[#7A6440]/60 pt-3 flex items-center justify-center select-none"
          >
            <div className="relative inline-flex items-center justify-center size-[30px]">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full text-[#1A1612] dark:text-[#EAE3D6] drop-shadow-2xs overflow-visible"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="12.5"
                  fill="#FFFDF9"
                  className="dark:fill-[#1A1612]"
                />
                <path
                  d="
                    M 16,1.8 L 18.2,3.8 L 21.2,2.8 L 22.8,5.5 L 26,5.8 L 26.5,9 L 29.2,10.5 L 28.5,13.5 L 30.5,16 L 28.5,18.5 L 29.2,21.5 L 26.5,23 L 26,26.2 L 22.8,26.5 L 21.2,29.2 L 18.2,28.2 L 16,30.2 L 13.8,28.2 L 10.8,29.2 L 9.2,26.5 L 6,26.2 L 5.5,23 L 2.8,21.5 L 3.5,18.5 L 1.5,16 L 3.5,13.5 L 2.8,10.5 L 5.5,9 L 6,5.8 L 9.2,5.5 L 10.8,2.8 L 13.8,3.8 Z
                  "
                  fill="currentColor"
                  fillOpacity="0.18"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="10.8"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  strokeDasharray="1.2 1"
                  opacity="0.8"
                />
                <text
                  x="16"
                  y="16"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="currentColor"
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


