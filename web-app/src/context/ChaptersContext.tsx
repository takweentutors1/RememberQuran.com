"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Chapter } from "@/types/quran"

const ChaptersContext = createContext<Chapter[] | null>(null)

export function ChaptersProvider({
  chapters,
  children,
}: {
  chapters: Chapter[]
  children: ReactNode
}) {
  return (
    <ChaptersContext.Provider value={chapters}>{children}</ChaptersContext.Provider>
  )
}

export function useChapters() {
  const chapters = useContext(ChaptersContext)
  if (!chapters) throw new Error("useChapters must be used within ChaptersProvider")
  return chapters
}

export function useChapterMeta(id: number | null | undefined): Chapter | null {
  const chapters = useContext(ChaptersContext)
  if (!chapters || id == null) return null
  return chapters.find((chapter) => chapter.id === id) ?? null
}
