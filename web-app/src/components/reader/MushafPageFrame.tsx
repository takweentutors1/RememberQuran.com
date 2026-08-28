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
export function MushafPageFrame({
  pageNumber,
  juzNumber,
  surahNameArabic,
  children,
  marginBadges = [],
  className,
}: MushafPageFrameProps) {
  return (
    <div className={cn("relative mx-auto my-8 w-full max-w-4xl", className)}>
      {/* Outer Margin Badges (Placed outside the frame on desktop, inline on mobile) */}
      {marginBadges.length > 0 && (
        <div className="absolute -right-3 top-16 hidden flex-col gap-3 lg:flex translate-x-full pr-3">
          {marginBadges.map((badge) => (
            <div
              key={badge.id}
              dir="rtl"
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-gold/60 bg-gold/10 px-3 py-2 text-center shadow-xs backdrop-blur-xs",
                "transition-transform hover:scale-105",
              )}
            >
              <span className="quran-arabic text-sm font-semibold text-gold leading-tight">
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

      {/* Main Mushaf Page Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-gold/75",
          "bg-[var(--reader-paper)] p-4 sm:p-8 md:p-10 lg:p-12",
          "shadow-xl transition-shadow duration-300",
          "before:pointer-events-none before:absolute before:inset-2 before:rounded-xl sm:before:rounded-2xl before:border before:border-gold/40 before:border-solid",
        )}
      >
        {/* Four Corner Rosette Ornaments */}
        <div className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4 size-3 sm:size-4 border-t-2 border-r-2 border-gold" />
        <div className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 size-3 sm:size-4 border-t-2 border-l-2 border-gold" />
        <div className="pointer-events-none absolute bottom-3 right-3 sm:bottom-4 sm:right-4 size-3 sm:size-4 border-b-2 border-r-2 border-gold" />
        <div className="pointer-events-none absolute bottom-3 left-3 sm:bottom-4 sm:left-4 size-3 sm:size-4 border-b-2 border-l-2 border-gold" />

        {/* Top Header Bar */}
        <header
          dir="rtl"
          lang="ar"
          aria-label={`صفحة ${pageNumber}`}
          className="relative z-10 mb-6 sm:mb-8 flex items-center justify-between border-b border-gold/30 pb-3 text-gold select-none"
        >
          {/* Juz Name on Right (RTL) */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <span className="text-gold/50 text-[10px]">❖</span>
            <span className="quran-arabic">
              {juzNumber ? `الجُزْءُ ${toArabicDigits(juzNumber)}` : ""}
            </span>
          </div>

          {/* Central Motif */}
          <div className="flex items-center gap-2 text-gold/40">
            <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <span className="text-xs text-gold/70">۞</span>
            <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>

          {/* Surah Name on Left (RTL) */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <span className="quran-arabic">
              {surahNameArabic ? `سُورَةُ ${surahNameArabic.replace(/^سورة\s+/i, "")}` : ""}
            </span>
            <span className="text-gold/50 text-[10px]">❖</span>
          </div>
        </header>

        {/* Core Page Verses Content */}
        <main className="relative z-10 min-h-[300px] text-center leading-[2.2] sm:leading-[2.4]">
          {children}
        </main>

        {/* Bottom Page Footer with Authentic Number Medallion */}
        <footer
          aria-label={`Page ${pageNumber}`}
          className="relative z-10 mt-8 sm:mt-10 flex items-center justify-center border-t border-gold/30 pt-3.5 select-none"
        >
          <div className="flex items-center gap-3">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-gold/50 to-transparent" />
            <div className="flex items-center justify-center rounded-full border border-gold/60 bg-gold/10 px-3.5 py-1 text-gold shadow-xs">
              <span className="quran-arabic text-sm font-semibold tracking-wider">
                ﴿ {toArabicDigits(pageNumber)} ﴾
              </span>
            </div>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-gold/50 to-transparent" />
          </div>
        </footer>
      </div>
    </div>
  )
}
