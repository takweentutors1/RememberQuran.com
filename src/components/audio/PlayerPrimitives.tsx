"use client"

import { useState } from "react"
import { useElapsedSeconds } from "@/lib/playbackStore"
import { cn } from "@/lib/utils"

/** Shared `layoutId` for the Framer Motion morph between MiniPlayer and FullScreenPlayer. */
export const PLAYER_SURFACE_LAYOUT_ID = "audio-player-surface"

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m)
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`
}

/**
 * Progress + scrubber strip. Visual track is plain divs; a transparent
 * native range input on top handles click/drag/keyboard. While dragging,
 * the local value shields the UI from the 1 Hz store ticks.
 *
 * Shared by `MiniPlayer` and `FullScreenPlayer` — lives in its own module
 * (rather than being exported from one and imported by the other) so the
 * two don't end up importing each other.
 */
export function SeekBar({
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
      onClick={(e) => e.stopPropagation()}
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
export function ElapsedTime({ durationMs }: { durationMs: number | null }) {
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
