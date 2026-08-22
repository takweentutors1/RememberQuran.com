"use client"

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import type { Chapter, Verse } from "@/types/quran"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { useUI } from "@/context/UIContext"
import { usePlaybackVerseKey, useVerseScrollRequest } from "@/lib/playbackStore"
import { ARABIC_FONT_SIZES, TRANSLATION_FONT_SIZES, MAX_FONT_SCALE } from "@/lib/readerFonts"
import { cn } from "@/lib/utils"
import { BismillahHeader } from "./BismillahHeader"
import { AyahBlock } from "./AyahBlock"
import { ReadingModeView } from "./ReadingModeView"
import { ProgressTracker } from "./ProgressTracker"

/** Child layout reads best one step larger than whatever the user has picked. */
const CHILD_SCALE_BUMP = 1

function subscribeReduceMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getReduceMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReduceMotionServerSnapshot() {
  return false
}

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
    layoutMode,
    activeTranslations,
    showTranslation,
    arabicFontScale,
    translationFontScale,
    arabicFontSize,
    translationFontSize,
    arabicFontFamily,
  } = useReaderSettings()

  const isChild = layoutMode === "child"
  const effectiveArabicFontSize = isChild
    ? ARABIC_FONT_SIZES[Math.min(MAX_FONT_SCALE, arabicFontScale + CHILD_SCALE_BUMP) as typeof arabicFontScale]
    : arabicFontSize
  const effectiveTranslationFontSize = isChild
    ? TRANSLATION_FONT_SIZES[Math.min(MAX_FONT_SCALE, translationFontScale + CHILD_SCALE_BUMP) as typeof translationFontScale]
    : translationFontSize
  const shouldReduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot,
  )
  const [highlightActive, setHighlightActive] = useState(false)
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  const targetHandledRef = useRef<number | null>(null)
  const { setFocusMode } = useUI()

  // Focus mode: hide the navbar and bottom nav while the reader is
  // scrolling, so the page gets full-screen reading space with zero taps.
  // Scrolling back up (or near the top) brings the chrome back. Mirrors the
  // rAF-throttled pattern used by `BottomNav`'s own scroll listener,
  // including the settle window — this route auto-scrolls to the target
  // ayah / last position on mount, and without it that one big jump reads as
  // "the user flicked down" and hides the nav before the page has even
  // settled.
  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0
    const settleUntil = Date.now() + 600

    function measure() {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      lastY = y

      if (Date.now() < settleUntil) return

      if (y < 80) {
        setFocusMode(false)
      } else if (delta > 4) {
        setFocusMode(true)
      } else if (delta < -4) {
        setFocusMode(false)
      }
    }

    function onScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(measure)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      setFocusMode(false)
    }
  }, [setFocusMode])

  // Track the topmost visible ayah so a mode switch can re-anchor to it —
  // verse-by-verse blocks and continuous reading text have very different
  // per-ayah heights, so keeping the same scrollTop lands on the wrong verse.
  const visibleAyahRef = useRef<number | null>(null)
  useEffect(() => {
    const container = articleRef.current
    if (!container) return

    function updateVisibleAyah(node: HTMLElement) {
      const elements = node.querySelectorAll<HTMLElement>('[id^="ayah-"]')
      for (const candidate of elements) {
        if (candidate.getBoundingClientRect().bottom > 0) {
          visibleAyahRef.current = Number(candidate.id.replace(/^ayah-(trans-)?/, ""))
          return
        }
      }
    }

    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        updateVisibleAyah(container!)
        ticking = false
      })
    }

    updateVisibleAyah(container!)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const prevDisplayModeRef = useRef(displayMode)
  useLayoutEffect(() => {
    if (prevDisplayModeRef.current === displayMode) return
    prevDisplayModeRef.current = displayMode
    const anchor = visibleAyahRef.current
    if (anchor == null) return
    document.getElementById(`ayah-${anchor}`)?.scrollIntoView({ behavior: "auto", block: "start" })
  }, [displayMode])

  useEffect(() => {
    if (!targetAyahId) return
    // Already scrolled/flashed for this target — don't re-trigger just
    // because a later page of verses streamed in.
    if (targetHandledRef.current === targetAyahId) return

    const el = document.getElementById(`ayah-${targetAyahId}`)
    // Target ayah lives on a page that hasn't loaded yet (surahs stream in
    // 50-verse pages): bail without marking handled, so this effect retries
    // once `verses` grows and the element exists.
    if (!el) return

    targetHandledRef.current = targetAyahId
    el.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    })

    // Deferred a frame so the highlight flash starts after scrollIntoView's
    // layout work settles, rather than in the same synchronous effect pass.
    let rafId: number | undefined
    if (!shouldReduceMotion) {
      rafId = requestAnimationFrame(() => {
        setHighlightActive(true)
        clearRef.current = setTimeout(() => setHighlightActive(false), 1500)
      })
    }

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId)
      if (clearRef.current) clearTimeout(clearRef.current)
    }
  }, [targetAyahId, shouldReduceMotion, verses])

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
      ref={articleRef}
      aria-label={`Surah ${chapter.name_simple}`}
      aria-busy={false}
      className={cn(
        "mx-auto px-6 py-8 sm:px-10 sm:py-10",
        layoutMode === "single-page"
          ? "max-w-3xl my-6 rounded-2xl border border-border/60 bg-card shadow-sm sm:my-10"
          : layoutMode === "flow"
            ? "max-w-5xl"
            : "max-w-6xl",
      )}
      style={
        {
          "--arabic-font-size": effectiveArabicFontSize,
          "--translation-font-size": effectiveTranslationFontSize,
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
          targetAyahId={highlightActive ? targetAyahId : undefined}
        />
      ) : (
        <div role="list" aria-label="Ayahs" className="divide-y divide-border/40">
          {verses.map((verse) => (
            <div key={verse.id} role="listitem" className="ayah-cv">
              <AyahBlock
                verse={verse}
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
