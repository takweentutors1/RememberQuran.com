"use client"

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
import { usePlaybackVerseKey } from "@/lib/playbackStore"
import { cn } from "@/lib/utils"
import { ElapsedTime, PLAYER_SURFACE_LAYOUT_ID, SeekBar } from "./PlayerPrimitives"
import { ReciterSelector } from "./ReciterSelector"
import { RepeatControls } from "./RepeatControls"
import { SpeedControl } from "./SpeedControl"

/** Drag the sheet down by more than this to dismiss, Apple-Music-style. */
const DISMISS_THRESHOLD_PX = 120

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
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-background text-foreground"
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

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-8 text-center">
        {player.mode === "radio" && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            <RadioTower className="size-3" strokeWidth={2} />
            Live recitation
          </span>
        )}

        <div
          aria-hidden
          className={cn(
            "flex size-56 items-center justify-center rounded-full",
            "bg-[radial-gradient(circle_at_35%_30%,var(--brand-gold-soft),var(--card)_70%)]",
            "border border-gold-leaf/20 shadow-lg sm:size-64",
          )}
        >
          <span className="font-uthmani text-6xl text-gold-leaf/70 sm:text-7xl">
            ﷽
          </span>
        </div>

        <div className="max-w-sm">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            {player.chapterName ??
              (player.chapterId !== null ? `Surah ${player.chapterId}` : "")}
          </h1>
          {verseKey && (
            <Link
              href={`/${surahId}/${ayahId}`}
              onClick={onClose}
              className="mt-2 inline-block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Ayah {verseKey} · Read in context
            </Link>
          )}
        </div>

        <div className="w-full max-w-sm">
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

        <div className="flex items-center gap-2">
          <SpeedControl />
          {player.mode !== "radio" && <RepeatControls />}
          <ReciterSelector />
        </div>
      </div>
    </motion.div>
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
