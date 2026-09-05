import Link from "next/link"
import { BookOpenText, ImagePlus } from "lucide-react"
import { getAyahOfTheDay } from "@/lib/quran/ayah-of-the-day"
import { renderUthmaniText } from "@/lib/quran/uthmani-text"
import { cn } from "@/lib/utils"

export function AyahOfTheDayCard() {
  const ayah = getAyahOfTheDay()

  return (
    <section
      aria-labelledby="ayah-of-the-day-heading"
      className="glass-panel relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
    >
      <div>
        <p id="ayah-of-the-day-heading" className="eyebrow text-gold">
          AYAH OF THE DAY
        </p>

        <p
          className="mx-auto mt-6 text-center font-uthmani text-2xl leading-[1.9] text-reader-ink sm:text-[1.75rem]"
          dir="rtl"
          lang="ar"
        >
          {renderUthmaniText(ayah.arabic)}
        </p>

        <p className="mt-8 font-serif text-lg font-light leading-relaxed text-muted-foreground">
          &ldquo;{ayah.translation}&rdquo;
        </p>

        <p className="mt-2 text-sm tracking-wide text-subtle">
          {ayah.surah} {ayah.verseKey} · Dr. Mustafa Khattab
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href={`/${ayah.surahId}/${ayah.ayahId}`}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground sm:flex-none",
            "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
            "hover:-translate-y-px hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm active:translate-y-0 active:scale-[.98]",
          )}
        >
          <BookOpenText className="size-4 text-primary" strokeWidth={1.5} aria-hidden />
          Read in context
        </Link>
        <Link
          href={`/media-maker?verse=${encodeURIComponent(ayah.verseKey)}`}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground sm:flex-none",
            "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
            "hover:-translate-y-px hover:border-gold/30 hover:bg-muted/50 hover:shadow-sm active:translate-y-0 active:scale-[.98]",
          )}
        >
          <ImagePlus className="size-4 text-gold" strokeWidth={1.5} aria-hidden />
          Make a card
        </Link>
      </div>
    </section>
  )
}
