"use client"

import type { Chapter } from "@/types/quran"
import { toArabicDigits } from "./AyahText"
import { cn } from "@/lib/utils"

interface SurahHeaderCartoucheProps {
  chapter: Chapter
  className?: string
}

/**
 * Classical illuminated Surah header cartouche (Unwan / عنوان السورة)
 * inspired by traditional King Fahd Complex / Madani Mushafs.
 * Features an authentic gilded Islamic geometric frame, calligraphy banner,
 * revelation place badge, and ayah count medallion.
 */
export function SurahHeaderCartouche({ chapter, className }: SurahHeaderCartoucheProps) {
  const isMakkah = chapter.revelation_place === "makkah"
  const revelationArabic = isMakkah ? "مَكِّيَّة" : "مَدَنِيَّة"
  const versesArabic = `${toArabicDigits(chapter.verses_count)} آيَاتٍ`

  return (
    <div
      dir="rtl"
      lang="ar"
      role="region"
      aria-label={`سورة ${chapter.name_arabic}`}
      className={cn(
        "relative mx-auto my-6 w-full max-w-2xl overflow-hidden rounded-xl",
        "border-2 border-gold/70 bg-gradient-to-b from-gold/15 via-gold/5 to-gold/15",
        "p-3.5 sm:p-5 shadow-xs select-none",
        className,
      )}
    >
      {/* Decorative Outer Hairline Inset */}
      <div className="pointer-events-none absolute inset-1 rounded-lg border border-gold/40 border-dashed" />

      {/* 4 Corner Geometric Ornaments */}
      <div className="pointer-events-none absolute top-1.5 right-1.5 size-2 rotate-45 border-t border-r border-gold" />
      <div className="pointer-events-none absolute top-1.5 left-1.5 size-2 rotate-45 border-t border-l border-gold" />
      <div className="pointer-events-none absolute bottom-1.5 right-1.5 size-2 rotate-45 border-b border-r border-gold" />
      <div className="pointer-events-none absolute bottom-1.5 left-1.5 size-2 rotate-45 border-b border-l border-gold" />

      {/* Header Content Grid */}
      <div className="relative z-10 flex flex-col items-center justify-between gap-2.5 sm:flex-row sm:gap-4">
        {/* Right Badge: Revelation Place */}
        <div className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
          <span className="size-1.5 rounded-full bg-gold/80" />
          <span className="quran-arabic text-sm leading-none">{revelationArabic}</span>
        </div>

        {/* Center: Illuminated Calligraphic Surah Name */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="text-gold/60 text-xs sm:text-sm">✦</span>
            <h2 className="quran-arabic text-2xl font-bold tracking-normal text-gold sm:text-3xl lg:text-[2rem] leading-tight">
              سُورَةُ {chapter.name_arabic.replace(/^سورة\s+/i, "")}
            </h2>
            <span className="text-gold/60 text-xs sm:text-sm">✦</span>
          </div>
          <span className="text-[11px] font-sans tracking-wider uppercase text-muted-foreground/80 font-medium mt-0.5">
            {chapter.name_simple} · {chapter.translated_name?.name}
          </span>
        </div>

        {/* Left Badge: Verse Count */}
        <div className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
          <span className="quran-arabic text-sm leading-none">{versesArabic}</span>
          <span className="size-1.5 rounded-full bg-gold/80" />
        </div>
      </div>
    </div>
  )
}
