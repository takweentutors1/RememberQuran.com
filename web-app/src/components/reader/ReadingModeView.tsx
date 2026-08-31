"use client"

import { Fragment, useMemo, useState } from "react"
import type { Verse, Word, Chapter } from "@/types/quran"
import { useHighlightedWord } from "@/lib/playbackStore"
import { ArabicWord } from "./ArabicWord"
import { AyahEndMarker } from "./AyahEndMarker"
import { HideableArabic } from "./HideableArabic"
import { MushafPageFrame } from "./MushafPageFrame"
import { SurahHeaderCartouche } from "./SurahHeaderCartouche"
import { BismillahHeader } from "./BismillahHeader"
import { WordStudyRibbon } from "./WordStudyRibbon"
import { toArabicDigits } from "./AyahText"
import { cn } from "@/lib/utils"

interface ReadingModeViewProps {
  verses: Verse[]
  targetAyahId?: number
  chapter?: Chapter
}

interface ReadingVerseProps {
  verse: Verse
  isTarget: boolean
  onWordClick: (word: Word, verseKey?: string) => void
}

/** One verse span in continuous Arabic flow */
function ReadingVerse({ verse, isTarget, onWordClick }: ReadingVerseProps) {
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const words = (verse.words ?? []).filter(
    (w) => w.char_type_name === "word" || w.char_type_name === "end",
  )

  return (
    <HideableArabic
      verseKey={verse.verse_key}
      compact
      className={cn(
        "scroll-mt-28 inline",
        isTarget && "rounded-sm bg-primary/10",
      )}
    >
      <span id={`ayah-${verse.verse_number}`} data-verse-key={verse.verse_key} className="inline">
        {words.map((word, i) => {
          if (word.char_type_name === "end") return null
          const isLast = i === words.length - 1
          const endWord = !isLast && words[i + 1]?.char_type_name === "end" ? words[i + 1] : null

          return (
            <span key={word.id} className={endWord ? "whitespace-nowrap inline" : "inline"}>
              <ArabicWord
                word={word}
                isHighlighted={highlightedPosition === word.position}
                verseKey={verse.verse_key}
                disableTooltip={true}
                onWordClick={onWordClick}
              />
              {endWord ? (
                <AyahEndMarker
                  digits={endWord.qpc_uthmani_hafs || endWord.text_uthmani}
                  ariaLabel={`Ayah ${verse.verse_number}`}
                />
              ) : !isLast ? (
                " "
              ) : null}
            </span>
          )
        })}
        {" "}
      </span>
    </HideableArabic>
  )
}

/** Juz/hizb marker breaking the flow at section boundaries */
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
      className={cn(
        "mushaf-marker mx-auto my-6 flex w-fit items-center gap-2.5 px-4 py-1.5",
        !emphasized && "opacity-85",
      )}
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

interface PageLineWord {
  word: Word
  verseKey: string
  verseNumber: number
  isEnd: boolean
}

function ReadingLineWord({
  item,
  isTarget,
  onWordClick,
}: {
  item: PageLineWord
  isTarget: boolean
  onWordClick: (word: Word, verseKey?: string) => void
}) {
  const highlightedWord = useHighlightedWord(item.verseKey)

  if (item.isEnd) {
    return (
      <AyahEndMarker
        digits={item.word.qpc_uthmani_hafs || item.word.text_uthmani}
        ariaLabel={`Ayah ${item.verseNumber}`}
      />
    )
  }

  return (
    <span
      id={`ayah-${item.verseNumber}`}
      data-verse-key={item.verseKey}
      className={cn(
        "inline-flex items-center",
        isTarget && "rounded-xs bg-primary/10",
      )}
    >
      <ArabicWord
        word={item.word}
        isHighlighted={highlightedWord === item.word.position}
        verseKey={item.verseKey}
        disableTooltip={true}
        onWordClick={onWordClick}
      />
    </span>
  )
}

/**
 * Authentic Printed Quran (Mushaf) Reading Mode
 * Features:
 * - True 15-line Madani Mushaf grid engine (grouping by word.line_number)
 * - Centered calligraphic layout on opening pages (Al-Fatihah / Al-Baqarah 1-5)
 * - Edge-to-edge justification on standard 15-line pages with natural word proximity
 * - Surah title cartouches (Unwan) and calligraphic Basmalah
 * - Docked Word Study Ribbon on word interaction
 */
