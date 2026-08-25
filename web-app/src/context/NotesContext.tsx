"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"

interface NoteEntry {
  verseKey: string
}

interface NotesContextValue {
  /** True once the signed-in user's note keys have loaded */
  loaded: boolean
  hasNote: (verseKey: string) => boolean
  /** Re-sync reader icons after editor / account mutations */
  refresh: () => Promise<void>
  /** Optimistically mark a verse as having / not having a note */
  setHasNote: (verseKey: string, present: boolean) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

async function fetchNoteKeys(): Promise<Set<string>> {
  const res = await fetch("/api/account/notes")
  if (!res.ok) return new Set()
  const data = (await res.json()) as { notes?: NoteEntry[] }
  return new Set((data.notes ?? []).map((n) => n.verseKey))
}

/**
 * One GET per session holds every verseKey that has a note (2000 cap), so
 * ayah icons render without N+1. Cleared on logout / account switch.
 */
export function NotesProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const [keys, setKeys] = useState<Set<string> | null>(null)
  const [keysUserId, setKeysUserId] = useState<string | null>(null)

  const effectiveKeys =
    userId && keysUserId === userId ? keys : null

  useEffect(() => {
    let cancelled = false
    const fetchFor = userId

    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setKeys(null)
        setKeysUserId(null)
        if (!fetchFor) return
        return fetchNoteKeys()
      })
      .then((newKeys) => {
        if (cancelled || !newKeys || !fetchFor) return
        setKeys(newKeys)
        setKeysUserId(fetchFor)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const newKeys = await fetchNoteKeys()
      setKeys(newKeys)
      setKeysUserId(userId)
    } catch {
      // Reader stays usable — icons may be stale until next refresh
    }
  }, [userId])

  const hasNote = useCallback(
    (verseKey: string) => effectiveKeys?.has(verseKey) ?? false,
    [effectiveKeys],
  )

  const setHasNote = useCallback((verseKey: string, present: boolean) => {
    setKeys((prev) => {
      const next = new Set(prev ?? [])
      if (present) next.add(verseKey)
      else next.delete(verseKey)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      loaded: effectiveKeys !== null,
      hasNote,
      refresh,
      setHasNote,
    }),
    [effectiveKeys, hasNote, refresh, setHasNote],
  )

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error("useNotes must be used within NotesProvider")
  return ctx
}
