"use client"

import { cn } from "@/lib/utils"

interface BismillahHeaderProps {
  className?: string
}

/**
 * Authentic Calligraphic Bismillah Header (بسم الله الرحمن الرحيم)
 * Styled in the traditional King Fahd Complex / Madani Mushaf frontispiece calligraphy
 * with subtle golden-bronze hue matching printed Medina Mushaf.
 */
export function BismillahHeader({ className }: BismillahHeaderProps) {
  return (
    <div
      dir="rtl"
      lang="ar"
      role="banner"
      aria-label="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
      className={cn(
        "my-2 sm:my-3.5 flex items-center justify-center text-center select-none",
        className,
      )}
    >
      <p
        className="quran-arabic font-uthmani text-[1.85rem] sm:text-[2.2rem] md:text-[2.5rem] leading-none text-[#8C6D38] dark:text-[#D4AF37] drop-shadow-2xs tracking-wide font-normal"
        style={{
          fontFamily: '"UthmanicHafs", "KFGQPC Uthmanic Hafs", serif',
        }}
      >
        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
      </p>
    </div>
  )
}
