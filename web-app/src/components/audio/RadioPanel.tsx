"use client"

import { useState } from "react"
import Link from "next/link"
import { Play, Pause, Loader2, ArrowRight } from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useChapters } from "@/context/ChaptersContext"
import { usePlaybackVerseKey } from "@/lib/playbackStore"
import { ReciterCombobox } from "@/components/audio/ReciterCombobox"
import { SurahCombobox } from "@/components/quran/SurahCombobox"
import { cn } from "@/lib/utils"

function NowPlaying({ chapterName }: { chapterName: string | null }) {
  const verseKey = usePlaybackVerseKey()
  if (!verseKey) return null
  const [surahId, ayahId] = verseKey.split(":")

  return (
    <Link
      href={`/${surahId}/${ayahId}`}
      className="group flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-120 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>
        Now playing: {chapterName ?? `Surah ${surahId}`} ·{" "}
        <span className="tabular-nums">ayah {ayahId}</span>
      </span>
      <ArrowRight
        className="size-3.5 transition-transform duration-120 group-hover:translate-x-0.5"
        strokeWidth={1.75}
      />
    </Link>
  )
}

export function RadioPanel() {
  const chapters = useChapters()
  const player = useAudioPlayer()
  const [startChapterId, setStartChapterId] = useState<number>(1)

  const isRadio = player.mode === "radio" && player.status !== "idle"
  const isPlaying = isRadio && player.status === "playing"
  const isBusy = isRadio && (player.status === "loading" || player.isBuffering)

  function handleMainButton() {
    if (isRadio && (player.status === "playing" || player.status === "paused")) {
      player.togglePlayPause()
    } else {
      player.startRadio(startChapterId)
    }
  }

  function handleSurahChange(id: number) {
    setStartChapterId(id)
    // Mid-play selection switches the radio immediately (RQ-09)
    if (isRadio) player.startRadio(id)
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          aria-label={isPlaying ? "Pause radio" : "Play radio"}
          onClick={handleMainButton}
          className={cn(
            "flex size-20 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground shadow-lg",
            "transition-all duration-150 hover:scale-[1.03] hover:bg-primary/90 active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4",
          )}
        >
          {isBusy ? (
            <Loader2 className="size-8 animate-spin" strokeWidth={1.5} />
          ) : isPlaying ? (
            <Pause className="size-8" strokeWidth={1.5} />
          ) : (
            <Play className="ml-1 size-8" strokeWidth={1.5} />
          )}
        </button>

        {isRadio ? (
          <NowPlaying chapterName={player.chapterName} />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Continuous recitation, surah after surah — from your chosen
            starting point to the end of the Quran and around again.
          </p>
        )}

        {player.status === "error" && (
          <button
            type="button"
            onClick={player.retry}
            className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors duration-120 hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {player.errorMessage ?? "Couldn't load audio"} — tap to retry
          </button>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Start from
        </h2>
        <SurahCombobox
          chapters={chapters}
          value={startChapterId}
          onChange={handleSurahChange}
        />
        {isRadio && player.chapterId !== null && (
          <button
            type="button"
            onClick={() => setStartChapterId(player.chapterId ?? 1)}
            className="rounded-sm text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Use current surah ({player.chapterName ?? player.chapterId})
          </button>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Reciter
        </h2>
        <ReciterCombobox
          value={player.reciterId}
          onChange={player.setReciter}
          label="Reciter"
        />
      </section>
    </div>
  )
}
