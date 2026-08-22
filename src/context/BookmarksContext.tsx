"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"

interface BookmarkEntry {
  verseKey: string
  collectionId: string
}

export interface CollectionSummary {
  id: string
  name: string
  isDefault: boolean
}

interface BookmarksContextValue {
  /** True once the signed-in user's bookmarks + collections have loaded */
  loaded: boolean
  collections: CollectionSummary[]
  isBookmarked: (verseKey: string) => boolean
  isPending: (verseKey: string) => boolean
  /** Quick toggle: saves to Favourites, or removes if already saved. */
  toggle: (verseKey: string) => Promise<void>
  /** Save (or move, if already saved) an ayah into a specific collection. */
  saveTo: (verseKey: string, collectionId: string | null) => Promise<boolean>
  createCollection: (name: string) => Promise<CollectionSummary | null>
  /** Re-sync reader icons after account-page mutations */
  refresh: () => Promise<void>
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

const EMPTY_COLLECTIONS: CollectionSummary[] = []

async function fetchBookmarkKeys(): Promise<Set<string>> {
  const res = await fetch("/api/account/bookmarks")
  if (!res.ok) return new Set()
  const data = (await res.json()) as { bookmarks?: BookmarkEntry[] }
  return new Set((data.bookmarks ?? []).map((b) => b.verseKey))
}

async function fetchCollections(): Promise<CollectionSummary[]> {
  const res = await fetch("/api/account/collections")
  if (!res.ok) return []
  const data = (await res.json()) as { collections?: CollectionSummary[] }
  return data.collections ?? []
}

/**
 * One GET per session holds every saved verseKey (and the collection list)
 * in memory, so ayah icons — and the "save to…" picker — render instantly
 * with no per-verse or per-open requests.
 *
 * The effect uses Promise.then() chaining so setState is always called
 * inside a microtask callback, never synchronously in the effect body.
 */
export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const [keys, setKeys] = useState<Set<string> | null>(null)
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  /** Which user `keys` belongs to — prevents showing the previous account briefly */
  const [keysUserId, setKeysUserId] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())

  // Only expose keys when they match the signed-in user
  const effectiveKeys =
    userId && keysUserId === userId ? keys : null
  // Stable reference when empty — a `[]` literal here would be a new array
  // every render, defeating the `value` useMemo below.
  const effectiveCollections =
    userId && keysUserId === userId ? collections : EMPTY_COLLECTIONS

  // Synced after every render via useEffect so toggle/saveTo always read the
  // latest value without stale closures — written only in effects, never
  // during render.
  const effectiveKeysRef = useRef<Set<string> | null>(null)
  const pendingRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    effectiveKeysRef.current = effectiveKeys
  })
  useEffect(() => {
    pendingRef.current = pending
  })

  // Effect uses .then() so setState runs in a microtask, not synchronously in
  // the effect body — this is what react-hooks/set-state-in-effect requires.
  useEffect(() => {
    let cancelled = false
    const fetchFor = userId

    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setKeys(null)
        setKeysUserId(null)
        setCollections([])
        setPending(new Set())
        if (!fetchFor) return
        return Promise.all([fetchBookmarkKeys(), fetchCollections()])
      })
      .then((result) => {
        if (cancelled || !result || !fetchFor) return
        const [newKeys, newCollections] = result
        setKeys(newKeys)
        setCollections(newCollections)
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
      const [newKeys, newCollections] = await Promise.all([
        fetchBookmarkKeys(),
        fetchCollections(),
      ])
      setKeys(newKeys)
      setCollections(newCollections)
      setKeysUserId(userId)
    } catch {
      // Reader stays usable — icons show unsaved state until next refresh
    }
  }, [userId])

  const isBookmarked = useCallback(
    (verseKey: string) => effectiveKeys?.has(verseKey) ?? false,
    [effectiveKeys],
  )

  const isPending = useCallback(
    (verseKey: string) => pending.has(verseKey),
    [pending],
  )

  const toggle = useCallback(async (verseKey: string) => {
    // Wait until this user's keys have loaded — otherwise we cannot tell
    // save vs remove and would always POST.
    if (effectiveKeysRef.current === null) return
    if (pendingRef.current.has(verseKey)) return
    const wasSaved = effectiveKeysRef.current.has(verseKey)

    // Optimistic flip — revert on failure, never block reading
    setPending((prev) => new Set(prev).add(verseKey))
    setKeys((prev) => {
      const next = new Set(prev ?? [])
      if (wasSaved) next.delete(verseKey)
      else next.add(verseKey)
      return next
    })

    try {
      const res = wasSaved
        ? await fetch(
            `/api/account/bookmarks?verseKey=${encodeURIComponent(verseKey)}`,
            { method: "DELETE" },
          )
        : await fetch("/api/account/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verseKey }),
          })
      if (!res.ok) throw new Error(`Bookmark toggle failed: ${res.status}`)
    } catch {
      // Revert optimistic update
      setKeys((prev) => {
        const next = new Set(prev ?? [])
        if (wasSaved) next.add(verseKey)
        else next.delete(verseKey)
        return next
      })
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(verseKey)
        return next
      })
    }
  }, [])

  /**
   * Save into a specific collection (the fix for "no way to choose which
   * collection a bookmark goes into" — this is a POST when the ayah isn't
   * saved yet, and a PATCH move when it already is, in either case ending
   * with the ayah filed under `collectionId`).
   */
  const saveTo = useCallback(
    async (verseKey: string, collectionId: string | null) => {
      if (effectiveKeysRef.current === null) return false
      if (pendingRef.current.has(verseKey)) return false
      const wasSaved = effectiveKeysRef.current.has(verseKey)

      setPending((prev) => new Set(prev).add(verseKey))
      setKeys((prev) => new Set(prev ?? []).add(verseKey))

      try {
        const res = wasSaved
          ? await fetch("/api/account/bookmarks", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ verseKey, collectionId }),
            })
          : await fetch("/api/account/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ verseKey, collectionId }),
            })
        if (!res.ok) throw new Error(`Save to collection failed: ${res.status}`)
        return true
      } catch {
        if (!wasSaved) {
          setKeys((prev) => {
            const next = new Set(prev ?? [])
            next.delete(verseKey)
            return next
          })
        }
        return false
      } finally {
        setPending((prev) => {
          const next = new Set(prev)
          next.delete(verseKey)
          return next
        })
      }
    },
    [],
  )

  const createCollection = useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/account/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) return null
      const data = (await res.json()) as { collection?: CollectionSummary }
      if (!data.collection) return null
      setCollections((prev) => [...prev, data.collection!])
      return data.collection
    } catch {
      return null
    }
  }, [])

  const value = useMemo(
    () => ({
      loaded: effectiveKeys !== null,
      collections: effectiveCollections,
      isBookmarked,
      isPending,
      toggle,
      saveTo,
      createCollection,
      refresh,
    }),
    [
      effectiveKeys,
      effectiveCollections,
      isBookmarked,
      isPending,
      toggle,
      saveTo,
      createCollection,
      refresh,
    ],
  )

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider")
  return ctx
}
