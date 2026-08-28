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
              <div className="mb-4">
                <SurahHeaderCartouche chapter={chapter} />
                {/* For Surahs with bismillah_pre (Surahs 2-114 except 9) */}
                {chapter.bismillah_pre && <BismillahHeader />}
                {/* For Surah 1 (Al-Fatihah), Ayah 1 IS the Basmalah */}
                {chapter.id === 1 && (
                  <div className="my-3 sm:my-5 flex flex-col items-center justify-center text-center select-none">
                    <div className="inline-flex items-center gap-2">
                      <p
                        className="quran-arabic text-[1.85rem] sm:text-[2.1rem] md:text-[2.3rem] leading-none text-[#A37F46] dark:text-[#D4AF37] drop-shadow-2xs font-normal"
                        dir="rtl"
                        lang="ar"
                      >
                        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                      </p>
                      {page.verses.find((v) => v.verse_number === 1) && (
                        <AyahEndMarker digits="١" ariaLabel="Ayah 1" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Continuous Arabic text flow within the Mushaf page */}
            <div
              dir="rtl"
              lang="ar"
              className="mushaf-flow quran-arabic font-uthmani text-[1.65rem] sm:text-[1.95rem] md:text-[2.15rem] lg:text-[2.25rem] leading-[2.4] sm:leading-[2.6] text-[#22201D] dark:text-[#E8E2D5]"
            >
              {page.verses
                .filter((verse) => !(chapter?.id === 1 && verse.verse_number === 1))
                .map((verse, index) => {
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
