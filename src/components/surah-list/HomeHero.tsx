import Link from "next/link"
import { BookOpenText, ImagePlus } from "lucide-react"
import { getAyahOfTheDay } from "@/lib/quran/ayah-of-the-day"
import { cn } from "@/lib/utils"
import { HomeJumpField } from "./HomeJumpField"

const ACTION_CLASS = cn(
  "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium",
  "transition-[transform,background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-out)",
  "hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:scale-[.98]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)

/**
 * Home hero — the ayah of the day, not a marketing headline.
 *
 * The first thing on the page is Quran, in Arabic, at display size. Selection
 * is a pure UTC-day function over a static table (see
 * `lib/quran/ayah-of-the-day`), so this section stays statically renderable:
 * no fetch, no layout shift, and no third-party API on the critical path for
 * first paint of the most-hit route on the site.
 */
export function HomeHero() {
  const ayah = getAyahOfTheDay()

  return (
    <section
      aria-labelledby="ayah-of-the-day"
      className="relative isolate overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 text-center sm:py-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(55%_100%_at_50%_0%,var(--brand-gold-soft)_0%,transparent_72%)]"
      />

      <h1
        id="ayah-of-the-day"
        className="text-[11px] font-medium uppercase tracking-[0.14em] text-gold"
      >
        Ayah of the day
      </h1>

      <p
        className="mx-auto mt-5 max-w-3xl font-uthmani text-[2rem] leading-[1.95] text-reader-ink sm:text-[2.5rem]"
        dir="rtl"
        lang="ar"
      >
        {ayah.arabic}
      </p>

      <p className="mx-auto mt-5 max-w-xl font-serif text-lg font-light leading-relaxed text-muted-foreground">
        &ldquo;{ayah.translation}&rdquo;
      </p>

      <p className="mt-2.5 text-xs tracking-wide text-subtle">
        {ayah.surah} {ayah.verseKey} · Dr. Mustafa Khattab
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Link
          href={`/${ayah.surahId}/${ayah.ayahId}`}
          className={cn(
            ACTION_CLASS,
            "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <BookOpenText className="size-4" strokeWidth={1.8} aria-hidden />
          Read in context
        </Link>
        <Link
          href={`/media-maker?verse=${encodeURIComponent(ayah.verseKey)}`}
          className={cn(
            ACTION_CLASS,
            "border-gold bg-transparent text-gold hover:bg-gold-soft",
          )}
        >
          <ImagePlus className="size-4" strokeWidth={1.8} aria-hidden />
          Make a card
        </Link>
      </div>

      <div className="mt-8 flex justify-center border-t border-border pt-8">
        <HomeJumpField />
      </div>
    </section>
  )
}
