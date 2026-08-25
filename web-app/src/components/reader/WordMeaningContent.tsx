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
    <div className="flex min-w-[80px] max-w-[180px] flex-col items-center gap-1.5 text-center">
      <span
        className="font-arabic text-lg leading-none"
        dir="rtl"
        lang="ar"
      >
        {word.qpc_uthmani_hafs || word.text_uthmani}
      </span>
      <span className="text-xs leading-snug">
        {word.translation.text}
      </span>
      {word.transliteration?.text && (
        <span className="text-[10px] italic text-muted-foreground">
          {word.transliteration.text}
        </span>
      )}
      <div className="mt-0.5 flex items-center gap-1">
        {hasAudio && actions && (
          <button
            type="button"
            title="Hear this word"
            aria-label="Hear this word"
            onClick={() => actions.playWord(word)}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Volume2 className="size-3.5" strokeWidth={1.75} />
          </button>
        )}
        {verseKey && (
          <button
            type="button"
            title="Word grammar"
            aria-label="Show word grammar"
            onClick={() => openWord(verseKey, word.position)}
            className="flex h-6 items-center justify-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GraduationCap className="size-3.5" strokeWidth={1.75} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Grammar</span>
          </button>
        )}
      </div>
    </div>
  )
}
