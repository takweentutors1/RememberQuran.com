"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowRight, BookOpenText, Radio, Search } from "lucide-react"
import { useChapterMeta } from "@/context/ChaptersContext"
import { useUI } from "@/context/UIContext"
import { cn } from "@/lib/utils"
import type { LastPositionDto } from "@/components/account/ContinuePrompt"

export function HeroSection() {
  const { data: session, status } = useSession()
  const [position, setPosition] = useState<LastPositionDto | null>(null)
  const [loaded, setLoaded] = useState(false)
  const chapter = useChapterMeta(position?.surahId)
  const { setCommandOpen } = useUI()

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
    <section className="relative isolate flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden border-b border-border bg-cream px-6 py-20 text-center sm:px-12 sm:py-24">
      {/* Background Video */}
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
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
        />
        {/* Subtle gradient overlay to ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/50 to-cream/90" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <p className="eyebrow text-gold tracking-widest uppercase">
          {loaded && position ? "Resume reading" : "Start reading"}
        </p>

        <h1 className="mt-4 font-serif text-4xl font-normal tracking-tight text-reader-ink sm:text-5xl lg:text-6xl">
          {loaded && position ? (
            <>
              Continue <span className="text-gold">{resumeLabel}</span>
              <br />
              Ayah {position.ayahId}
            </>
          ) : (
            "Begin your reading journey"
          )}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-lg font-light text-muted-foreground sm:mt-6">
          {loaded && position
            ? `Pick up right where you left off, ${position.verseKey}.`
            : "Start with Al-Fatihah, the opening surah of the Quran."}
        </p>

        {/* Dummy Search Bar */}
        <div className="mx-auto mt-8 max-w-md sm:mt-10">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex w-full items-center gap-3 rounded-full border border-border bg-background/80 px-6 py-4 text-left shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:bg-background hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Search the Quran"
          >
            <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <span className="flex-1 text-base text-muted-foreground">Search the Quran...</span>
            <kbd className="hidden rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={
              loaded && position
                ? `/${position.surahId}/${position.ayahId}`
                : "/1/1"
            }
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary bg-primary px-8 text-base font-medium text-primary-foreground shadow-sm sm:w-auto",
              "transition-all duration-300 ease-out hover:-translate-y-px hover:shadow-md hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <BookOpenText className="size-4" strokeWidth={2} aria-hidden />
            {loaded && position ? "Continue reading" : "Start reading"}
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </Link>

          <Link
            href="/radio"
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-8 text-base font-medium text-foreground shadow-sm sm:w-auto",
              "transition-all duration-300 ease-out hover:-translate-y-px hover:border-primary/30 hover:bg-muted/50 hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Radio className="size-4 text-primary" strokeWidth={2} aria-hidden />
            Quran radio
          </Link>
        </div>
        
        <p className="mt-8 text-xs font-medium tracking-wide text-muted-foreground/60 uppercase">
          Free forever &middot; no ads &middot; no tracking
        </p>
      </div>
    </section>
  )
}
