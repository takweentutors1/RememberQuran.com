"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Play,
  ScrollText,
  Bookmark,
  StickyNote,
  Sparkles,
  Copy,
  Share2,
  Check,
  ImageIcon,
  X,
} from "lucide-react"
import type { Verse } from "@/types/quran"
import { useSession } from "next-auth/react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { useBookmarks } from "@/context/BookmarksContext"
import { useHifz } from "@/context/HifzContext"
import { useNotes } from "@/context/NotesContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { NoteEditor } from "@/components/account/NoteEditor"
import { hasAsbab } from "@/lib/asbabIndex"
import { cn } from "@/lib/utils"

interface ReadingAyahToolbarProps {
  verse: Verse | null
  onClose: () => void
}

export function ReadingAyahToolbar({ verse, onClose }: ReadingAyahToolbarProps) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  const { data: session } = useSession()
  const { requireAuth } = useSoftGate()
  const player = useAudioPlayer()
  const { openTafsir, openAsbab } = useStudyPanel()
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks()
  const { isMemorised, toggle: toggleHifz } = useHifz()
  const { hasNote } = useNotes()

  if (!verse) return null

  const chapterId = Number(verse.verse_key.split(":")[0])
  const bookmarked = isBookmarked(verse.verse_key)
  const memorised = isMemorised(verse.verse_key)

  async function copyAyah() {
    if (!verse) return
    const arabic = verse.text_uthmani
    const ref = `[${verse.verse_key}]`
    try {
      await navigator.clipboard.writeText(`${arabic}\n\n${ref}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  async function shareAyah() {
    if (!verse) return
    const [surahId, ayahId] = verse.verse_key.split(":")
    const url = `${window.location.origin}/${surahId}/${ayahId}`
    if (navigator.share) {
      await navigator.share({ url, title: `Quran ${verse.verse_key}` }).catch(() => {})
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    } catch {}
  }

  return (
    <div
      role="dialog"
      aria-label={`Ayah ${verse.verse_key} options`}
      className={cn(
        "fixed inset-x-3 bottom-24 z-50 mx-auto max-w-xl rounded-2xl",
        "border border-border/80 bg-background/95 p-3.5 shadow-2xl backdrop-blur-md",
        "animate-in slide-in-from-bottom-5 fade-in duration-200 ease-out",
        "md:bottom-6",
      )}
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {verse.verse_number}
          </span>
          <span className="text-sm font-medium text-foreground">
            Ayah {verse.verse_key}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ayah options"
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        {/* Audio play */}
        <button
          type="button"
          onClick={() => {
            player.playVerse(chapterId, verse.verse_number)
          }}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Play className="size-3.5" fill="currentColor" />
          <span>Play</span>
        </button>

        {/* Tafsir */}
        <button
          type="button"
          onClick={() => {
            openTafsir(verse.verse_key)
            onClose()
          }}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <BookOpen className="size-3.5" />
          <span>Tafsir</span>
        </button>

        {/* Asbab Nuzul */}
        {hasAsbab(verse.verse_key) && (
          <button
            type="button"
            onClick={() => {
              openAsbab(verse.verse_key)
              onClose()
            }}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ScrollText className="size-3.5" />
            <span>Asbab</span>
          </button>
        )}

        {/* Bookmark */}
        <button
          type="button"
          onClick={() => toggleBookmark(verse.verse_key)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
            bookmarked
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Bookmark className="size-3.5" fill={bookmarked ? "currentColor" : "none"} />
          <span>{bookmarked ? "Saved" : "Save"}</span>
        </button>

        {/* Hifz */}
        <button
          type="button"
          onClick={() => toggleHifz(verse.verse_key)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
            memorised
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Sparkles className="size-3.5" />
          <span>{memorised ? "Memorised" : "Hifz"}</span>
        </button>

        {/* Note */}
        <button
          type="button"
          onClick={() => {
            if (!session?.user) {
              requireAuth("note")
              return
            }
            setNoteOpen(true)
          }}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
            hasNote(verse.verse_key)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <StickyNote className="size-3.5" fill={hasNote(verse.verse_key) ? "currentColor" : "none"} />
          <span>{hasNote(verse.verse_key) ? "Note" : "Note"}</span>
        </button>

        {/* Copy */}
        <button
          type="button"
          onClick={copyAyah}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            copied && "text-primary",
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={shareAyah}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            shared && "text-primary",
          )}
        >
          {shared ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
        </button>

        {/* Card */}
        <Link
          href={`/media-maker?verse=${encodeURIComponent(verse.verse_key)}`}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ImageIcon className="size-3.5" />
        </Link>
      </div>

      {session?.user && noteOpen && (
        <NoteEditor
          open={noteOpen}
          onOpenChange={setNoteOpen}
          verseKey={verse.verse_key}
          title={`Ayah ${verse.verse_key}`}
        />
      )}
    </div>
  )
}
