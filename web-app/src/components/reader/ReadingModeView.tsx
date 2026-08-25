"use client"

import { Fragment } from "react"
import type { Verse } from "@/types/quran"
import { useHighlightedWord } from "@/lib/playbackStore"
import { ArabicWord } from "./ArabicWord"
import { AyahEndMarker } from "./AyahEndMarker"
import { HideableArabic } from "./HideableArabic"
import { cn } from "@/lib/utils"

interface ReadingModeViewProps {
  verses: Verse[]
  targetAyahId?: number
}

/** One verse span — separate component so the playback-highlight
 * subscription is per verse and only the recited verse re-renders. */
function ReadingVerse({ verse, isTarget }: { verse: Verse; isTarget: boolean }) {
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const words = (verse.words ?? []).filter(
    (w) => w.char_type_name === "word" || w.char_type_name === "end",
  )

  return (
    <HideableArabic
      verseKey={verse.verse_key}
      compact
      className={cn(
        "scroll-mt-28",
        isTarget && "rounded-sm bg-primary/8",
      )}
    >
      <span id={`ayah-${verse.verse_number}`} data-verse-key={verse.verse_key}>
        {words.map((word, i) =>
          word.char_type_name === "end" ? (
            <AyahEndMarker
              key={word.id}
              digits={word.qpc_uthmani_hafs || word.text_uthmani}
              ariaLabel={`Ayah ${verse.verse_number}`}
            />
          ) : (
            <span key={word.id}>
              <ArabicWord
                word={word}
                isHighlighted={highlightedPosition === word.position}
                verseKey={verse.verse_key}
              />
              {i < words.length - 1 ? " " : null}
            </span>
          ),
        )}{" "}
      </span>
    </HideableArabic>
  )
}

/** Juz boundary divider — mirrors comparable Quran sites, which mark the
 * juz a reader is currently in rather than leaving continuous mode as one
 * undifferentiated block of text. */
function JuzMarker({ juz }: { juz: number }) {
  return (
    <div
      dir="ltr"
      role="separator"
      aria-label={`Juz ${juz}`}
      className="my-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
    >
      <span aria-hidden className="h-px flex-1 bg-border/50" />
      <span className="shrink-0 tabular-nums">Juz {juz}</span>
      <span aria-hidden className="h-px flex-1 bg-border/50" />
    </div>
  )
}

/**
 * Continuous Arabic flow (quran.com "Reading" preference) — Quran text
 * only, deliberately, regardless of the reader's translation setting.
 * "Verse by verse" is the annotated/study mode where translations belong;
 * Reading mode's whole promise (see its description in DisplayModeToggle)
 * is an unbroken mushaf-style page. Words stream RTL; end-of-ayah glyphs
 * mark verse boundaries; juz dividers break up the flow at each boundary
 * crossed within the surah.
 */
export function ReadingModeView({ verses, targetAyahId }: ReadingModeViewProps) {
  return (
    <div dir="rtl" lang="ar" className="quran-arabic mx-auto max-w-[44rem] text-justify font-uthmani leading-[var(--quran-leading)]">
      {verses.map((verse, index) => {
        const prevJuz = index > 0 ? verses[index - 1].juz_number : null
        const showJuzMarker = verse.juz_number !== prevJuz
        return (
          <Fragment key={verse.id}>
            {showJuzMarker && <JuzMarker juz={verse.juz_number} />}
            <ReadingVerse
              verse={verse}
              isTarget={targetAyahId === verse.verse_number}
            />
          </Fragment>
        )
      })}
    </div>
  )
}
