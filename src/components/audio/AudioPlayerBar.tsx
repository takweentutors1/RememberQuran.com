"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  X,
  RadioTower,
  RotateCcw,
} from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useElapsedSeconds, usePlaybackVerseKey } from "@/lib/playbackStore"
import { SpeedControl } from "./SpeedControl"
import { RepeatControls } from "./RepeatControls"
import { ReciterSelector } from "./ReciterSelector"
import { cn } from "@/lib/utils"

const barBtn = cn(
  "flex size-8 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:opacity-30 disabled:pointer-events-none",
)

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m)
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`
}

/**
 * Progress + scrubber strip along the bar's top edge. Visual track is plain
 * divs; a transparent native range input on top handles click/drag/keyboard.
 * While dragging, the local value shields the UI from the 1 Hz store ticks.
 */
function SeekBar({
  durationMs,
  onSeek,
}: {
  durationMs: number
  onSeek: (ms: number) => void
}) {
  const elapsed = useElapsedSeconds()
  const [dragValue, setDragValue] = useState<number | null>(null)
  const [hoverFrac, setHoverFrac] = useState<number | null>(null)
  const total = Math.max(1, Math.round(durationMs / 1000))
  const value = Math.min(dragValue ?? elapsed, total)

  return (
    <div
      className="group absolute inset-x-0 -top-1.5 h-3"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoverFrac(
          Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1),
        )
      }}
      onPointerLeave={() => setHoverFrac(null)}
    >
      {hoverFrac !== null && (
        <span
          className="pointer-events-none absolute bottom-full mb-1.5 -translate-x-1/2 rounded-md border border-border/60 bg-background/95 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm"
          style={{ left: `${hoverFrac * 100}%` }}
        >
          {formatTime(hoverFrac * total)}
        </span>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-border/60 transition-[height] duration-[120ms] group-hover:h-1"
      >
        <div
          className="h-full bg-primary"
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={total}
        step={1}
        value={value}
        aria-label="Seek"
        aria-valuetext={`${formatTime(value)} of ${formatTime(total)}`}
        onChange={(e) => {
          const next = Number(e.target.value)
          setDragValue(next)
          onSeek(next * 1000)
        }}
        onPointerUp={() => setDragValue(null)}
        onKeyUp={() => setDragValue(null)}
        onBlur={() => setDragValue(null)}
        className={cn(
          "absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:transition-opacity [&::-webkit-slider-thumb]:duration-[120ms]",
          "group-hover:[&::-webkit-slider-thumb]:opacity-100 focus-visible:[&::-webkit-slider-thumb]:opacity-100",
          "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:opacity-0 [&::-moz-range-thumb]:transition-opacity [&::-moz-range-thumb]:duration-[120ms]",
          "group-hover:[&::-moz-range-thumb]:opacity-100 focus-visible:[&::-moz-range-thumb]:opacity-100",
        )}
      />
    </div>
  )
}

/** Elapsed time isolated in its own component — re-renders 1×/sec here only */
function ElapsedTime({ durationMs }: { durationMs: number | null }) {
  const elapsed = useElapsedSeconds()
  return (
    <span className="text-xs tabular-nums text-muted-foreground">
      {formatTime(elapsed)}
      {durationMs ? (
        <span className="hidden sm:inline">{` / ${formatTime(durationMs / 1000)}`}</span>
      ) : null}
    </span>
  )
}

function NowPlayingLabel({
  chapterId,
  chapterName,
  isRadio,
}: {
  chapterId: number | null
  chapterName: string | null
  isRadio: boolean
}) {
  const verseKey = usePlaybackVerseKey()
  const verseNumber = verseKey ? verseKey.split(":")[1] : null
  const href =
    chapterId !== null
      ? verseNumber
        ? `/${chapterId}/${verseNumber}`
        : `/${chapterId}`
      : "/"

  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 transition-colors duration-[120ms] hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Go to this ayah"
    >
      {isRadio && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          <RadioTower className="size-2.5" strokeWidth={2} />
          Radio
        </span>
      )}
      <span className="truncate text-sm font-medium text-foreground">
        {chapterName ?? (chapterId !== null ? `Surah ${chapterId}` : "")}
      </span>
      {verseKey && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {verseKey}
        </span>
      )}
    </Link>
  )
}

/**
 * Persistent mini player. Lives in the root layout so playback survives
 * navigation; renders nothing while idle, so the M1 layout is untouched
 * until the user actually plays audio.
 */
export function AudioPlayerBar() {
  const player = useAudioPlayer()

  if (player.status === "idle") return null

  const isPlaying = player.status === "playing"
  const isBusy = player.status === "loading" || player.isBuffering

  return (
    <div
      role="region"
      aria-label="Audio player"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40",
        "border-t border-border/60 bg-background/95 backdrop-blur-sm",
        "pb-[env(safe-area-inset-bottom)]",
        "animate-in slide-in-from-bottom-4 fade-in duration-200",
      )}
    >
      {player.durationMs !== null &&
        player.status !== "error" &&
        player.status !== "loading" && (
          <SeekBar durationMs={player.durationMs} onSeek={player.seekToTime} />
        )}
      <div className="site-shell flex h-14 items-center gap-1.5 px-3 sm:gap-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <NowPlayingLabel
            chapterId={player.chapterId}
            chapterName={player.chapterName}
            isRadio={player.mode === "radio"}
          />
        </div>

        {player.status === "error" ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-destructive">
              {player.errorMessage ?? "Couldn't load audio"}
            </span>
            <button
              type="button"
              title="Retry"
              onClick={player.retry}
              className={cn(barBtn, "text-foreground")}
            >
              <RotateCcw className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              title="Previous ayah"
              aria-label="Previous ayah"
              onClick={player.prevAyah}
              className={cn(barBtn, "hidden sm:flex")}
            >
              <SkipBack className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              title={isPlaying ? "Pause" : "Play"}
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={player.togglePlayPause}
              className={cn(barBtn, "size-9 text-foreground")}
            >
              {isBusy ? (
                <Loader2 className="size-4.5 animate-spin" strokeWidth={1.75} />
              ) : isPlaying ? (
                <Pause className="size-4.5" strokeWidth={1.75} />
              ) : (
                <Play className="size-4.5" strokeWidth={1.75} />
              )}
            </button>
            <button
              type="button"
              title="Next ayah"
              aria-label="Next ayah"
              onClick={player.nextAyah}
              className={cn(barBtn, "hidden sm:flex")}
            >
              <SkipForward className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ElapsedTime durationMs={player.durationMs} />
          <SpeedControl />
          {player.mode !== "radio" && <RepeatControls />}
          <ReciterSelector />
          <div className="mx-0.5 hidden h-4 w-px bg-border/50 sm:block" aria-hidden="true" />
          <button
            type="button"
            title="Close player"
            aria-label="Close player"
            onClick={player.stop}
            className={barBtn}
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  )
}
