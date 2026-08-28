"use client"

import { useEffect } from "react"
import { Volume2, GraduationCap, X } from "lucide-react"
import { useAudioPlayerActions } from "@/context/AudioPlayerContext"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { getWordAudioUrl } from "@/lib/audioSources"
import { buildTajweedSpans } from "@/lib/tajweed"
import type { Word } from "@/types/quran"
import { cn } from "@/lib/utils"

interface WordStudyRibbonProps {
  word: Word | null
  verseKey?: string
  onClose: () => void
}

/**
 * Docked Word Study Ribbon (شريط دراسة المفردات)
 * Floats unobtrusively at the bottom of the screen when a word is selected in reading mode,
 * preserving unbroken visual focus on the sacred Mushaf text.
 */
export function WordStudyRibbon({ word, verseKey, onClose }: WordStudyRibbonProps) {
  const actions = useAudioPlayerActions()
  const { openWord } = useStudyPanel()
  const { tajweedEnabled } = useReaderSettings()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  if (!word) return null

  const plainText = word.qpc_uthmani_hafs || word.text_uthmani
  const hasAudio = !!getWordAudioUrl(word)

  function renderWordGlyphs() {
    if (tajweedEnabled && word?.text_uthmani_tajweed) {
      return buildTajweedSpans(plainText, word.text_uthmani_tajweed).map(
        ({ text, rule }, i) =>
          rule ? (
            <span key={i} className={`tj-span tj-${rule}`}>
              {text}
            </span>
          ) : (
            <span key={i} className="tj-span">
              {text}
            </span>
          ),
      )
    }
    return plainText
  }

  return (
    <div
      role="dialog"
      aria-label="Word Study Ribbon"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "w-[94%] max-w-xl animate-in fade-in-0 slide-in-from-bottom-6 duration-200",
        "rounded-2xl border-2 border-gold/60 bg-background/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left / Center Content: Arabic Glyph + Meaning + Transliteration */}
        <div className="flex flex-1 items-center gap-4 min-w-0">
          {/* Word Arabic Glyph */}
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-gold/10 px-3.5 py-1.5 border border-gold/40">
            <span className="quran-arabic text-2xl sm:text-3xl text-gold leading-none" dir="rtl" lang="ar">
              {renderWordGlyphs()}
            </span>
          </div>

          {/* Meaning & Transliteration */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {word.translation?.text || "—"}
            </span>
            {word.transliteration?.text && (
              <span className="text-xs italic text-muted-foreground truncate">
                {word.transliteration.text}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hasAudio && actions && (
            <button
              type="button"
              title="Pronounce word"
              aria-label="Pronounce word"
              onClick={() => actions.playWord(word)}
              className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform hover:scale-105 hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Volume2 className="size-4" />
            </button>
          )}

          {verseKey && (
            <button
              type="button"
              title="Grammar & Morphology"
              aria-label="Show word grammar"
              onClick={() => openWord(verseKey, word.position)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-secondary/60 px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GraduationCap className="size-4 text-gold" />
              <span className="hidden sm:inline">Grammar</span>
            </button>
          )}

          <button
            type="button"
            title="Close"
            aria-label="Close word study ribbon"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
