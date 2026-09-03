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
    <div className="flex min-w-[90px] max-w-[200px] flex-col items-center gap-1 text-center py-0.5 px-1 select-none">
      {/* Arabic Word Glyph */}
      <span
        className="font-arabic text-xl sm:text-2xl font-bold leading-tight text-gold drop-shadow-xs"
        dir="rtl"
        lang="ar"
      >
        {word.qpc_uthmani_hafs || word.text_uthmani}
      </span>

      {/* English Meaning */}
      <span className="text-xs font-medium text-foreground/95 leading-snug">
        {word.translation.text}
      </span>

      {/* Transliteration */}
      {word.transliteration?.text && (
        <span className="text-[11px] italic text-muted-foreground/80 leading-none">
          {word.transliteration.text}
        </span>
      )}

      {/* Micro Quick Actions */}
      <div className="mt-1.5 flex items-center justify-center gap-1.5 pt-1 border-t border-border/40 w-full">
        {hasAudio && actions && (
          <button
            type="button"
            title="Hear word pronunciation"
            aria-label="Hear word pronunciation"
            onClick={(e) => {
              e.stopPropagation()
              actions.playWord(word)
            }}
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-all duration-150 hover:bg-gold/15 hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          >
            <Volume2 className="size-3.5" strokeWidth={2} />
          </button>
        )}
        {verseKey && (
          <button
            type="button"
            title="Word grammar & morphology"
            aria-label="Show word grammar & morphology"
            onClick={(e) => {
              e.stopPropagation()
              openWord(verseKey, word.position)
            }}
            className="flex h-6 items-center justify-center gap-1 rounded-full px-2 text-muted-foreground transition-all duration-150 hover:bg-gold/15 hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          >
            <GraduationCap className="size-3.5" strokeWidth={2} />
            <span className="text-[10px] font-semibold tracking-wide uppercase">Grammar</span>
          </button>
        )}
      </div>
    </div>
  )
}

