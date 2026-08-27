"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronDown,
  Loader2,
  Pause,
  Play,
  RadioTower,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"
import { useHighlightedWord, usePlaybackVerseKey } from "@/lib/playbackStore"
import type { Verse } from "@/types/quran"
import { cn } from "@/lib/utils"
import { AyahEndMarker } from "@/components/reader/AyahEndMarker"
import { ElapsedTime, PLAYER_SURFACE_LAYOUT_ID, SeekBar } from "./PlayerPrimitives"
import { ReciterSelector } from "./ReciterSelector"
import { RepeatControls } from "./RepeatControls"
import { SpeedControl } from "./SpeedControl"

/** Drag the sheet down by more than this to dismiss, Apple-Music-style. */
const DISMISS_THRESHOLD_PX = 120

/**
 * Loads the surah currently playing and hands back just the one ayah in
 * view. Reuses `/api/surah/[id]` (already CDN- and browser-cached with a
 * 1-day s-maxage) rather than a bespoke single-ayah endpoint, so paging
 * through ayahs of the same surah — the common case — re-triggers the
 * effect but not an actual network round-trip.
 */
function useLiveAyah(
  chapterId: number | null,
  ayahId: number | null,
): Verse | null {
  const [versesByChapter, setVersesByChapter] = useState<Record<number, Verse[]>>({})

  useEffect(() => {
    if (chapterId === null) return

    let cancelled = false
    fetch(`/api/surah/${chapterId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { verses?: Verse[] } | null) => {
        if (cancelled || !data?.verses) return
        setVersesByChapter((prev) => ({ ...prev, [chapterId]: data.verses! }))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [chapterId])

  if (chapterId === null || ayahId === null) return null
  const verses = versesByChapter[chapterId]
  return verses?.find((v) => v.verse_number === ayahId) ?? null
}

/**
 * Apple Music-style immersive now-playing view. Shares `layoutId` with
 * `MiniPlayer`'s surface, so Framer Motion morphs the mini bar's box into
 * this one instead of cross-fading two unrelated elements — the transition
 * *is* the mini player becoming the full screen.
 */
export function FullScreenPlayer({ onClose }: { onClose: () => void }) {
  const player = useAudioPlayer()
  const verseKey = usePlaybackVerseKey()
  const prefersReducedMotion = useSafeReducedMotion()

  const isPlaying = player.status === "playing"
  const isBusy = player.status === "loading" || player.isBuffering
  const [surahId, ayahId] = (verseKey ?? "").split(":")
  const ayahIdNum = ayahId ? Number(ayahId) : null
  const verse = useLiveAyah(player.chapterId, ayahIdNum)

  return (
    <motion.div
      layoutId={PLAYER_SURFACE_LAYOUT_ID}
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.4 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > DISMISS_THRESHOLD_PX) onClose()
      }}
      className="fixed inset-0 z-[45] flex flex-col overflow-hidden bg-background text-foreground"
    >
      <MeshGradientBackdrop prefersReducedMotion={!!prefersReducedMotion} />

      <div className="relative flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Minimize"
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown className="size-5" strokeWidth={2} />
        </button>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {player.mode === "radio" ? "Radio" : "Now Playing"}
        </p>
        <div className="size-10" aria-hidden />
      </div>

      <div className="relative flex flex-1 flex-col items-center gap-7 overflow-y-auto px-6 py-8 text-center">
        {player.mode === "radio" && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            <RadioTower className="size-3" strokeWidth={2} />
            Live recitation
          </span>
        )}

        <NowPlayingOrb
          isPlaying={isPlaying}
          isBusy={isBusy}
          prefersReducedMotion={!!prefersReducedMotion}
        />

        <div className="max-w-lg">
          <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
            {player.chapterName ??
              (player.chapterId !== null ? `Surah ${player.chapterId}` : "")}
          </h1>
          {verseKey && (
            <Link
              href={`/${surahId}/${ayahId}`}
              onClick={onClose}
              className="mt-1 inline-block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Ayah {verseKey} · Read in context
            </Link>
          )}
        </div>

        {verse ? (
          <LiveAyahText verse={verse} verseKey={verseKey!} />
        ) : (
          verseKey && (
            <div
              aria-hidden
              className="h-24 w-full max-w-lg animate-pulse rounded-lg bg-muted/40"
            />
          )
        )}

        <div className="mt-auto w-full max-w-sm pt-2">
          <div className="relative">
            {player.durationMs !== null &&
              player.status !== "error" &&
              player.status !== "loading" && (
                <SeekBar
                  durationMs={player.durationMs}
                  onSeek={player.seekToTime}
                />
              )}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <ElapsedTime durationMs={player.durationMs} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            title="Previous ayah"
            aria-label="Previous ayah"
            onClick={player.prevAyah}
            className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SkipBack className="size-6" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={player.togglePlayPause}
            className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-(--dur-base) ease-(--ease-out) hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isBusy ? (
              <Loader2 className="size-7 animate-spin" strokeWidth={1.75} />
            ) : isPlaying ? (
              <Pause className="size-7" strokeWidth={1.75} fill="currentColor" />
            ) : (
              <Play className="ml-0.5 size-7" strokeWidth={1.75} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            title="Next ayah"
            aria-label="Next ayah"
            onClick={player.nextAyah}
            className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SkipForward className="size-6" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <SpeedControl />
          {player.mode !== "radio" && <RepeatControls />}
          <ReciterSelector />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * The current ayah, word by word, with the same live highlight the reader
 * uses during playback — this is the "dynamic" part: it re-renders only
 * when the highlighted word or the ayah itself changes, not on every
 * playback tick.
 */
function LiveAyahText({ verse, verseKey }: { verse: Verse; verseKey: string }) {
  const highlightedPosition = useHighlightedWord(verseKey)
  const words = (verse.words ?? []).filter(
    (w) => w.char_type_name === "word" || w.char_type_name === "end",
  )

  return (
    <p
      dir="rtl"
      lang="ar"
      className="quran-arabic max-w-lg font-uthmani text-3xl leading-[2.1] text-reader-ink sm:text-4xl"
    >
      {words.map((word) =>
        word.char_type_name === "end" ? (
          <AyahEndMarker
            key={word.id}
            digits={word.qpc_uthmani_hafs || word.text_uthmani}
            ariaLabel={`Ayah ${verse.verse_number}`}
          />
        ) : (
          <span
            key={word.id}
            className={cn(
              "inline-block rounded-sm px-0.5 transition-colors duration-300 ease-out",
              highlightedPosition === word.position && "bg-gold-soft text-gold-strong",
            )}
          >
            {word.qpc_uthmani_hafs || word.text_uthmani}
          </span>
        ),
      )}
    </p>
  )
}

/**
 * The "album art" slot — there is none for recitation audio, so this is a
 * living indicator instead: it breathes while playing and holds a small
 * equalizer that only animates during active playback, so the screen
 * still visibly responds to play/pause even before the ayah text updates.
 */
function NowPlayingOrb({
  isPlaying,
  isBusy,
  prefersReducedMotion,
}: {
  isPlaying: boolean
  isBusy: boolean
  prefersReducedMotion: boolean
}) {
  const active = isPlaying && !isBusy
  return (
    <motion.div
      aria-hidden
      animate={
        prefersReducedMotion || !active
          ? { scale: 1 }
          : { scale: [1, 1.035, 1] }
      }
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "relative flex size-32 items-center justify-center rounded-full sm:size-36",
        "bg-[radial-gradient(circle_at_35%_30%,var(--brand-gold-soft),var(--card)_70%)]",
        "border border-gold-leaf/20 shadow-lg",
      )}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, var(--gold-leaf) 10%, transparent 24%)",
          opacity: active ? 0.55 : 0.15,
          maskImage:
            "radial-gradient(circle, transparent 64%, black 65%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 64%, black 65%, black 100%)",
        }}
      />
      <EqualizerBars active={active} prefersReducedMotion={prefersReducedMotion} />
    </motion.div>
  )
}

const BAR_PEAKS = [0.55, 1, 0.7, 0.4]

function EqualizerBars({
  active,
  prefersReducedMotion,
}: {
  active: boolean
  prefersReducedMotion: boolean
}) {
  return (
    <div className="flex h-8 items-end gap-1">
      {BAR_PEAKS.map((peak, i) => (
        <motion.span
          key={i}
          className="h-8 w-1 origin-bottom rounded-full bg-gold-leaf"
          animate={
            active && !prefersReducedMotion
              ? { scaleY: [0.25, peak, 0.4, peak * 0.75, 0.25] }
              : { scaleY: 0.25 }
          }
          transition={{
            duration: 1 + i * 0.18,
            repeat: active && !prefersReducedMotion ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

/**
 * Three large, softly blurred colour fields drifting in a slow rotation
 * behind the content — the "mesh gradient" backdrop. Frozen under reduced
 * motion (still rendered, just not spinning).
 */
function MeshGradientBackdrop({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -inset-[20%]"
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        style={{
          background: [
            "radial-gradient(38% 38% at 20% 25%, var(--brand-gold-soft) 0%, transparent 70%)",
            "radial-gradient(42% 42% at 80% 30%, var(--primary) 0%, transparent 65%)",
            "radial-gradient(45% 45% at 50% 85%, var(--brand-gold) 0%, transparent 70%)",
          ].join(", "),
          opacity: 0.22,
          filter: "blur(60px)",
        }}
      />
      <div className="absolute inset-0 bg-background/40" />
    </div>
  )
}
