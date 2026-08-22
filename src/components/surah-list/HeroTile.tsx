"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { ArrowRight, BookOpenText, Sparkles } from "lucide-react"
import { useChapterMeta } from "@/context/ChaptersContext"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"
import { getHistoryFactsFrom } from "@/lib/islamic-history"
import { cn } from "@/lib/utils"
import type { LastPositionDto } from "@/components/account/ContinuePrompt"

const TICKER_INTERVAL_MS = 6000
const FACTS = getHistoryFactsFrom()

/**
 * The homepage's large feature tile: a "resume reading" call to action, plus
 * an auto-sliding "on this day in Islamic history" ticker, over a faint
 * calligraphy watermark that drifts slightly with the pointer.
 *
 * Self-fetches the reader's last position (same endpoint as
 * `ContinuePrompt`) rather than taking it as a prop, so this stays a
 * self-contained island: the parent (`SurahListPage`, a server component)
 * doesn't need to know this tile exists to keep rendering the rest of the
 * page statically.
 */
export function HeroTile() {
  const { data: session, status } = useSession()
  const [position, setPosition] = useState<LastPositionDto | null>(null)
  const [loaded, setLoaded] = useState(false)
  const chapter = useChapterMeta(position?.surahId)
  const prefersReducedMotion = useSafeReducedMotion()

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
      <CalligraphyWatermark prefersReducedMotion={!!prefersReducedMotion} />

      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
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

        <div className="mt-8 border-t border-border pt-6">
          <HistoryTicker prefersReducedMotion={!!prefersReducedMotion} />
        </div>
      </div>
    </section>
  )
}

/**
 * Faint calligraphy-style watermark that leans a few pixels toward the
 * pointer. Purely decorative (`aria-hidden`), and inert under reduced
 * motion — it renders once, centred, with no transform applied.
 */
function CalligraphyWatermark({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 60, damping: 20 })
  const springY = useSpring(rawY, { stiffness: 60, damping: 20 })
  const x = useTransform(springX, (v) => `${v}px`)
  const y = useTransform(springY, (v) => `${v}px`)

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5
    rawX.set(relX * -14)
    rawY.set(relY * -10)
  }

  function onPointerLeave() {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="pointer-events-auto absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.span
        style={prefersReducedMotion ? undefined : { x, y }}
        className="absolute inset-0 flex items-center justify-center select-none font-uthmani text-[13rem] leading-none text-gold-leaf/[0.06] sm:text-[16rem]"
      >
        بِسْمِ ٱللَّٰهِ
      </motion.span>
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
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
        <Sparkles className="size-3" aria-hidden />
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
