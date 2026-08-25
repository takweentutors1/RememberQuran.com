"use client"

import { useAudioPlayerOptional } from "@/context/AudioPlayerContext"

/**
 * Reserves space at the bottom of the reader so the fixed MiniPlayer never
 * covers the last ayah. Taller on mobile than desktop: the player floats
 * above `BottomNav` there (see `MiniPlayer`'s `bottom-24`) instead of
 * sitting flush against the viewport edge. Collapses to h-0 while idle.
 */
export function AudioDockSpacer() {
  const player = useAudioPlayerOptional()
  const barVisible = !!player && player.status !== "idle"

  return (
    <div
      data-slot="audio-dock"
      aria-hidden="true"
      className={barVisible ? "h-40 md:h-16" : "h-0"}
    />
  )
}
