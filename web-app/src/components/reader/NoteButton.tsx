"use client"

import { useState } from "react"
import { NotebookPen } from "lucide-react"
import { useSession } from "next-auth/react"
import { NoteEditor } from "@/components/account/NoteEditor"
import { useNotes } from "@/context/NotesContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { cn } from "@/lib/utils"

interface NoteButtonProps {
  verseKey: string
  className?: string
  iconClassName?: string
  /** Optional sheet title e.g. surah name · verse key */
  editorTitle?: string
}

/**
 * Opens the note editor for one ayah. Guests get the soft-gate; signed-in
 * users see a filled notebook icon when a note already exists.
 */
export function NoteButton({
  verseKey,
  className,
  iconClassName,
  editorTitle,
}: NoteButtonProps) {
  const { data: session, status } = useSession()
  const { requireAuth } = useSoftGate()
  const { loaded, hasNote } = useNotes()
  const [open, setOpen] = useState(false)

  const saved = hasNote(verseKey)
  const signedIn = Boolean(session?.user)
  const waitingForKeys = signedIn && !loaded

  function handleClick() {
    if (status === "loading" || waitingForKeys) return
    if (!session?.user) {
      requireAuth("note")
      return
    }
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        title={saved ? "Edit note" : "Add note"}
        aria-label={saved ? `Edit note for ${verseKey}` : `Add note for ${verseKey}`}
        aria-pressed={saved}
        disabled={waitingForKeys}
        onClick={handleClick}
        className={cn(className, saved && "text-primary hover:text-primary")}
      >
        <NotebookPen
          className={iconClassName}
          strokeWidth={1.75}
          fill={saved ? "currentColor" : "none"}
        />
      </button>

      {signedIn && open && (
        <NoteEditor
          open={open}
          onOpenChange={setOpen}
          verseKey={verseKey}
          title={editorTitle ?? verseKey}
        />
      )}
    </>
  )
}
