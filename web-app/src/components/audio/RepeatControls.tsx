"use client"

import { useState } from "react"
import { Repeat } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { usePlaybackVerseKey } from "@/lib/playbackStore"
import { REPEAT_PAUSE_OPTIONS_MS } from "@/types/audio"
import { cn } from "@/lib/utils"

const barBtn = cn(
  "flex size-8 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
)

const COUNT_OPTIONS: { label: string; value: number }[] = [
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
  { label: "5×", value: 5 },
  { label: "10×", value: 10 },
  { label: "∞", value: Infinity },
]

function pauseLabel(ms: number) {
  if (ms <= 0) return "None"
  return `${ms / 1000}s`
}

/** Memorisation surface: presets, ayah/range repeat, pause between loops */
export function RepeatControls() {
  const player = useAudioPlayer()
  const playingVerseKey = usePlaybackVerseKey()
  const currentVerse = playingVerseKey
    ? Number(playingVerseKey.split(":")[1]) || 1
    : 1
  const maxVerse = player.versesCount ?? 286

  const [draftMode, setDraftMode] = useState<"ayah" | "range">("ayah")
  const [draftStart, setDraftStart] = useState("")
  const [draftEnd, setDraftEnd] = useState("")
  const [draftCount, setDraftCount] = useState<number>(3)
  const [draftPauseMs, setDraftPauseMs] = useState(0)

  const isActive = player.repeat.mode !== "off"
  const start = Number(draftStart) || currentVerse
  const end = Number(draftEnd) || start

  function apply(overrides?: {
    mode?: "ayah" | "range"
    start?: number
    end?: number
    count?: number
    pauseMs?: number
  }) {
    const mode = overrides?.mode ?? draftMode
    const s = overrides?.start ?? start
    const e = overrides?.end ?? end
    player.setRepeat({
      mode,
      start: s,
      end: mode === "ayah" ? s : e,
      count: overrides?.count ?? draftCount,
      pauseMs: overrides?.pauseMs ?? draftPauseMs,
    })
  }

  function turnOff() {
    player.setRepeat({ mode: "off", start: 1, end: 1, count: 1, pauseMs: 0 })
  }

  function applyPreset(
    kind: "ayah-3" | "ayah-5" | "range-3",
  ) {
    const s = currentVerse
    if (kind === "ayah-3") {
      setDraftMode("ayah")
      setDraftCount(3)
      apply({ mode: "ayah", start: s, end: s, count: 3 })
      return
    }
    if (kind === "ayah-5") {
      setDraftMode("ayah")
      setDraftCount(5)
      apply({ mode: "ayah", start: s, end: s, count: 5 })
      return
    }
    const e = Math.min(s + 2, maxVerse)
    setDraftMode("range")
    setDraftStart(String(s))
    setDraftEnd(String(e))
    setDraftCount(3)
    apply({ mode: "range", start: s, end: e, count: 3 })
  }

  const segBtn = (active: boolean) =>
    cn(
      "flex-1 rounded-md px-2 py-1.5 text-xs font-medium",
      "transition-colors duration-[120ms]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
    )

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            title="Repeat (memorisation)"
            aria-label="Repeat settings"
            aria-pressed={isActive}
            className={cn(barBtn, isActive && "text-primary")}
          >
            <Repeat className="size-4" strokeWidth={1.75} />
          </button>
        )}
      />
      <PopoverContent side="top" align="end" className="w-72 p-3">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Repeat
          </p>

          {isActive && (
            <div className="flex items-center justify-between rounded-md bg-primary/10 px-2.5 py-2 text-xs text-primary">
              <span>
                {player.repeat.mode === "ayah"
                  ? `Ayah ${player.repeat.start}`
                  : `Ayahs ${player.repeat.start}–${player.repeat.end}`}
                {player.repeat.count === Infinity
                  ? " · repeating"
                  : ` · ${player.repeat.remaining} left`}
                {player.repeat.pauseMs > 0
                  ? ` · ${pauseLabel(player.repeat.pauseMs)} pause`
                  : ""}
              </span>
              <button
                type="button"
                onClick={turnOff}
                className="rounded-sm font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Stop
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-muted-foreground">Quick presets</p>
            <div className="flex gap-1">
              {(
                [
                  { id: "ayah-3" as const, label: "Ayah ×3" },
                  { id: "ayah-5" as const, label: "Ayah ×5" },
                  { id: "range-3" as const, label: "Range ×3" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  disabled={player.status === "idle"}
                  onClick={() => applyPreset(id)}
                  className={cn(
                    "flex-1 rounded-md border border-border px-1.5 py-1.5 text-[11px] font-medium",
                    "transition-colors duration-[120ms] hover:bg-accent",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:pointer-events-none disabled:opacity-40",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div role="radiogroup" aria-label="Repeat mode" className="flex gap-1 rounded-lg bg-muted/60 p-0.5">
            <button
              type="button"
              role="radio"
              aria-checked={draftMode === "ayah"}
              onClick={() => setDraftMode("ayah")}
              className={segBtn(draftMode === "ayah")}
            >
              Single ayah
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={draftMode === "range"}
              onClick={() => setDraftMode("range")}
              className={segBtn(draftMode === "range")}
            >
              Range
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-muted-foreground">
              {draftMode === "ayah" ? "Ayah" : "From"}
              <Input
                type="number"
                min={1}
                max={maxVerse}
                inputMode="numeric"
                placeholder={String(currentVerse)}
                value={draftStart}
                onChange={(e) => setDraftStart(e.target.value)}
                className="h-8 text-sm"
              />
            </label>
            {draftMode === "range" && (
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-muted-foreground">
                To
                <Input
                  type="number"
                  min={1}
                  max={maxVerse}
                  inputMode="numeric"
                  placeholder={String(Math.min(currentVerse + 2, maxVerse))}
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  className="h-8 text-sm"
                />
              </label>
            )}
          </div>

          <div role="radiogroup" aria-label="Repeat count" className="flex gap-1">
            {COUNT_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={draftCount === value}
                onClick={() => setDraftCount(value)}
                className={cn(
                  "flex-1 rounded-md border px-1.5 py-1 text-xs tabular-nums",
                  "transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  draftCount === value
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-muted-foreground">
              Pause between repeats
            </p>
            <div
              role="radiogroup"
              aria-label="Pause between repeats"
              className="flex gap-1"
            >
              {REPEAT_PAUSE_OPTIONS_MS.map((ms) => (
                <button
                  key={ms}
                  type="button"
                  role="radio"
                  aria-checked={draftPauseMs === ms}
                  onClick={() => setDraftPauseMs(ms)}
                  className={cn(
                    "flex-1 rounded-md border px-1 py-1 text-[11px] tabular-nums",
                    "transition-colors duration-[120ms]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    draftPauseMs === ms
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {pauseLabel(ms)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => apply()}
            disabled={player.status === "idle"}
            className={cn(
              "w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground",
              "transition-colors duration-[120ms] hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {isActive ? "Update repeat" : "Start repeat"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
