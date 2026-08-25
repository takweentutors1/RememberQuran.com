"use client"

import { useState } from "react"
import Link from "next/link"
import { NotebookPen, Pencil, Trash2 } from "lucide-react"
import { NoteEditor, type NoteDto } from "@/components/account/NoteEditor"
import { useNotes } from "@/context/NotesContext"
import { cn } from "@/lib/utils"

export interface AccountNoteDto {
  verseKey: string
  surahId: number
  ayahId: number
  text: string
  surahName: string
  surahArabic: string
  updatedAt: string
  createdAt: string
}

const iconBtn = cn(
  "flex size-7 items-center justify-center rounded-md",
  "text-muted-foreground/60 transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-30",
)

function preview(text: string, max = 120): string {
  const oneLine = text.replace(/\s+/g, " ").trim()
  if (oneLine.length <= max) return oneLine
  return `${oneLine.slice(0, max).trimEnd()}…`
}

function formatUpdated(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function NotesView({ initialNotes }: { initialNotes: AccountNoteDto[] }) {
  const { refresh } = useNotes()
  const [notes, setNotes] = useState(initialNotes)
  const [error, setError] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [editing, setEditing] = useState<AccountNoteDto | null>(null)

  async function remove(note: AccountNoteDto) {
    if (busyKey) return
    if (!window.confirm("Delete this note?")) return

    setError(null)
    setBusyKey(note.verseKey)
    try {
      const res = await fetch(
        `/api/account/notes?verseKey=${encodeURIComponent(note.verseKey)}`,
        { method: "DELETE" },
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "Couldn’t delete the note.")
        return
      }
      setNotes((prev) => prev.filter((n) => n.verseKey !== note.verseKey))
      void refresh()
    } catch {
      setError("Couldn’t delete the note.")
    } finally {
      setBusyKey(null)
    }
  }

  function handleSaved(saved: NoteDto | null) {
    if (!editing) return
    const key = editing.verseKey

    if (!saved) {
      setNotes((prev) => prev.filter((n) => n.verseKey !== key))
      setEditing(null)
      return
    }

    setNotes((prev) => {
      const next = prev.map((n) =>
        n.verseKey === key
          ? {
              ...n,
              text: saved.text,
              updatedAt: saved.updatedAt ?? n.updatedAt,
              createdAt: saved.createdAt ?? n.createdAt,
            }
          : n,
      )
      return next.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
    })
    setEditing(null)
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
        <NotebookPen
          className="mx-auto size-5 text-muted-foreground"
          strokeWidth={1.75}
        />
        <p className="mt-3 text-sm text-foreground">No notes yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the notebook icon while reading to save a private note on any ayah.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <ul className="divide-y divide-border border-y border-border">
        {notes.map((note) => (
          <li key={note.verseKey} className="flex items-start gap-3 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link
                  href={`/${note.surahId}/${note.ayahId}`}
                  className="text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {note.surahName} · {note.verseKey}
                </Link>
                {note.surahArabic && (
                  <span
                    className="font-arabic text-sm text-muted-foreground"
                    dir="rtl"
                    lang="ar"
                  >
                    {note.surahArabic}
                  </span>
                )}
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">
                {preview(note.text)}
              </p>
              {note.updatedAt && (
                <p className="mt-1.5 text-xs text-muted-foreground/80">
                  Updated {formatUpdated(note.updatedAt)}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                title="Edit note"
                aria-label={`Edit note for ${note.verseKey}`}
                className={iconBtn}
                disabled={busyKey === note.verseKey}
                onClick={() => setEditing(note)}
              >
                <Pencil className="size-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                title="Delete note"
                aria-label={`Delete note for ${note.verseKey}`}
                className={iconBtn}
                disabled={busyKey === note.verseKey}
                onClick={() => void remove(note)}
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <NoteEditor
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          verseKey={editing.verseKey}
          title={`${editing.surahName} · ${editing.verseKey}`}
          initialText={editing.text}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
