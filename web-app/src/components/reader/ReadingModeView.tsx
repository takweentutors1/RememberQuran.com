"use client"

import { Fragment } from "react"
import type { Verse } from "@/types/quran"
import { useHighlightedWord } from "@/lib/playbackStore"
import { ArabicWord } from "./ArabicWord"
import { AyahEndMarker } from "./AyahEndMarker"
import { HideableArabic } from "./HideableArabic"
import { toArabicDigits } from "./AyahText"
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
        {words.map((word, i) => {
          if (word.char_type_name === "end") return null
          const isLast = i === words.length - 1
          const endWord = !isLast && words[i + 1]?.char_type_name === "end" ? words[i + 1] : null

          return (
            <span key={word.id} className={endWord ? "whitespace-nowrap" : undefined}>
              <ArabicWord
                word={word}
                isHighlighted={highlightedPosition === word.position}
                verseKey={verse.verse_key}
              />
              {endWord && (
                <AyahEndMarker
                  digits={endWord.qpc_uthmani_hafs || endWord.text_uthmani}
                  ariaLabel={`Ayah ${verse.verse_number}`}
                />
              )}
              {!isLast && !endWord ? " " : null}
            </span>
          )
        })}{" "}
      </span>
    </HideableArabic>
  )
}

/** Juz/hizb cartouche — a boxed marker breaking the flow, mirroring the
 * small ornamental margin boxes a printed mushaf uses to mark these
 * boundaries. Always spans both reading columns so it reads as a section
 * break rather than getting stranded mid-column. */
function SectionMarker({
  arabicLabel,
  englishLabel,
  number,
  emphasized,
}: {
  arabicLabel: string
  englishLabel: string
  number: number
  emphasized: boolean
}) {
  return (
    <div
      dir="rtl"
      role="separator"
      aria-label={`${englishLabel} ${number}`}
      style={{ columnSpan: "all", breakInside: "avoid" }}
      className={cn("mushaf-marker mx-auto my-6 flex w-fit items-center gap-2.5 px-4 py-1.5", !emphasized && "opacity-80")}
    >
      <span className={cn("quran-arabic text-base leading-none text-gold", emphasized ? "font-medium" : "")}>
        {arabicLabel} {toArabicDigits(number)}
      </span>
      <span aria-hidden className="h-3 w-px bg-gold/30" />
      <span dir="ltr" className="shrink-0 font-mono text-[10px] tabular-nums tracking-wide text-muted-foreground">
        {englishLabel} {number}
      </span>
    </div>
  )
}

/**
 * Continuous Arabic flow (quran.com "Reading" preference) — Quran text
 * only, deliberately, regardless of the reader's translation setting.
 * "Verse by verse" is the annotated/study mode where translations belong;
 * Reading mode's whole promise (see its description in DisplayModeToggle)
 * is an unbroken mushaf-style page: two gold-ruled columns on wide screens
 * (one on mobile), juz/hizb cartouches breaking the flow at each boundary,
 * gold end-of-ayah medallions.
 */
export function ReadingModeView({ verses, targetAyahId }: ReadingModeViewProps) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="mushaf-columns quran-arabic font-uthmani text-justify leading-[1.85]"
    >
      {verses.map((verse, index) => {
        const prev = index > 0 ? verses[index - 1] : null
        const showJuzMarker = verse.juz_number !== prev?.juz_number
        const showHizbMarker = !showJuzMarker && verse.hizb_number !== prev?.hizb_number
        return (
          <Fragment key={verse.id}>
            {showJuzMarker && (
              <SectionMarker arabicLabel="الجزء" englishLabel="Juz" number={verse.juz_number} emphasized />
            )}
            {showHizbMarker && (
              <SectionMarker arabicLabel="الحزب" englishLabel="Hizb" number={verse.hizb_number} emphasized={false} />
            )}
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
