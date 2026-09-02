"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  Brain,
  Volume2,
  Sparkles,
} from "lucide-react"
import type { Verse } from "@/types/quran"
import type { HifzAyahDto } from "@/components/account/HifzView"
import type { SRSGrade } from "@/lib/hifz/srs"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { ArabicLine } from "@/components/reader/ArabicLine"
import { TranslationBlock } from "@/components/reader/TranslationBlock"
import { cn } from "@/lib/utils"

interface HifzReviewSessionProps {
  initialDueAyahs: HifzAyahDto[]
}

export function HifzReviewSession({ initialDueAyahs }: HifzReviewSessionProps) {
  const [queue, setQueue] = useState<HifzAyahDto[]>(initialDueAyahs)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [loadingVerse, setLoadingVerse] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)

  const player = useAudioPlayer()

  const currentItem = queue[currentIndex] ?? null

  const fetchVerseData = useCallback(async (verseKey: string) => {
    setLoadingVerse(true)
    try {
      const [surahId, ayahId] = verseKey.split(":")
      const res = await fetch(`/api/surah/${surahId}`)
      if (!res.ok) throw new Error("Failed to load surah")
      const data = await res.json()
      const found = (data.verses as Verse[]).find((v) => v.verse_key === verseKey)
      if (found) {
        setCurrentVerse(found)
      }
    } catch {
      // Fallback
    } finally {
      setLoadingVerse(false)
    }
  }, [])

  useEffect(() => {
    if (currentItem) {
      setRevealed(false)
      fetchVerseData(currentItem.verseKey)
    } else {
      setSessionCompleted(true)
    }
  }, [currentItem, fetchVerseData])

  async function handleGrade(grade: SRSGrade) {
    if (!currentItem || submitting) return
    setSubmitting(true)

    try {
      await fetch("/api/account/hifz", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseKey: currentItem.verseKey,
          grade,
          repetitions: currentItem.repetitions,
          intervalDays: currentItem.intervalDays,
          easeFactor: currentItem.easeFactor,
        }),
      })

      setReviewedCount((prev) => prev + 1)

      // If graded "again", requeue at the end of the current session
      if (grade === "again") {
        setQueue((prev) => [...prev, currentItem])
      }

      if (currentIndex + 1 < queue.length || grade === "again") {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setSessionCompleted(true)
      }
    } catch {
      // Allow progression anyway for UX continuity
      setCurrentIndex((prev) => prev + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionCompleted || !currentItem) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center max-w-lg mx-auto">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="font-serif text-2xl font-semibold">Review Complete!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {reviewedCount > 0
            ? `You practiced ${reviewedCount} ${reviewedCount === 1 ? "verse" : "verses"} today. Spaced intervals have been updated.`
            : "No reviews were due at this time."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href="/account/hifz"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="size-4" />
            Back to Hifz Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
        <Link
          href="/account/hifz"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Exit Review
        </Link>
        <span className="font-medium tabular-nums">
          Card {currentIndex + 1} of {queue.length}
        </span>
      </div>

      {/* Main Flashcard */}
      <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        {/* Card Header: Surah & Ayah badge */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              {currentItem.surahName}
            </span>
            <h2 className="text-lg font-medium text-foreground">
              Ayah {currentItem.verseKey}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const [s, a] = currentItem.verseKey.split(":")
                player.playVerse(Number(s), Number(a))
              }}
              title="Listen to ayah"
              aria-label="Listen to ayah"
              className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Volume2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setRevealed((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                revealed
                  ? "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary/20",
              )}
            >
              {revealed ? (
                <>
                  <EyeOff className="size-3.5" /> Hide Arabic
                </>
              ) : (
                <>
                  <Eye className="size-3.5" /> Reveal Arabic
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Body: Arabic text */}
        <div
          dir="rtl"
          lang="ar"
          onClick={() => !revealed && setRevealed(true)}
          className={cn(
            "min-h-[140px] flex items-center justify-center py-6 px-4 rounded-xl border transition-all text-center",
            revealed
              ? "border-border/60 bg-background/50"
              : "border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10",
          )}
        >
          {loadingVerse ? (
            <p className="font-sans text-xs text-muted-foreground animate-pulse">
              Loading ayah...
            </p>
          ) : currentVerse ? (
            <div className={cn("transition-all duration-300", !revealed && "blur-md select-none opacity-40")}>
              <ArabicLine
                words={currentVerse.words}
                verseKey={currentVerse.verse_key}
              />
            </div>
          ) : (
            <div className={cn("font-uthmani text-2xl leading-loose", !revealed && "blur-md select-none opacity-40")}>
              سُورَةُ {currentItem.surahArabic} — الآية {currentItem.ayahId}
            </div>
          )}
        </div>

        {!revealed && (
          <p className="text-center text-xs text-muted-foreground -mt-2">
            Recite from memory, then click anywhere on the box or tap <strong>Reveal Arabic</strong> to check yourself.
          </p>
        )}

        {/* Translation reveal */}
        {revealed && currentVerse?.translations && currentVerse.translations.length > 0 && (
          <div className="border-t border-border/40 pt-4">
            <TranslationBlock translation={currentVerse.translations[0]!} />
          </div>
        )}
      </div>

      {/* Self Evaluation Buttons (SM-2 / Leitner) */}
      <div className="flex flex-col gap-2">
        <p className="text-center text-xs font-medium text-muted-foreground">
          How well did you remember this verse?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Again */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleGrade("again")}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all font-medium text-xs disabled:opacity-50"
          >
            <RotateCcw className="size-4 mb-1" />
            <span>Again</span>
            <span className="text-[10px] opacity-75 font-normal">&lt; 1 day</span>
          </button>

          {/* Hard */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleGrade("hard")}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all font-medium text-xs disabled:opacity-50"
          >
            <Brain className="size-4 mb-1" />
            <span>Hard</span>
            <span className="text-[10px] opacity-75 font-normal">~2-3 days</span>
          </button>

          {/* Good */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleGrade("good")}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all font-medium text-xs disabled:opacity-50"
          >
            <CheckCircle2 className="size-4 mb-1" />
            <span>Good</span>
            <span className="text-[10px] opacity-75 font-normal">~4-7 days</span>
          </button>

          {/* Easy */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleGrade("easy")}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all font-medium text-xs disabled:opacity-50"
          >
            <Sparkles className="size-4 mb-1" />
            <span>Easy</span>
            <span className="text-[10px] opacity-75 font-normal">2+ weeks</span>
          </button>
        </div>
      </div>
    </div>
  )
}
