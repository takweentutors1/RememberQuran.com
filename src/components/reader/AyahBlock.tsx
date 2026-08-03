"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Copy, Share2, Check, ScrollText, ImageIcon } from "lucide-react"
import type { Verse } from "@/types/quran"
import type { DisplayMode } from "@/context/ReaderSettingsContext"
import { PlayAyahButton } from "@/components/audio/PlayAyahButton"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { hasAsbab } from "@/lib/asbabIndex"
import { useHighlightedWord } from "@/lib/playbackStore"
import { ArabicLine } from "./ArabicLine"
import { BookmarkButton } from "./BookmarkButton"
import { NoteButton } from "./NoteButton"
import { HifzButton } from "./HifzButton"
import { AyahNumber } from "./AyahNumber"
import { TranslationBlock } from "./TranslationBlock"
import { HideableArabic } from "./HideableArabic"
import { cn } from "@/lib/utils"

interface AyahBlockProps {
  verse: Verse
  displayMode: DisplayMode
  activeTranslationIds: number[]
  showTranslation: boolean
  isTarget?: boolean
}

const metaBtn = cn(
  "icon-press flex size-7 items-center justify-center rounded-md",
  "text-muted-foreground/70 hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
  "disabled:opacity-30 disabled:pointer-events-none",
)

export function AyahBlock({
  verse,
  displayMode,
  activeTranslationIds,
  showTranslation,
  isTarget = false,
}: AyahBlockProps) {
  const [copied, setCopied] = useState(false)
  const { openTafsir, openAsbab } = useStudyPanel()
  const chapterId = Number(verse.verse_key.split(":")[0])
  // Null for every verse except the one being recited — no re-renders while idle
  const highlightedPosition = useHighlightedWord(verse.verse_key)

  const activeTranslations = verse.translations.filter((t) =>
    activeTranslationIds.includes(t.resource_id),
  )

  function copyAyah() {
    const arabic = verse.text_uthmani
    const trans = activeTranslations.map((t) => t.text).join("\n\n")
    const ref = `[${verse.verse_key}]`
    navigator.clipboard
      .writeText([arabic, trans, ref].filter(Boolean).join("\n\n"))
      .catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function shareAyah() {
    const [surahId, ayahId] = verse.verse_key.split(":")
    const url = `${window.location.origin}/${surahId}/${ayahId}`
    if (navigator.share) {
      await navigator.share({ url, title: `Quran ${verse.verse_key}` }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  /* Reading mode is handled by ReadingModeView — this is verse-by-verse only */
  if (displayMode === "reading") {
    return (
      <div
        id={`ayah-${verse.verse_number}`}
        data-verse-key={verse.verse_key}
        className={cn(
          "scroll-mt-28 py-1 transition-colors duration-[1500ms]",
          isTarget && "bg-primary/5",
        )}
      >
        <ArabicLine
          words={verse.words}
          showEndGlyph
          highlightedPosition={highlightedPosition}
          verseKey={verse.verse_key}
        />
      </div>
    )
  }

  return (
    <div
      id={`ayah-${verse.verse_number}`}
      data-slot="study-panel"
      data-verse-key={verse.verse_key}
      className={cn(
        "group scroll-mt-28 px-1 py-7 transition-colors duration-[1500ms]",
        isTarget && "bg-primary/5",
      )}
    >
      {/* Meta bar — quran.com TranslationView TopActions pattern */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <AyahNumber number={verse.verse_number} isTarget={isTarget} />
          <div className="ayah-actions flex items-center gap-1">
            <PlayAyahButton
              chapterId={chapterId}
              verseNumber={verse.verse_number}
              verseKey={verse.verse_key}
              className={metaBtn}
            />
            <button
              type="button"
              title="Tafsir"
              onClick={() => openTafsir(verse.verse_key)}
              className={metaBtn}
            >
              <BookOpen className="size-3.5" strokeWidth={1.75} />
            </button>
            {/* Only covered ayahs show this icon — presence signals availability,
                so the ~5,800 uncovered ayahs stay uncluttered */}
            {hasAsbab(verse.verse_key) && (
              <button
                type="button"
                title="Reason for revelation"
                onClick={() => openAsbab(verse.verse_key)}
                className={metaBtn}
              >
                <ScrollText className="size-3.5" strokeWidth={1.75} />
              </button>
            )}
            <BookmarkButton
              verseKey={verse.verse_key}
              className={metaBtn}
              iconClassName="size-3.5"
            />
            <NoteButton
              verseKey={verse.verse_key}
              className={metaBtn}
              iconClassName="size-3.5"
            />
            <HifzButton
              verseKey={verse.verse_key}
              className={metaBtn}
              iconClassName="size-3.5"
            />
          </div>
        </div>
        <div className="ayah-actions flex items-center gap-0.5">
          <button
            type="button"
            title={copied ? "Copied!" : "Copy ayah"}
            onClick={copyAyah}
            className={cn(metaBtn, copied && "text-primary")}
          >
            {copied ? (
              <Check className="size-3.5" strokeWidth={2} />
            ) : (
              <Copy className="size-3.5" strokeWidth={1.75} />
            )}
          </button>
          <button type="button" title="Share" onClick={shareAyah} className={metaBtn}>
            <Share2 className="size-3.5" strokeWidth={1.75} />
          </button>
          <Link
            href={`/media-maker?verse=${encodeURIComponent(verse.verse_key)}`}
            title="Create ayah card"
            aria-label={`Create image card for ${verse.verse_key}`}
            className={metaBtn}
          >
            <ImageIcon className="size-3.5" strokeWidth={1.75} />
          </Link>
        </div>
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
