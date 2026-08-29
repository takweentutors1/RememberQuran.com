"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Chapter, Verse } from "@/types/quran"
import { useChapterMeta } from "@/context/ChaptersContext"
import { useSurahContent } from "@/context/SurahContentContext"
import { useHighlightedWord, useIsVerseDimmed } from "@/lib/playbackStore"
import { PlayAyahButton } from "@/components/audio/PlayAyahButton"
import { ArabicLine } from "./ArabicLine"
import { AyahNumber } from "./AyahNumber"
import { HideableArabic } from "./HideableArabic"
import { TranslationBlock } from "./TranslationBlock"
import { cn } from "@/lib/utils"

interface CardModeViewProps {
  verses: Verse[]
  chapter: Chapter
  targetAyahId?: number
  activeTranslationIds: number[]
  showTranslation: boolean
}

function VerseCard({
  verse,
  chapter,
  isTarget,
  activeTranslationIds,
  showTranslation,
}: {
  verse: Verse
  chapter: Chapter
  isTarget: boolean
  activeTranslationIds: number[]
  showTranslation: boolean
}) {
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const dimmed = useIsVerseDimmed(verse.verse_key)
  const activeTranslations = verse.translations.filter((t) =>
    activeTranslationIds.includes(t.resource_id),
  )

  return (
    <div
      id={`ayah-${verse.verse_number}`}
      data-verse-key={verse.verse_key}
      className={cn(
        "group flex flex-col gap-4 rounded-[var(--radius-card)] border border-border/50 bg-card p-5 transition-[background-color,box-shadow,opacity] duration-[1500ms]",
        isTarget && "border-gold/50 bg-gold-soft/40",
        dimmed && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between">
        <AyahNumber number={verse.verse_number} isTarget={isTarget} />
        <PlayAyahButton
          chapterId={chapter.id}
          verseNumber={verse.verse_number}
          verseKey={verse.verse_key}
          className="icon-press flex size-7 items-center justify-center rounded-md text-muted-foreground/70 hover:bg-accent hover:text-foreground"
        />
      </div>

      <HideableArabic verseKey={verse.verse_key}>
        <ArabicLine
          words={verse.words}
          highlightedPosition={highlightedPosition}
          verseKey={verse.verse_key}
        />
      </HideableArabic>

      {showTranslation &&
        activeTranslations.map((t) => (
          <TranslationBlock key={t.resource_id} translation={t} />
        ))}
    </div>
  )
}

/** Alternate reading view: verses as individual cards in a responsive grid. */
export function CardModeView({
  verses,
  chapter,
  targetAyahId,
  activeTranslationIds,
  showTranslation,
}: CardModeViewProps) {
  const { loadSurah } = useSurahContent()
  const prevChapter = useChapterMeta(chapter.id > 1 ? chapter.id - 1 : null)
  const nextChapter = useChapterMeta(chapter.id < 114 ? chapter.id + 1 : null)

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {verses.map((verse) => (
          <VerseCard
            key={verse.id}
            verse={verse}
            chapter={chapter}
            isTarget={targetAyahId === verse.verse_number}
            activeTranslationIds={activeTranslationIds}
            showTranslation={showTranslation}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-6">
        <button
          type="button"
          disabled={!prevChapter}
          onClick={() => prevChapter && loadSurah(prevChapter.id)}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-[var(--radius-card)] border border-border/50 px-4 py-2.5 text-sm text-foreground transition-colors duration-(--dur-base) ease-(--ease-out)",
            "hover:border-gold-strong/30 hover:text-gold-strong disabled:pointer-events-none disabled:opacity-30",
          )}
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 truncate">
            {prevChapter ? prevChapter.name_simple : "Previous surah"}
          </span>
        </button>

        <button
          type="button"
          disabled={!nextChapter}
          onClick={() => nextChapter && loadSurah(nextChapter.id)}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-[var(--radius-card)] border border-border/50 px-4 py-2.5 text-sm text-foreground transition-colors duration-(--dur-base) ease-(--ease-out)",
            "hover:border-gold-strong/30 hover:text-gold-strong disabled:pointer-events-none disabled:opacity-30",
          )}
        >
          <span className="min-w-0 truncate">
            {nextChapter ? nextChapter.name_simple : "Next surah"}
          </span>
          <ChevronRight className="size-4 shrink-0" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
