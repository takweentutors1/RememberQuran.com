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
            <span key={word.id} className={endWord ? "whitespace-nowrap" : undefined}>
              <ArabicWord
                word={word}
                isHighlighted={highlightedPosition === word.position}
                verseKey={verse.verse_key}
                disableTooltip={true}
                onWordClick={onWordClick}
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
 * Authentic Printed Quran (Mushaf) Reading Mode
 * Features true page-by-page grouping, gold-ruled illuminated borders (Tazhib),
 * top page headers (Surah & Juz), bottom page medallions, Surah title cartouches (Unwan),
 * calligraphic Basmalah, and non-intrusive bottom-docked word study ribbon.
 */
export function ReadingModeView({ verses, targetAyahId, chapter }: ReadingModeViewProps) {
  const [selectedWord, setSelectedWord] = useState<{ word: Word; verseKey?: string } | null>(null)

  // Group verses into authentic printed Mushaf pages
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

      return {
        pageNumber,
        verses: pageVerses,
        hasSurahStart,
        juzNumber,
        hizbNumber,
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

            {/* Authentic Line-by-Line Mushaf Page Rendering (King Fahd Complex 15-line layout) */}
            {(() => {
              // Extract all words across the page in reading order with their verse context
              const pageWordsWithContext: Array<{ word: Word; verse: Verse; isLastInAyah: boolean; endWord: Word | null }> = []

              for (const verse of page.verses) {
                const words = (verse.words ?? []).filter(
                  (w) => w.char_type_name === "word" || w.char_type_name === "end",
                )
                for (let i = 0; i < words.length; i++) {
                  const w = words[i]
                  if (w.char_type_name === "end") continue
                  const isLast = i === words.length - 1
                  const endWord = !isLast && words[i + 1]?.char_type_name === "end" ? words[i + 1] : null
                  pageWordsWithContext.push({
                    word: w,
                    verse,
                    isLastInAyah: isLast,
                    endWord,
                  })
                }
              }

              // Group by line_number if available from QDC
              const lineMap = new Map<number, typeof pageWordsWithContext>()
              let hasLineNumbers = false

              for (const item of pageWordsWithContext) {
                if (item.word.line_number) {
                  hasLineNumbers = true
                  const l = item.word.line_number
                  const list = lineMap.get(l) ?? []
                  list.push(item)
                  lineMap.set(l, list)
                }
              }

              // If line numbers exist (Standard Madinah Mushaf Pages), render line-by-line
              if (hasLineNumbers && lineMap.size > 0) {
                const sortedLines = Array.from(lineMap.entries()).sort(([a], [b]) => a - b)

                return (
                  <div
                    dir="rtl"
                    lang="ar"
                    className="mushaf-lines-container flex flex-col justify-between w-full min-h-[420px] py-1 select-none gap-2 sm:gap-2.5"
                  >
                    {sortedLines.map(([lineNum, lineItems], idx) => {
                      const isFirstLine = idx === 0
                      const isLastLine = idx === sortedLines.length - 1
                      const isPage1 = page.pageNumber === 1

                      return (
                        <div
                          key={`page-${page.pageNumber}-line-${lineNum}`}
                          data-line-number={lineNum}
                          className={cn(
                            "mushaf-line flex items-center w-full leading-[2.2] sm:leading-[2.4]",
                            "quran-arabic font-uthmani text-[1.65rem] sm:text-[1.95rem] md:text-[2.15rem] lg:text-[2.25rem] text-[#22201D] dark:text-[#E8E2D5]",
                            // Symmetrical centering for opening page or end lines; justified stretch for standard lines
                            isPage1 || isLastLine || isFirstLine
                              ? "justify-center text-center gap-1.5 sm:gap-2 flex-wrap"
                              : "justify-between text-justify",
                          )}
                        >
                          {lineItems.map(({ word, verse, isLastInAyah, endWord }) => {
                            const isTarget = targetAyahId === verse.verse_number
                            return (
                              <HideableArabic
                                key={word.id}
                                verseKey={verse.verse_key}
                                compact
                                className={cn("inline-flex items-center", isTarget && "bg-primary/10 rounded-xs")}
                              >
                                <span className={cn("inline-flex items-center", endWord ? "whitespace-nowrap" : undefined)}>
                                  <ArabicWord
                                    word={word}
                                    verseKey={verse.verse_key}
                                    disableTooltip={true}
                                    onWordClick={handleWordClick}
                                  />
                                  {endWord && (
                                    <AyahEndMarker
                                      digits={endWord.qpc_uthmani_hafs || endWord.text_uthmani}
                                      ariaLabel={`Ayah ${verse.verse_number}`}
                                    />
                                  )}
                                </span>
                              </HideableArabic>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )
              }

              // Graceful fallback if lines are not present: continuous book flow
              return (
                <div
                  dir="rtl"
                  lang="ar"
                  className="mushaf-flow quran-arabic font-uthmani text-[1.65rem] sm:text-[1.95rem] md:text-[2.15rem] lg:text-[2.25rem] leading-[2.4] sm:leading-[2.6] text-[#22201D] dark:text-[#E8E2D5]"
                >
                  {page.verses.map((verse, index) => {
                    const prev = index > 0 ? page.verses[index - 1] : null
                    const showInlineJuz = prev && verse.juz_number !== prev.juz_number
                    const showInlineHizb = !showInlineJuz && prev && verse.hizb_number !== prev.hizb_number

                    return (
                      <Fragment key={verse.id}>
                        {showInlineJuz && (
                          <SectionMarker arabicLabel="الجزء" englishLabel="Juz" number={verse.juz_number} emphasized />
                        )}
                        {showInlineHizb && (
                          <SectionMarker arabicLabel="الحزب" englishLabel="Hizb" number={verse.hizb_number} emphasized={false} />
                        )}
                        <ReadingVerse
                          verse={verse}
                          isTarget={targetAyahId === verse.verse_number}
                          onWordClick={handleWordClick}
                        />
                      </Fragment>
                    )
                  })}
                </div>
              )
            })()}
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
