"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, BookOpenText, ImagePlus } from "lucide-react"
import { useChapterMeta } from "@/context/ChaptersContext"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"
import { getAyahOfTheDay } from "@/lib/quran/ayah-of-the-day"
import { getHistoryFactsFrom } from "@/lib/islamic-history"
import { cn } from "@/lib/utils"
import type { LastPositionDto } from "@/components/account/ContinuePrompt"

const TICKER_INTERVAL_MS = 6000
const FACTS = getHistoryFactsFrom()

const AYAH_ACTION_CLASS = cn(
  "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium",
  "transition-[transform,background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-out)",
  "hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:scale-[.98]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)

/**
 * The homepage's large feature tile: a "resume reading" call to action, the
 * ayah of the day, and an auto-sliding "on this day in Islamic history"
 * ticker, over a faint calligraphy watermark that drifts slightly with the
 * pointer. Three content beats in one card — personal (resume reading),
 * daily (the ayah), historical (the ticker) — separated by dividers rather
 * than three separate sections competing for the fold.
 *
 * Self-fetches the reader's last position (same endpoint as
 * `ContinuePrompt`) rather than taking it as a prop, so this stays a
 * self-contained island: the parent (`SurahListPage`, a server component)
 * doesn't need to know this tile exists to keep rendering the rest of the
 * page statically. `getAyahOfTheDay` is a pure UTC-day function, so calling
 * it here doesn't risk a hydration mismatch the way a client-only value would.
 */
export function HeroTile() {
  const { data: session, status } = useSession()
  const [position, setPosition] = useState<LastPositionDto | null>(null)
  const [loaded, setLoaded] = useState(false)
  const chapter = useChapterMeta(position?.surahId)
  const prefersReducedMotion = useSafeReducedMotion()
  const ayah = getAyahOfTheDay()

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      queueMicrotask(() => {
        setPosition(null)
        setLoaded(true)
      })
      return
    }

    let cancelled = false
    fetch("/api/account/progress")
      .then(async (res) => {
        if (!res.ok) return null
        const data = (await res.json()) as {
          lastPosition?: LastPositionDto | null
        }
        return data.lastPosition ?? null
      })
      .then((pos) => {
        if (!cancelled) {
          setPosition(pos)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user, status])

  const resumeLabel =
    position?.surahName || chapter?.name_simple || "your last surah"

  return (
    <section
      aria-labelledby="resume-reading-heading"
      className="glass-panel mihrab-shadow relative isolate overflow-hidden rounded-2xl px-6 py-10 sm:py-12"
    >
      <CalligraphyWatermark />

      <div className="relative">
        <p className="eyebrow text-gold">
          {loaded && position ? "Resume reading" : "Start reading"}
        </p>

        <h1
          id="resume-reading-heading"
          className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl"
        >
          {loaded && position ? (
            <>
              Continue{" "}
              <span className="text-gold">
                {resumeLabel} · Ayah {position.ayahId}
              </span>
            </>
          ) : (
            "Begin your reading journey"
          )}
        </h1>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {loaded && position
            ? `Pick up right where you left off, ${position.verseKey}.`
            : "Start with Al-Fatihah, the opening surah of the Quran."}
        </p>

        <div className="mt-6">
          <Link
            href={
              loaded && position
                ? `/${position.surahId}/${position.ayahId}`
                : "/1/1"
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "transition-[transform,background-color,box-shadow] duration-(--dur-base) ease-(--ease-out)",
              "hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:scale-[.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <BookOpenText className="size-4" strokeWidth={1.8} aria-hidden />
            {loaded && position ? "Continue reading" : "Start reading"}
            <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
          </Link>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="eyebrow text-gold">
            Ayah of the day
          </p>

          <p
            className="mx-auto mt-4 max-w-2xl font-uthmani text-2xl leading-[1.9] text-reader-ink sm:text-[1.75rem]"
            dir="rtl"
            lang="ar"
          >
            {ayah.arabic}
          </p>

          <p className="mx-auto mt-4 max-w-lg font-serif text-base font-light leading-relaxed text-muted-foreground">
            &ldquo;{ayah.translation}&rdquo;
          </p>

          <p className="mt-2 text-xs tracking-wide text-subtle">
            {ayah.surah} {ayah.verseKey} · Dr. Mustafa Khattab
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={`/${ayah.surahId}/${ayah.ayahId}`}
              className={cn(
                AYAH_ACTION_CLASS,
                "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <BookOpenText className="size-3.5" strokeWidth={1.8} aria-hidden />
              Read in context
            </Link>
            <Link
              href={`/media-maker?verse=${encodeURIComponent(ayah.verseKey)}`}
              className={cn(
                AYAH_ACTION_CLASS,
                "border-gold bg-transparent text-gold hover:bg-gold-soft",
              )}
            >
              <ImagePlus className="size-3.5" strokeWidth={1.8} aria-hidden />
              Make a card
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <HistoryTicker prefersReducedMotion={!!prefersReducedMotion} />
        </div>
      </div>
    </section>
  )
}

/**
 * Faint calligraphy-style watermark. Purely decorative (`aria-hidden`).
 */
function CalligraphyWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <video
        src="/rememberquran_herosection_video.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
      <span
        className="absolute -bottom-8 -right-8 select-none font-uthmani text-[16rem] leading-none text-gold-leaf opacity-5"
        dir="rtl"
        lang="ar"
      >
        بِسْمِ ٱللَّٰهِ
      </span>
      <div
        className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(55%_100%_at_50%_0%,var(--brand-gold-soft)_0%,transparent_72%)]"
      />
    </div>
  )
}

function HistoryTicker({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const fact = useMemo(() => FACTS[index % FACTS.length], [index])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % FACTS.length)
    }, TICKER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
    >
      <p className="eyebrow text-gold">
        On this day in Islamic history
      </p>

      <div className="relative mt-2 min-h-[3.25rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={fact.title}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35 }}
          >
            <p className="text-sm font-medium text-foreground">{fact.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{fact.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
