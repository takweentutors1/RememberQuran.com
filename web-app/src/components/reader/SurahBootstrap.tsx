"use client"

import { useLayoutEffect } from "react"
import type { Chapter } from "@/types/quran"
import { useSurahContent } from "@/context/SurahContentContext"

interface SurahBootstrapProps {
  chapter: Chapter
  targetAyahId?: number
}

/**
 * SSR entry: ships chapter metadata only (no multi‑MB verse HTML).
 * Verses load progressively via `/api/surah/[id]?page=N`.
 */
export function SurahBootstrap({ chapter, targetAyahId }: SurahBootstrapProps) {
  const { bootstrap } = useSurahContent()

  useLayoutEffect(() => {
    bootstrap(chapter, targetAyahId)
  }, [chapter, targetAyahId, bootstrap])

  return null
}
