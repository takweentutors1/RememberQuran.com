"use client"

import { useEffect, useRef, useState } from "react"
import type { Chapter, Verse } from "@/types/quran"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { usePlaybackVerseKey, useVerseScrollRequest } from "@/lib/playbackStore"
import { BismillahHeader } from "./BismillahHeader"
import { AyahBlock } from "./AyahBlock"
import { ReadingModeView } from "./ReadingModeView"
import { ProgressTracker } from "./ProgressTracker"

interface QuranReaderProps {
  chapter: Chapter
  verses: Verse[]
  targetAyahId?: number
}

/** Fixed mini player height — the strip an ayah must clear to count as visible */
const PLAYER_BAR_PX = 56

/**
 * Center the recited ayah in the viewport. Skipped when it's already fully
 * visible; with `onlyIfNear`, also skipped when it's more than a screen away
 * (the reader has deliberately scrolled elsewhere).
 */
function scrollToRecitedAyah(
  verseKey: string,
  chapterId: number,
  reduceMotion: boolean | null,
  { onlyIfNear }: { onlyIfNear: boolean },
) {
  const [surahId, ayahId] = verseKey.split(":")
  if (Number(surahId) !== chapterId) return
  const el = document.getElementById(`ayah-${ayahId}`)
  if (!el) return
  const rect = el.getBoundingClientRect()
  const viewBottom = window.innerHeight - PLAYER_BAR_PX
  if (rect.top >= 0 && rect.bottom <= viewBottom) return
  if (
    onlyIfNear &&
    (rect.bottom < -window.innerHeight || rect.top > viewBottom + window.innerHeight)
  ) {
    return
  }
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "center",
  })
}

export function QuranReader({ chapter, verses, targetAyahId }: QuranReaderProps) {
  const {
    displayMode,
    activeTranslations,
    showTranslation,
    arabicFontSize,
    translationFontSize,
    arabicFontFamily,
  } = useReaderSettings()
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
  const [highlightActive, setHighlightActive] = useState(false)
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setShouldReduceMotion(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!targetAyahId) return

    const el = document.getElementById(`ayah-${targetAyahId}`)
    if (!el) return

    el.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    })

    if (!shouldReduceMotion) {
      setHighlightActive(true)
      clearRef.current = setTimeout(() => setHighlightActive(false), 1500)
    }

    return () => {
      if (clearRef.current) clearTimeout(clearRef.current)
    }
  }, [targetAyahId, shouldReduceMotion])

  // Scrubber seeks bring the recited ayah into view even from far away
  const scrollRequest = useVerseScrollRequest()
  useEffect(() => {
    if (!scrollRequest) return
    scrollToRecitedAyah(scrollRequest.verseKey, chapter.id, shouldReduceMotion, {
      onlyIfNear: false,
    })
  }, [scrollRequest, chapter.id, shouldReduceMotion])

  // Follow the recitation: as the active ayah changes during playback, keep
  // it on screen — but never yank the reader back if they've scrolled far
  // away to study another passage
  const activePlaybackKey = usePlaybackVerseKey()
  useEffect(() => {
    if (!activePlaybackKey) return
    scrollToRecitedAyah(activePlaybackKey, chapter.id, shouldReduceMotion, {
      onlyIfNear: true,
    })
  }, [activePlaybackKey, chapter.id, shouldReduceMotion])

  return (
    <>
      <ProgressTracker surahId={chapter.id} />
      <article
      aria-label={`Surah ${chapter.name_simple}`}
      aria-busy={false}
      className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-10"
      style={
        {
          "--arabic-font-size": arabicFontSize,
          "--translation-font-size": translationFontSize,
          "--reader-arabic-font": arabicFontFamily,
        } as React.CSSProperties
      }
    >
      <header className="mb-8 border-b border-border/40 pb-8 text-center">
        <p
          className="font-uthmani text-[2.75rem] leading-[1.7] text-foreground sm:text-[3.25rem]"
          dir="rtl"
          lang="ar"
        >
          {chapter.name_arabic}
        </p>
        <h1 className="mt-3 text-xl font-medium tracking-tight text-foreground">
          {chapter.name_simple}
        </h1>
        <p className="mt-1 font-serif text-sm text-muted-foreground">
          {chapter.translated_name.name}
        </p>
        <p className="mt-2 text-xs tabular-nums text-muted-foreground/70">
          {chapter.verses_count} ayahs ·{" "}
          {chapter.revelation_place === "makkah" ? "Makki" : "Madani"}
        </p>
      </header>

      {chapter.bismillah_pre && <BismillahHeader />}

      {displayMode === "reading" ? (
        <ReadingModeView
          verses={verses}
          showTranslation={showTranslation}
          activeTranslationIds={activeTranslations}
          targetAyahId={highlightActive ? targetAyahId : undefined}
        />
      ) : (
        <div role="list" aria-label="Ayahs" className="divide-y divide-border/40">
          {verses.map((verse) => (
            <div key={verse.id} role="listitem" className="ayah-cv">
              <AyahBlock
                verse={verse}
                displayMode="verse"
                activeTranslationIds={activeTranslations}
                showTranslation={showTranslation}
                isTarget={highlightActive && targetAyahId === verse.verse_number}
              />
            </div>
          ))}
        </div>
      )}
    </article>
    </>
  )
}
