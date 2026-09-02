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
        isTarget && "rounded-xs bg-primary/10",
      )}
    >
      <span id={`ayah-${verse.verse_number}`} data-verse-key={verse.verse_key} className="inline">
        {words.map((word, i) => {
          if (word.char_type_name === "end") return null
          const isLast = i === words.length - 1
          const endWord = !isLast && words[i + 1]?.char_type_name === "end" ? words[i + 1] : null

          return (
            <Fragment key={word.id}>
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
                
                
              ) : (
                " "
              )}
            </Fragment>
          )
        })}
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

/**
 * Authentic Printed Quran (Mushaf) 15-Line Madani Reading Mode
 * Features:
 * - Exact 15-line standard line-by-line rendering matching King Fahd Madani Mushaf
 * - Centered calligraphic layout on opening pages (Al-Fatihah / Al-Baqarah 1-5)
 * - Surah title cartouches (Unwan) and calligraphic Basmalah
 * - Docked Word Study Ribbon on word interaction
 */
export function ReadingModeView({ verses, targetAyahId, chapter }: ReadingModeViewProps) {
  const [selectedWord, setSelectedWord] = useState<{ word: Word; verseKey?: string } | null>(null)

  // Group verses into authentic printed Mushaf pages and 15 lines per page
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

      // Group words into lines 1..15 based on word.line_number
      const lineMap = new Map<number, { word: Word; verse: Verse }[]>()
      for (let i = 1; i <= 15; i++) {
        lineMap.set(i, [])
      }

      pageVerses.forEach((verse) => {
        (verse.words ?? []).forEach((word) => {
          const lNum = word.line_number || 1
          const lineList = lineMap.get(lNum) ?? []
          lineList.push({ word, verse })
          lineMap.set(lNum, lineList)
        })
      })

      const lines = Array.from(lineMap.entries())
        .map(([lineNumber, words]) => ({ lineNumber, words }))
        .filter((l) => l.words.length > 0)

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
            title: "الجزء",
            number: page.juzNumber,
            sublabel: `Juz ${page.juzNumber}`,
            type: "juz" as const,
          })
        } else if (isNewHizb && page.hizbNumber) {
          marginBadges.push({
            id: `hizb-${page.hizbNumber}`,
            title: "الحزب",
            number: page.hizbNumber,
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

            {/* 15-Line Madani Standard Grid or Centered Opening Page */}
            <div
              dir="rtl"
              lang="ar"
              className={cn(
                "quran-arabic font-uthmani select-text w-full",
                "text-[#1E1B18] dark:text-[#E8E2D5]",
                isCenteredOpeningPage
                  ? "flex flex-col items-center justify-center space-y-3 py-2 text-center text-[1.65rem] sm:text-[1.85rem] md:text-[2.05rem] leading-[2.1]"
                  : "flex flex-col justify-between min-h-[560px] sm:min-h-[640px] md:min-h-[720px] py-1",
              )}
            >
              {isCenteredOpeningPage ? (
                // Opening pages (Fatihah / Baqarah 1-5): Continuous centered calligraphic flow
                page.verses.map((verse) => (
                  <div key={verse.id} className="w-full text-center">
                    <ReadingVerse
                      verse={verse}
                      isTarget={targetAyahId === verse.verse_number}
                      onWordClick={handleWordClick}
                    />
                  </div>
                ))
              ) : (
                // Standard 15-Line Madani Page: Exact line-by-line justified rendering
                page.lines.map(({ lineNumber, words }) => (
                  <div
                    key={lineNumber}
                    data-line-number={lineNumber}
                    className={cn(
                      "w-full flex items-center justify-between text-justify",
                      "text-[1.42rem] sm:text-[1.65rem] md:text-[1.85rem]",
                      "leading-none my-0.5",
                    )}
                  >
                    {words.map(({ word, verse }) => {
                      if (word.char_type_name === "end") {
                        return (
                          <AyahEndMarker
                            key={word.id}
                            digits={word.qpc_uthmani_hafs || word.text_uthmani}
                            ariaLabel={`Ayah ${verse.verse_number}`}
                          />
                        )
                      }

                      return (
                        <ArabicWord
                          key={word.id}
                          word={word}
                          verseKey={verse.verse_key}
                          disableTooltip={true}
                          onWordClick={handleWordClick}
                        />
                      )
                    })}
                  </div>
                ))
              )}
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
