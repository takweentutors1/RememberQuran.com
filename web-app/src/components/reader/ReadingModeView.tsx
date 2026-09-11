"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import type { Verse, Word, Chapter } from "@/types/quran"
import { useChapters } from "@/context/ChaptersContext"
import { useHighlightedWord } from "@/lib/playbackStore"
import { useQcfPageFont } from "@/hooks/useQcfPageFont"
import { ArabicWord } from "./ArabicWord"
import { AyahEndMarker } from "./AyahEndMarker"
import { HideableArabic } from "./HideableArabic"
import { MushafPageFrame } from "./MushafPageFrame"
import { QcfLine } from "./QcfLine"
import { SurahHeaderCartouche } from "./SurahHeaderCartouche"
import { BismillahHeader } from "./BismillahHeader"
import { WordStudyRibbon } from "./WordStudyRibbon"
import { ReadingAyahToolbar } from "./ReadingAyahToolbar"
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
  onAyahClick?: (verse: Verse) => void
  qcfFontFamily?: string | null
}

/** One verse span in continuous Arabic flow */
function ReadingVerse({ verse, isTarget, onWordClick, onAyahClick, qcfFontFamily }: ReadingVerseProps) {
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
      <span id={`ayah-${verse.verse_key.replace(":", "-")}`} data-verse-key={verse.verse_key} className="inline">
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
                disableTooltip={false}
                onWordClick={onWordClick}
                qcfFontFamily={qcfFontFamily}
              />
              {endWord ? (
                <AyahEndMarker
                  digits={endWord.qpc_uthmani_hafs || endWord.text_uthmani}
                  ariaLabel={`Ayah ${verse.verse_number}`}
                  onClick={() => onAyahClick?.(verse)}
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

/** One word within a standard 15-line page — its own component so the
 * per-verse highlight hook can be called correctly even though neighbouring
 * words on the same printed line can belong to different verses. */
function LineWord({
  word,
  verse,
  targetAyahId,
  onWordClick,
  onAyahClick,
  attachedEndMarker,
  qcfFontFamily,
}: {
  word: Word
  verse: Verse
  targetAyahId?: number
  onWordClick: (word: Word, verseKey?: string) => void
  onAyahClick: (verse: Verse) => void
  attachedEndMarker?: Word | null
  qcfFontFamily?: string | null
}) {
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const isFirstWordOfAyah =
    word.position === 1 || (verse.words && verse.words[0]?.id === word.id)

  if (word.char_type_name === "end") {
    // If rendered standalone (fallback)
    return (
      <span
        id={!isFirstWordOfAyah ? `ayah-marker-${verse.verse_key.replace(":", "-")}` : undefined}
        className="inline-flex shrink-0 items-center select-none"
      >
        <AyahEndMarker
          digits={word.qpc_uthmani_hafs || word.text_uthmani}
          ariaLabel={`Ayah ${verse.verse_number}`}
          onClick={() => onAyahClick(verse)}
        />
      </span>
    )
  }

  return (
    <span
      id={isFirstWordOfAyah ? `ayah-${verse.verse_key.replace(":", "-")}` : undefined}
      data-verse-key={verse.verse_key}
      className={cn(
        qcfFontFamily
          ? "inline shrink-0"
          : "inline-flex items-center gap-0.5 sm:gap-1 shrink-0",
        targetAyahId === verse.verse_number && "rounded-xs bg-primary/10",
      )}
    >
      <ArabicWord
        word={word}
        verseKey={verse.verse_key}
        isHighlighted={highlightedPosition === word.position}
        disableTooltip={false}
        onWordClick={onWordClick}
        qcfFontFamily={qcfFontFamily}
      />
      {attachedEndMarker && (
        <span
          id={`ayah-marker-${verse.verse_key.replace(":", "-")}`}
          className="inline-flex shrink-0 items-center select-none"
        >
          <AyahEndMarker
            digits={attachedEndMarker.qpc_uthmani_hafs || attachedEndMarker.text_uthmani}
            ariaLabel={`Ayah ${verse.verse_number}`}
            onClick={() => onAyahClick(verse)}
          />
        </span>
      )}
    </span>
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

interface MushafPage {
  pageNumber: number
  verses: Verse[]
  hasSurahStart: boolean
  juzNumber?: number
  hizbNumber?: number
  lines: { lineNumber: number; words: { word: Word; verse: Verse }[] }[]
}

/** One printed Mushaf page — its own component so useQcfPageFont can load
 * that page's glyph font independently as it scrolls into view. */
function ReadingPage({
  page,
  prevPage,
  chapter,
  chaptersById,
  targetAyahId,
  onWordClick,
  onAyahClick,
}: {
  page: MushafPage
  prevPage: MushafPage | null
  chapter?: Chapter
  chaptersById: Map<number, Chapter>
  targetAyahId?: number
  onWordClick: (word: Word, verseKey?: string) => void
  onAyahClick: (verse: Verse) => void
}) {
  // A surah can span dozens of Mushaf pages — only fetch this page's font
  // once it's actually near the viewport, not the moment it mounts, so
  // scrolling through a long surah (or one pulled in by infinite scroll)
  // doesn't kick off font requests for every page at once.
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || isNearViewport) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsNearViewport(true)
          observer.disconnect()
        }
      },
      { rootMargin: "600px 0px 600px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isNearViewport])

  // Falls back to the Unicode qpc_uthmani_hafs/text_uthmani rendering
  // already in ArabicWord/AyahEndMarker until this page's font resolves.
  const qcfFontFamily = useQcfPageFont(page.pageNumber, isNearViewport)

  const isNewJuz = !!prevPage && page.juzNumber !== prevPage.juzNumber
  const isNewHizb = !isNewJuz && !!prevPage && page.hizbNumber !== prevPage.hizbNumber

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

  // The real Madani mushaf's page header names whichever surah opens
  // the page — not necessarily the surah this route was loaded for,
  // since a short surah's neighbor can share the page.
  const pageLeadSurahId = Number(page.verses[0]?.verse_key.split(":")[0])
  const pageHeaderChapter = chaptersById.get(pageLeadSurahId) ?? chapter

  return (
    <div ref={containerRef}>
      <MushafPageFrame
        pageNumber={page.pageNumber}
        juzNumber={page.juzNumber}
        surahNameArabic={pageHeaderChapter?.name_arabic}
        marginBadges={marginBadges}
      >
        {/* Surah Title Cartouche (Unwan) when Surah begins on this page.
            Only for the centered opening pages (Fatihah / early Baqarah) —
            those are always single-surah. Every other page's surah-start
            cartouche is rendered inline, right before its own line, since
            a shared page can start a surah mid-page. */}
        {isCenteredOpeningPage && page.hasSurahStart && pageHeaderChapter && (
          <div className="w-full mb-3">
            <SurahHeaderCartouche chapter={pageHeaderChapter} />
            {/* For Surahs with bismillah_pre (Surahs 2-114 except 9) */}
            {pageHeaderChapter.bismillah_pre && <BismillahHeader />}
          </div>
        )}

        {/* 15-Line Madani Standard Grid or Centered Opening Page */}
        <div
          dir="rtl"
          lang="ar"
          className={cn(
            "quran-arabic font-uthmani select-text w-full reading-mode-text",
            "text-reader-ink",
            isCenteredOpeningPage
              ? "flex flex-col items-center justify-center space-y-2 py-1 text-center leading-[2.0]"
              : page.hasSurahStart
                ? "flex flex-col gap-1 sm:gap-2 md:gap-2.5 py-0.5"
                : "flex flex-col justify-between min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[660px] py-0.5",
          )}
        >
          {isCenteredOpeningPage ? (
            // Opening pages (Fatihah / Baqarah 1-5): Continuous centered calligraphic flow
            page.verses.map((verse) => (
              <div key={verse.id} className="w-full text-center">
                <ReadingVerse
                  verse={verse}
                  isTarget={targetAyahId === verse.verse_number}
                  onWordClick={onWordClick}
                  onAyahClick={onAyahClick}
                  qcfFontFamily={qcfFontFamily}
                />
              </div>
            ))
          ) : (
            // Standard 15-Line Madani Page: Exact line-by-line justified rendering
            page.lines.map(({ lineNumber, words }, index) => {
              const isLastLine = index === page.lines.length - 1
              const isShortLastLine = isLastLine && words.length <= 5

              // A new surah always opens on a fresh printed line — never
              // mid-line — so this is enough to catch every surah start
              // on a shared page, not just the one this route loaded.
              const surahStart = words.find(
                ({ word, verse }) => verse.verse_number === 1 && word.position === 1,
              )
              const startingChapter = surahStart
                ? chaptersById.get(Number(surahStart.verse.verse_key.split(":")[0]))
                : null

              // Pre-process words for this printed line: pair end-of-ayah marker with its preceding word
              const lineItems: { word: Word; verse: Verse; attachedEndMarker?: Word | null }[] = []
              for (let wIdx = 0; wIdx < words.length; wIdx++) {
                const current = words[wIdx]
                if (current.word.char_type_name === "end") {
                  // If there is a preceding word, attach to it
                  if (lineItems.length > 0 && !lineItems[lineItems.length - 1].attachedEndMarker) {
                    lineItems[lineItems.length - 1].attachedEndMarker = current.word
                  } else {
                    // Edge-case: line opens directly with an end marker
                    lineItems.push({ word: current.word, verse: current.verse })
                  }
                } else {
                  lineItems.push({ word: current.word, verse: current.verse })
                }
              }

              const isDenseLine = lineItems.length >= 10
              const isVeryDense = lineItems.length >= 12

              return (
                <Fragment key={lineNumber}>
                  {startingChapter && (
                    <div className="w-full mb-3">
                      <SurahHeaderCartouche chapter={startingChapter} />
                      {startingChapter.bismillah_pre && <BismillahHeader />}
                    </div>
                  )}
                  {qcfFontFamily ? (
                    // Real QCF glyphs already encode each word's exact advance
                    // width/kashida for this printed line. QcfLine measures
                    // the natural width and scales it to fit the page exactly
                    // — flush both edges, at any container width, without
                    // clipping a single glyph.
                    <QcfLine data-line-number={lineNumber} className="w-full leading-none">
                      {lineItems.map(({ word, verse, attachedEndMarker }) => (
                        <LineWord
                          key={word.id}
                          word={word}
                          verse={verse}
                          targetAyahId={targetAyahId}
                          onWordClick={onWordClick}
                          onAyahClick={onAyahClick}
                          attachedEndMarker={attachedEndMarker}
                          qcfFontFamily={qcfFontFamily}
                        />
                      ))}
                    </QcfLine>
                  ) : (
                    <div
                      data-line-number={lineNumber}
                      className={cn(
                        "w-full leading-none flex items-center flex-nowrap",
                        isVeryDense
                          ? "text-[0.88em]"
                          : isDenseLine
                            ? "text-[0.93em]"
                            : "text-[1em]",
                        isShortLastLine
                          ? "justify-center gap-2 sm:gap-3.5 md:gap-5"
                          : "justify-between",
                      )}
                    >
                      {lineItems.map(({ word, verse, attachedEndMarker }) => (
                        <LineWord
                          key={word.id}
                          word={word}
                          verse={verse}
                          targetAyahId={targetAyahId}
                          onWordClick={onWordClick}
                          onAyahClick={onAyahClick}
                          attachedEndMarker={attachedEndMarker}
                          qcfFontFamily={qcfFontFamily}
                        />
                      ))}
                    </div>
                  )}
                </Fragment>
              )
            })
          )}
        </div>
      </MushafPageFrame>
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
 * - Context Toolbar on Ayah End Marker interaction
 */
export function ReadingModeView({ verses, targetAyahId, chapter }: ReadingModeViewProps) {
  const [selectedWord, setSelectedWord] = useState<{ word: Word; verseKey?: string } | null>(null)
  const [selectedAyah, setSelectedAyah] = useState<Verse | null>(null)
  const chapters = useChapters()
  const chaptersById = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters])

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
    setSelectedAyah(null)
    setSelectedWord({ word, verseKey })
  }

  function handleAyahClick(verse: Verse) {
    setSelectedWord(null)
    setSelectedAyah(verse)
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      {pages.map((page, pIndex) => (
        <ReadingPage
          key={page.pageNumber}
          page={page}
          prevPage={pIndex > 0 ? pages[pIndex - 1] : null}
          chapter={chapter}
          chaptersById={chaptersById}
          targetAyahId={targetAyahId}
          onWordClick={handleWordClick}
          onAyahClick={handleAyahClick}
        />
      ))}

      {/* Docked Ayah Action Toolbar when Ayah marker is clicked */}
      <ReadingAyahToolbar
        verse={selectedAyah}
        onClose={() => setSelectedAyah(null)}
      />
    </div>
  )
}
