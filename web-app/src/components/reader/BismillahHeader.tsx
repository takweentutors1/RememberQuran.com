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
        "my-3 sm:my-4 flex items-center justify-center text-center select-none",
        className,
      )}
    >
      <p
        className="quran-arabic text-[2.0rem] sm:text-[2.4rem] md:text-[2.75rem] leading-none text-[#1E1B18] dark:text-[#ECE6DA] tracking-wide font-normal"
        style={{
          fontFamily: '"aqf_bsml", "UthmanicHafs", serif',
        }}
      >
        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
      </p>
    </div>
  )
}
