"use client"

import { Play, Pause, Loader2 } from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useIsVerseActive } from "@/lib/playbackStore"
import { cn } from "@/lib/utils"

interface PlayAyahButtonProps {
  chapterId: number
  verseNumber: number
  verseKey: string
  className?: string
}

export function PlayAyahButton({
  chapterId,
  verseNumber,
  verseKey,
  className,
}: PlayAyahButtonProps) {
  const player = useAudioPlayer()
  const isActive = useIsVerseActive(verseKey)

  const isLoadingThis =
    player.status === "loading" && player.loadingVerseKey === verseKey
  const isPlayingThis = isActive && player.status === "playing"
  const isPausedThis = isActive && player.status === "paused"

  function handleClick() {
    if (isPlayingThis || isPausedThis) {
      player.togglePlayPause()
    } else {
      player.playVerse(chapterId, verseNumber)
    }
  }

  return (
    <button
      type="button"
      title={isPlayingThis ? "Pause" : `Play ayah ${verseKey}`}
      aria-label={isPlayingThis ? "Pause" : `Play ayah ${verseKey}`}
      onClick={handleClick}
      className={cn(className, isPlayingThis && "text-primary")}
    >
      {isLoadingThis ? (
        <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
      ) : isPlayingThis ? (
        <Pause className="size-3.5" strokeWidth={1.75} />
      ) : (
        <Play className="size-3.5" strokeWidth={1.75} />
      )}
    </button>
  )
}
