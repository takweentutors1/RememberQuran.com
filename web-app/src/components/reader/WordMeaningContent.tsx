"use client"

import { Volume2, GraduationCap } from "lucide-react"
import { useAudioPlayerActions } from "@/context/AudioPlayerContext"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { getWordAudioUrl } from "@/lib/audioSources"
import type { Word } from "@/types/quran"

interface WordMeaningContentProps {
  word: Word
  verseKey?: string
}

export function WordMeaningContent({ word, verseKey }: WordMeaningContentProps) {
  const actions = useAudioPlayerActions()
  const { openWord } = useStudyPanel()
  const hasAudio = !!getWordAudioUrl(word)

  return (
    <div className="flex min-w-[70px] max-w-[150px] flex-col items-center text-center select-none py-0.5 px-0.5">
      {/* Arabic Word Glyph */}
      <span
        className="font-arabic text-base sm:text-lg font-bold leading-tight text-gold"
        dir="rtl"
        lang="ar"
      >
        {word.qpc_uthmani_hafs || word.text_uthmani}
      </span>

      {/* English Meaning */}
      <span className="text-[11px] font-medium text-foreground/95 leading-tight mt-0.5 line-clamp-2">
        {word.translation.text}
      </span>

      {/* Transliteration */}
      {word.transliteration?.text && (
        <span className="text-[10px] italic text-muted-foreground/75 leading-tight mt-0.5">
          {word.transliteration.text}
        </span>
      )}

      {/* Micro Quick Actions */}
      <div className="mt-1 flex items-center justify-center gap-1 pt-1 border-t border-border/40 w-full">
        {hasAudio && actions && (
          <button
            type="button"
            title="Pronunciation"
            aria-label="Pronounce"
            onClick={(e) => {
              e.stopPropagation()
              actions.playWord(word)
            }}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-all duration-150 hover:bg-gold/15 hover:text-gold focus-visible:outline-none"
          >
            <Volume2 className="size-3" strokeWidth={2} />
          </button>
        )}
        {verseKey && (
          <button
            type="button"
            title="Grammar"
            aria-label="Grammar"
            onClick={(e) => {
              e.stopPropagation()
              openWord(verseKey, word.position)
            }}
            className="flex h-5 items-center justify-center gap-1 rounded-full px-1.5 text-muted-foreground transition-all duration-150 hover:bg-gold/15 hover:text-gold focus-visible:outline-none"
          >
            <GraduationCap className="size-3" strokeWidth={2} />
            <span className="text-[9px] font-semibold uppercase tracking-wider">Grammar</span>
          </button>
        )}
      </div>
    </div>
  )
}

