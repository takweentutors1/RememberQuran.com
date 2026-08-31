"use client"

import { cn } from "@/lib/utils"

interface BismillahHeaderProps {
  className?: string
}

/**
 * Authentic Calligraphic Bismillah Header (بسم الله الرحمن الرحيم)
 * Styled in the traditional King Fahd Complex / Madani Mushaf frontispiece calligraphy
 * with illuminated gold flourishing accents.
 */
export function BismillahHeader({ className }: BismillahHeaderProps) {
  return (
    <div
      dir="rtl"
      lang="ar"
      role="banner"
      aria-label="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
      className={cn(
        "my-1.5 sm:my-2.5 flex flex-col items-center justify-center text-center select-none",
        className,
      )}
    >
      <div className="relative inline-flex items-center justify-center px-4">
        {/* Subtle decorative gold flanking accents */}
        <span className="hidden sm:inline-block w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#9E783E]/60 dark:to-[#D4AF37]/60 ml-3" />
        
        {/* Authentic Bismillah Calligraphic Text */}
        <p
          className="quran-arabic font-uthmani text-[1.85rem] sm:text-[2.15rem] md:text-[2.35rem] leading-none text-[#8C6D38] dark:text-[#E2C792] drop-shadow-2xs tracking-normal font-normal"
        >
          بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
        </p>

        <span className="hidden sm:inline-block w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#9E783E]/60 dark:to-[#D4AF37]/60 mr-3" />
      </div>
    </div>
  )
}
