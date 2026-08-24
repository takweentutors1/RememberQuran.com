"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Copy, Share2, Check, ScrollText, ImageIcon } from "lucide-react"
import type { Verse } from "@/types/quran"
import { PlayAyahButton } from "@/components/audio/PlayAyahButton"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { hasAsbab } from "@/lib/asbabIndex"
import { useHighlightedWord, useIsVerseDimmed } from "@/lib/playbackStore"
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
  activeTranslationIds,
  showTranslation,
  isTarget = false,
}: AyahBlockProps) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const { openTafsir, openAsbab } = useStudyPanel()
  const chapterId = Number(verse.verse_key.split(":")[0])
  // Null for every verse except the one being recited — no re-renders while idle
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const dimmed = useIsVerseDimmed(verse.verse_key)

  const activeTranslations = verse.translations.filter((t) =>
    activeTranslationIds.includes(t.resource_id),
  )

  async function copyAyah() {
    const arabic = verse.text_uthmani
    const trans = activeTranslations.map((t) => t.text).join("\n\n")
    const ref = `[${verse.verse_key}]`
    try {
      await navigator.clipboard.writeText(
        [arabic, trans, ref].filter(Boolean).join("\n\n"),
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  async function shareAyah() {
    const [surahId, ayahId] = verse.verse_key.split(":")
    const url = `${window.location.origin}/${surahId}/${ayahId}`
    if (navigator.share) {
      await navigator.share({ url, title: `Quran ${verse.verse_key}` }).catch(() => {})
      return
    }
    // No native share sheet (most desktop browsers) — fall back to copying
    // the link, with the same visual confirmation as the Copy button so the
    // user isn't left wondering whether the click did anything.
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    } catch {}
  }

  return (
    <div
      id={`ayah-${verse.verse_number}`}
      data-slot="study-panel"
      data-verse-key={verse.verse_key}
      className={cn(
        "group scroll-mt-28 px-1 py-7 transition-[background-color,opacity] duration-[1500ms]",
        isTarget && "bg-primary/5",
        dimmed && "opacity-60",
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
              className={cn(metaBtn, "w-auto px-2.5 gap-1.5")}
            >
              <BookOpen className="size-3.5" strokeWidth={1.75} />
              <span className="text-xs font-medium">Tafsir</span>
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
          <button
            type="button"
            title={shared ? "Link copied!" : "Share"}
            onClick={shareAyah}
            className={cn(metaBtn, shared && "text-primary")}
          >
            {shared ? (
              <Check className="size-3.5" strokeWidth={2} />
            ) : (
              <Share2 className="size-3.5" strokeWidth={1.75} />
            )}
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
