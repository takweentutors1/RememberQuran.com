"use client"

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import type { Chapter, Verse } from "@/types/quran"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { useSurahContent } from "@/context/SurahContentContext"
import { useChapterMeta } from "@/context/ChaptersContext"
import { useUI } from "@/context/UIContext"
import { usePlaybackVerseKey, useVerseScrollRequest } from "@/lib/playbackStore"
import {
  DEFAULT_ARABIC_SCALE,
  DEFAULT_TRANSLATION_SCALE,
  QURAN_FONT_FAMILY,
} from "@/lib/readerFonts"
import { cn } from "@/lib/utils"
import { Play, Pause, Loader2 } from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { BismillahHeader } from "./BismillahHeader"
import { AyahBlock } from "./AyahBlock"
import { ReadingModeView } from "./ReadingModeView"
import { ProgressTracker } from "./ProgressTracker"
import { SurahMetaHeader } from "./SurahMetaHeader"



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
  /** Bumped on every jump request, including a repeat of the same ayah — see SurahContentContext. */
  targetAyahNonce?: number
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
  reduceMotion: boolean | null,
  { onlyIfNear }: { onlyIfNear: boolean },
) {
  const el = document.getElementById(`ayah-${verseKey.replace(":", "-")}`)
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

/** Surah divider shown between groups in "verse" mode once infinite scroll appends a new surah. */
function SurahDivider({ surahId }: { surahId: number }) {
  const chapter = useChapterMeta(surahId)
  if (!chapter) return null
  return (
    <div className="ayah-cv">
      <SurahMetaHeader chapter={chapter} />
      {chapter.bismillah_pre && <BismillahHeader />}
    </div>
  )
}

export function QuranReader({ chapter, verses, targetAyahId, targetAyahNonce }: QuranReaderProps) {
  const {
    displayMode,
    activeTranslations,
    showTranslation,
    arabicFontSize,
    translationFontSize,
    arabicFontFamily,
    infiniteScroll,
  } = useReaderSettings()
  const {
    activeSurahId,
    setActiveSurah,
    latestSurahId,
    appendNextSurah,
    isAppending,
    earliestSurahId,
    prependPreviousSurah,
    isPrepending,
  } = useSurahContent()

  const shouldReduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot,
  )
  const [highlightActive, setHighlightActive] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  // Tracks the last-handled *nonce*, not ayah id — re-selecting the same
  // ayah bumps the nonce (see SurahContentContext), so it re-triggers the
  // scroll+flash instead of being silently swallowed by this guard.
  const targetHandledRef = useRef<number | null>(null)
  // True while a programmatic jump-to-ayah scrollIntoView is still animating
  // — shared with the focus-mode scroll listener below so that motion is
  // never misread as the user scrolling (see its own comment: a fixed
  // settle window alone isn't enough once the target ayah is far enough
  // down that the smooth-scroll animation outlasts it).
  const autoScrollingRef = useRef(false)
  const { setFocusMode } = useUI()
  const player = useAudioPlayer()

  const isThisChapter = player.chapterId === chapter.id
  const isPlayingThis = isThisChapter && player.status === "playing"
  const isLoadingThis = isThisChapter && player.status === "loading"

  function handlePlayFullSurah() {
    if (isThisChapter && (player.status === "playing" || player.status === "paused")) {
      player.togglePlayPause()
    } else {
      player.playChapter(chapter.id)
    }
  }

  // Focus mode: hide the navbar and bottom nav while the reader is
  // scrolling, so the page gets full-screen reading space with zero taps.
  // Scrolling back up (or near the top) brings the chrome back. Mirrors the
  // rAF-throttled pattern used by `BottomNav`'s own scroll listener,
  // including the settle window — this route auto-scrolls to the target
  // ayah / last position on mount, and without it that one big jump reads as
  // "the user flicked down" and hides the nav before the page has even
  // settled. The settle window alone only covers the first 600ms though —
  // `autoScrollingRef` (set by the jump-to-ayah effect below) covers the
  // rest of that scroll's actual duration, which for a distant ayah can run
  // well past 600ms.
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
      if (autoScrollingRef.current) return

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

  // Infinite scroll: keep a live-readable snapshot of the setting and the
  // active surah so the scroll listener below (registered once) doesn't
  // need to re-attach every time either changes.
  const infiniteScrollRef = useRef(infiniteScroll)
  useEffect(() => {
    infiniteScrollRef.current = infiniteScroll
  }, [infiniteScroll])

  const activeSurahIdRef = useRef<number>(activeSurahId ?? chapter.id)
  useEffect(() => {
    activeSurahIdRef.current = activeSurahId ?? chapter.id
  }, [activeSurahId, chapter.id])

  // The base/route surah's own fetch can carry a few boundary verses from
  // the *preceding* surah too (short surahs near the end of the mushaf
  // share a printed page with their neighbor on both sides — see
  // withPageBoundaries in the API route). Active-surah tracking must never
  // regress below this anchor, or a stray leading verse from an earlier
  // surah flips the URL backwards the instant the page loads.
  const baseSurahIdRef = useRef(chapter.id)
  useEffect(() => {
    baseSurahIdRef.current = chapter.id
  }, [chapter.id])

  // Track the topmost visible ayah so a mode switch can re-anchor to it —
  // verse-by-verse blocks and continuous reading text have very different
  // per-ayah heights, so keeping the same scrollTop lands on the wrong verse.
  // When infinite scroll is on, also detect when the topmost ayah belongs to
  // a different surah than the one currently tracked as "active", and softly
  // update the URL to follow — this is what makes a refresh mid-scroll land
  // on wherever the reader actually is.
  const visibleAyahRef = useRef<string | null>(null)
  useEffect(() => {
    const container = articleRef.current
    if (!container) return

    function updateVisibleAyah(node: HTMLElement) {
      const elements = node.querySelectorAll<HTMLElement>('[data-verse-key]')
      for (const candidate of elements) {
        if (candidate.getBoundingClientRect().bottom > 0) {
          const verseKey = candidate.dataset.verseKey ?? null
          visibleAyahRef.current = verseKey

          if (infiniteScrollRef.current && verseKey) {
            const visibleSurahId = Number(verseKey.split(":")[0])
            // Strictly forward-only: appends can stream in out of order for
            // a moment (several short surahs' fetches racing to resolve),
            // which can make the topmost-visible surah transiently jump
            // ahead and back. Track furthest-forward progress rather than
            // the exact instantaneous surah, so the URL never flickers
            // backwards mid-scroll.
            const floor = activeSurahIdRef.current ?? baseSurahIdRef.current
            if (Number.isInteger(visibleSurahId) && visibleSurahId > floor) {
              activeSurahIdRef.current = visibleSurahId
              setActiveSurah(visibleSurahId)
              window.history.replaceState(null, "", `/${visibleSurahId}`)
            }
          }
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
  }, [setActiveSurah])

  // Infinite scroll sentinel — pre-fetches the next surah well before the
  // reader actually hits the bottom. Re-bound whenever the fetch cursor
  // advances so it always tracks the live sentinel element (there is none
  // once the Quran is fully appended).
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!infiniteScroll) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          appendNextSurah()
        }
      },
      { rootMargin: "0px 0px 1200px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [infiniteScroll, appendNextSurah, latestSurahId])

  // Backward infinite scroll (Reading mode only — see topSentinel's comment
  // at its render site for why). Prepending grows the page *above* the
  // current scroll position, so without compensation the viewport would
  // visually jump down by the height of whatever just got inserted. Capture
  // the scroll height right before triggering the fetch, then once the new
  // content has actually painted, add the delta back to scrollTop so the
  // ayah the user was reading stays exactly where it was on screen.
  const pendingPrependRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!infiniteScroll) return
    const el = topSentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some((entry) => entry.isIntersecting) &&
          !pendingPrependRef.current &&
          !autoScrollingRef.current
        ) {
          pendingPrependRef.current = {
            scrollHeight: document.documentElement.scrollHeight,
            scrollTop: window.scrollY,
          }
          prependPreviousSurah()
        }
      },
      { rootMargin: "1200px 0px 0px 0px" },
    )

    if (earliestSurahId !== chapter.id) {
      // Already prepended at least once — the user is clearly mid-scroll,
      // not on a fresh load, so there's no initial-jump race to guard
      // against here. Observe right away for a responsive continuous scroll.
      observer.observe(el)
      return () => observer.disconnect()
    }

    // Nothing prepended yet: this is a fresh load, where the page starts at
    // scrollY 0 — trivially "near the top" — until the jump-to-target-ayah
    // effect above scrolls it to wherever the route actually points.
    // `autoScrollingRef` covers that for a *distant* target ayah, but
    // landing on ayah 1 barely moves the page at all, so its whole scroll
    // (and `scrollend`) can complete inside the brief window before this
    // observer even attaches. Deferring the `observe()` call itself past
    // that window closes the gap outright, rather than trying to out-race it.
    const armTimer = window.setTimeout(() => observer.observe(el), 800)
    return () => {
      window.clearTimeout(armTimer)
      observer.disconnect()
    }
  }, [infiniteScroll, prependPreviousSurah, earliestSurahId, chapter.id])

  useLayoutEffect(() => {
    const pending = pendingPrependRef.current
    if (!pending) return
    pendingPrependRef.current = null
    const delta = document.documentElement.scrollHeight - pending.scrollHeight
    if (delta > 0) {
      // `behavior: "auto"` means "instant, unless CSS scroll-behavior says
      // smooth" — and the site sets exactly that globally, which would turn
      // this compensation into a visible multi-second glide (the opposite
      // of invisible) and race with the very scroll position it's trying to
      // correct. "instant" bypasses CSS entirely, which is what a same-frame
      // correction actually needs.
      window.scrollTo({ top: pending.scrollTop + delta, behavior: "instant" })
    }
  }, [verses])

  // A failed prepend never touches `verses`, so the effect above never runs
  // to clear the pending marker — without this, one failed fetch would wedge
  // the sentinel shut forever. Runs after the effect above in the same
  // commit, so on success this is already a no-op (ref cleared there first).
  useLayoutEffect(() => {
    if (!isPrepending) pendingPrependRef.current = null
  }, [isPrepending])

  const prevDisplayModeRef = useRef(displayMode)
  useLayoutEffect(() => {
    if (prevDisplayModeRef.current === displayMode) return
    prevDisplayModeRef.current = displayMode
    const anchor = visibleAyahRef.current
    if (anchor == null) return
    document
      .querySelector(`[data-verse-key="${CSS.escape(anchor)}"]`)
      ?.scrollIntoView({ behavior: "auto", block: "start" })
  }, [displayMode])

  useEffect(() => {
    if (!targetAyahId) return
    const nonce = targetAyahNonce ?? 0
    // Already scrolled/flashed for this specific jump request — don't
    // re-trigger just because a later page of verses streamed in. A repeat
    // click on the same ayah bumps the nonce, so that's treated as a new
    // request instead of being swallowed here.
    if (targetHandledRef.current === nonce) return

    const el = document.getElementById(`ayah-${chapter.id}-${targetAyahId}`)
    // Target ayah lives on a page that hasn't loaded yet (surahs stream in
    // 50-verse pages): bail without marking handled, so this effect retries
    // once `verses` grows and the element exists.
    if (!el) return

    targetHandledRef.current = nonce
    el.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    })

    // Block the focus-mode scroll listener above for as long as this jump
    // actually takes — a fixed timer can't know that in advance since it
    // depends on how far away the target ayah is. `scrollend` fires once the
    // browser considers scrolling settled; the timeout is only a fallback
    // for browsers that don't support it.
    autoScrollingRef.current = true
    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined
    function clearAutoScrolling() {
      autoScrollingRef.current = false
      window.removeEventListener("scrollend", clearAutoScrolling)
      if (scrollEndTimer !== undefined) clearTimeout(scrollEndTimer)
    }
    if (shouldReduceMotion) {
      clearAutoScrolling()
    } else if ("onscrollend" in window) {
      window.addEventListener("scrollend", clearAutoScrolling, { once: true })
    } else {
      scrollEndTimer = setTimeout(clearAutoScrolling, 2500)
    }

    // Deferred a frame so the highlight flash starts after scrollIntoView's
    // layout work settles, rather than in the same synchronous effect pass.
    // The auto-clear timeout lives in its own effect below, keyed off
    // `highlightActive` alone — not here — because `verses` can get a new
    // (content-equal) array reference shortly after navigating to the same
    // surah's ayah (the "already loaded" path in loadSurah still does a
    // real router.push, which re-runs SurahBootstrap's cache-hit branch).
    // That was re-running this effect while the flash was mid-flight, whose
    // cleanup cancelled the pending clear — since the target was already
    // marked handled, nothing rescheduled it, leaving the highlight stuck
    // on permanently instead of fading after 1.5s.
    let rafId: number | undefined
    if (!shouldReduceMotion) {
      rafId = requestAnimationFrame(() => {
        setHighlightActive(true)
      })
    }

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId)
      // Always clear the ref itself here, not just the listener/timer that
      // would have cleared it — this effect can re-run mid-scroll (a later
      // page of verses streaming in changes `verses`) while the same nonce
      // is still marked handled, so nothing else would ever flip it back to
      // false and it would stay stuck blocking focus mode for the rest of
      // the session.
      clearAutoScrolling()
    }
  }, [targetAyahId, targetAyahNonce, shouldReduceMotion, verses, chapter.id])

  // Isolated from the effect above so it only reacts to highlightActive's
  // own transitions, never to an incidental re-run of the scroll effect.
  useEffect(() => {
    if (!highlightActive) return
    const t = setTimeout(() => setHighlightActive(false), 30_000)
    return () => clearTimeout(t)
  }, [highlightActive])

  // Scrubber seeks bring the recited ayah into view even from far away
  const scrollRequest = useVerseScrollRequest()
  useEffect(() => {
    if (!scrollRequest) return
    scrollToRecitedAyah(scrollRequest.verseKey, shouldReduceMotion, {
      onlyIfNear: false,
    })
  }, [scrollRequest, shouldReduceMotion])

  // Follow the recitation: as the active ayah changes during playback, keep
  // it on screen — but never yank the reader back if they've scrolled far
  // away to study another passage
  const activePlaybackKey = usePlaybackVerseKey()
  useEffect(() => {
    if (!activePlaybackKey) return
    scrollToRecitedAyah(activePlaybackKey, shouldReduceMotion, {
      onlyIfNear: true,
    })
  }, [activePlaybackKey, shouldReduceMotion])

  const isReading = displayMode === "reading"

  // Group verses by surah so "verse" mode can render a divider wherever
  // infinite scroll has appended a new surah below the base one. Reading
  // mode needs no equivalent — ReadingModeView already groups by mushaf
  // page and resolves each page's own chapter.
  const surahGroups = useMemo(() => {
    const groups: { surahId: number; verses: Verse[] }[] = []
    for (const verse of verses) {
      const verseSurahId = Number(verse.verse_key.split(":")[0])
      const last = groups[groups.length - 1]
      if (last && last.surahId === verseSurahId) {
        last.verses.push(verse)
      } else {
        groups.push({ surahId: verseSurahId, verses: [verse] })
      }
    }
    return groups
  }, [verses])

  // A leading boundary-bleed group (see baseSurahIdRef above) belongs to a
  // surah *before* the base one — it should never get its own divider, nor
  // should the base surah's own group right after it. Dividers only make
  // sense for groups genuinely appended forward, past the base surah.
  const baseGroupIndex = useMemo(() => {
    const index = surahGroups.findIndex((g) => g.surahId === chapter.id)
    return index === -1 ? 0 : index
  }, [surahGroups, chapter.id])

  const playButton = (
    <button
      type="button"
      onClick={handlePlayFullSurah}
      className={cn(
        "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
        isPlayingThis
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      {isLoadingThis ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isPlayingThis ? (
        <Pause className="size-4" fill="currentColor" />
      ) : (
        <Play className="size-4" fill="currentColor" />
      )}
      <span>
        {isLoadingThis ? "Loading..." : isPlayingThis ? "Pause Surah" : "Play Surah"}
      </span>
    </button>
  )

  return (
    <>
      <ProgressTracker surahId={activeSurahId ?? chapter.id} />
      <article
        ref={articleRef}
        aria-label={`Surah ${chapter.name_simple}`}
        aria-busy={false}
        className={cn(
          "mx-auto",
          isReading
            ? "max-w-5xl px-3 py-6 sm:px-8 sm:py-8"
            : "max-w-[820px] px-6 py-8 sm:px-10 sm:py-10",
        )}
        style={
          {
            "--arabic-font-size": arabicFontSize,
            "--translation-font-size": translationFontSize,
            "--reader-arabic-font": arabicFontFamily,
          } as React.CSSProperties
        }
      >
        {/* Backward infinite scroll — Reading mode only. Verse-by-verse mode's
            surah dividers assume any leading group is just page-boundary
            bleed from the adjacent surah (a couple of stray verses), not a
            genuinely prepended surah, so wiring this in there would render
            prepended content with no divider in front of it. Reading mode's
            mushaf-page grouping has no such assumption and Just Works. */}
        {isReading && infiniteScroll && earliestSurahId != null && (
          <div className="mb-8 flex flex-col items-center gap-2 py-4">
            {earliestSurahId > 1 ? (
              <>
                {isPrepending && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Loading previous surah…
                  </div>
                )}
                <div ref={topSentinelRef} aria-hidden className="h-px w-full" />
              </>
            ) : (
              <p className="text-xs text-muted-foreground/70">
                You&apos;ve reached the beginning of the Qur&apos;an — Surah Al-Fatihah.
              </p>
            )}
          </div>
        )}

        {!isReading && <SurahMetaHeader chapter={chapter}>{playButton}</SurahMetaHeader>}

        {!isReading && chapter.bismillah_pre && <BismillahHeader />}

        {isReading ? (
          <ReadingModeView
            verses={verses}
            targetAyahId={highlightActive ? targetAyahId : undefined}
            chapter={chapter}
          />
        ) : (
          <div role="list" aria-label="Ayahs" className="divide-y divide-border/40">
            {surahGroups.map((group, groupIndex) => (
              <Fragment key={group.surahId}>
                {groupIndex > baseGroupIndex && <SurahDivider surahId={group.surahId} />}
                {group.verses.map((verse) => (
                  <div key={verse.id} role="listitem" className="ayah-cv">
                    <AyahBlock
                      verse={verse}
                      activeTranslationIds={activeTranslations}
                      showTranslation={showTranslation}
                      isTarget={highlightActive && targetAyahId === verse.verse_number}
                    />
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        )}

        {infiniteScroll && latestSurahId != null && (
          <div className="mt-8 flex flex-col items-center gap-2 py-4">
            {latestSurahId < 114 ? (
              <>
                <div ref={sentinelRef} aria-hidden className="h-px w-full" />
                {isAppending && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Loading next surah…
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground/70">
                You&apos;ve reached the end of the Qur&apos;an — Surah An-Nas.
              </p>
            )}
          </div>
        )}
      </article>
    </>
  )
}
