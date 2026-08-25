"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useSurahContent } from "@/context/SurahContentContext"

/** "word" (morphology) lands in Phase 5 — the shell is built around this
 * union from day one so it slots in without rework. */
export type StudyView = "tafsir" | "asbab" | "word"

export interface StudyTarget {
  view: StudyView
  verseKey: string
  /** Only set for the "word" view (1-based word position within the verse) */
  wordPosition?: number
}

interface StudyPanelContextValue {
  target: StudyTarget | null
  openTafsir: (verseKey: string) => void
  openAsbab: (verseKey: string) => void
  openWord: (verseKey: string, wordPosition: number) => void
  setView: (view: StudyView) => void
  /** Move the panel to the previous/next ayah, clamped to the surah bounds */
  navigateAyah: (delta: 1 | -1) => void
  close: () => void
}

const StudyPanelContext = createContext<StudyPanelContextValue | null>(null)

export function StudyPanelProvider({ children }: { children: ReactNode }) {
  const { chapter, surahId } = useSurahContent()
  const [rawTarget, setTarget] = useState<StudyTarget | null>(null)

  // Never let a stale panel survive surah navigation — a target from another
  // surah is treated as closed (derived, so no effect/cascading render).
  const target =
    rawTarget !== null &&
    surahId !== null &&
    Number(rawTarget.verseKey.split(":")[0]) !== surahId
      ? null
      : rawTarget

  const openTafsir = useCallback((verseKey: string) => {
    setTarget({ view: "tafsir", verseKey })
  }, [])

  const openAsbab = useCallback((verseKey: string) => {
    setTarget({ view: "asbab", verseKey })
  }, [])

  const openWord = useCallback((verseKey: string, wordPosition: number) => {
    setTarget({ view: "word", verseKey, wordPosition })
  }, [])

  const setView = useCallback((view: StudyView) => {
    setTarget((prev) => (prev ? { ...prev, view } : prev))
  }, [])

  const versesCount = chapter?.verses_count ?? null

  const navigateAyah = useCallback(
    (delta: 1 | -1) => {
      setTarget((prev) => {
        if (!prev || versesCount === null) return prev
        const [surah, ayah] = prev.verseKey.split(":").map(Number)
        const next = ayah + delta
        if (next < 1 || next > versesCount) return prev
        // Word position is meaningless on a different ayah
        return { view: prev.view, verseKey: `${surah}:${next}` }
      })
    },
    [versesCount],
  )

  const close = useCallback(() => setTarget(null), [])

  return (
    <StudyPanelContext.Provider
      value={{ target, openTafsir, openAsbab, openWord, setView, navigateAyah, close }}
    >
      {children}
    </StudyPanelContext.Provider>
  )
}

export function useStudyPanel() {
  const ctx = useContext(StudyPanelContext)
  if (!ctx) throw new Error("useStudyPanel must be used within StudyPanelProvider")
  return ctx
}