export function ReadingModeView({ verses, targetAyahId, chapter }: ReadingModeViewProps) {
  const [selectedWord, setSelectedWord] = useState<{ word: Word; verseKey?: string } | null>(null)

  // Group verses into authentic printed Mushaf pages and their exact 15 lines
  const pages = useMemo(() => {
    const pageMap = new Map<number, Verse[]>()
    for (const verse of verses) {
      const p = verse.page_number || 1
      const list = pageMap.get(p) ?? []
      list.push(verse)
      pageMap.set(p, list)
    }

    return Array.from(pageMap.entries()).map(([pageNumber, pageVerses]) => {
      const firstVerse = pageVerses[0]
      const hasSurahStart = pageVerses.some((v) => v.verse_number === 1)
      const juzNumber = firstVerse?.juz_number
      const hizbNumber = firstVerse?.hizb_number

      // Group words into physical Mushaf lines (1 to 15)
      const lineMap = new Map<number, PageLineWord[]>()
      for (const verse of pageVerses) {
        const words = (verse.words ?? []).filter(
          (w) => w.char_type_name === "word" || w.char_type_name === "end",
        )

        for (let i = 0; i < words.length; i++) {
          const w = words[i]
          const isEnd = w.char_type_name === "end"
          const lineNum = w.line_number || 1

          const list = lineMap.get(lineNum) ?? []
          list.push({
            word: w,
            verseKey: verse.verse_key,
            verseNumber: verse.verse_number,
            isEnd,
          })
          lineMap.set(lineNum, list)
        }
      }

      const lines = Array.from(lineMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([lineNum, lineWords]) => ({
          lineNum,
          words: lineWords,
        }))

      return {
        pageNumber,
        verses: pageVerses,
        hasSurahStart,
        juzNumber,
        hizbNumber,
        lines,
      }
    })
  }, [verses])

  function handleWordClick(word: Word, verseKey?: string) {
    setSelectedWord({ word, verseKey })
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      {pages.map((page, pIndex) => {
        const prevPage = pIndex > 0 ? pages[pIndex - 1] : null
        const isNewJuz = prevPage && page.juzNumber !== prevPage.juzNumber
        const isNewHizb = !isNewJuz && prevPage && page.hizbNumber !== prevPage.hizbNumber

        const marginBadges = []
        if (isNewJuz && page.juzNumber) {
          marginBadges.push({
            id: `juz-${page.juzNumber}`,
            label: `الجزء ${toArabicDigits(page.juzNumber)}`,
            sublabel: `Juz ${page.juzNumber}`,
            type: "juz" as const,
          })
        } else if (isNewHizb && page.hizbNumber) {
          marginBadges.push({
            id: `hizb-${page.hizbNumber}`,
            label: `الحزب ${toArabicDigits(page.hizbNumber)}`,
            sublabel: `Hizb ${page.hizbNumber}`,
            type: "hizb" as const,
          })
        }

        const isCenteredOpeningPage = page.pageNumber <= 2

        return (
          <MushafPageFrame
            key={page.pageNumber}
            pageNumber={page.pageNumber}
            juzNumber={page.juzNumber}
            surahNameArabic={chapter?.name_arabic}
            marginBadges={marginBadges}
          >
            {/* Surah Title Cartouche (Unwan) when Surah begins on this page */}
            {page.hasSurahStart && chapter && (
              <div className="w-full mb-3">
                <SurahHeaderCartouche chapter={chapter} />
                {/* For Surahs with bismillah_pre (Surahs 2-114 except 9) */}
                {chapter.bismillah_pre && <BismillahHeader />}
              </div>
            )}

            {/* 15-Line Madani Mushaf Line-by-Line Layout */}
            <div
              dir="rtl"
              lang="ar"
              className={cn(
                "flex flex-col w-full quran-arabic font-uthmani select-text",
                isCenteredOpeningPage ? "gap-2.5 sm:gap-3.5 my-2" : "gap-1 sm:gap-2",
                "text-[1.75rem] sm:text-[2rem] md:text-[2.2rem]",
                "text-[#1E1B18] dark:text-[#E8E2D5]",
              )}
            >
              {page.lines.map(({ lineNum, words: lineWords }) => (
                <div
                  key={lineNum}
                  data-line-number={lineNum}
                  className={cn(
                    "flex items-center w-full leading-none",
                    isCenteredOpeningPage
                      ? "justify-center gap-1.5 sm:gap-2"
                      : "justify-between",
                  )}
                >
                  {lineWords.map((item) => (
                    <ReadingLineWord
                      key={item.word.id}
                      item={item}
                      isTarget={targetAyahId === item.verseNumber}
                      onWordClick={handleWordClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </MushafPageFrame>
        )
      })}

      {/* Docked Word Study Ribbon when any word is clicked */}
      <WordStudyRibbon
        word={selectedWord?.word ?? null}
        verseKey={selectedWord?.verseKey}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  )
}
