"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSurahContent } from "@/context/SurahContentContext"
import { useAudioPlayer } from "@/context/AudioPlayerContext"

function parseSurahId(pathname: string): number | null {
  const match = pathname.match(/^\/(\d+)(?:\/|$)/)
  if (!match) return null
  const id = Number(match[1])
  return id >= 1 && id <= 114 ? id : null
}

export function KeyboardSurahNav() {
  const pathname = usePathname()
  const { loadSurah } = useSurahContent()
  const player = useAudioPlayer()

  const id = parseSurahId(pathname)
  const prevId = id && id > 1 ? id - 1 : null
  const nextId = id && id < 114 ? id + 1 : null

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Surah navigation
      if (e.key === "[" && prevId) {
        e.preventDefault()
        loadSurah(prevId)
      } else if (e.key === "]" && nextId) {
        e.preventDefault()
        loadSurah(nextId)
      }

      // Audio Playback shortcuts
      if (e.code === "Space") {
        if (player.status !== "idle") {
          e.preventDefault()
          player.togglePlayPause()
        }
      } else if (e.key === "ArrowRight") {
        if (player.status === "playing" || player.status === "paused") {
          e.preventDefault()
          player.nextAyah()
        }
      } else if (e.key === "ArrowLeft") {
        if (player.status === "playing" || player.status === "paused") {
          e.preventDefault()
          player.prevAyah()
        }
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prevId, nextId, loadSurah, player])

  return null
}
