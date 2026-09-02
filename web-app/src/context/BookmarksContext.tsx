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
import { useRemoteSet } from "@/hooks/useRemoteSet"

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

async function addBookmarkKey(verseKey: string): Promise<void> {
  const res = await fetch("/api/account/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verseKey }),
  })
  if (!res.ok) throw new Error(`Bookmark toggle failed: ${res.status}`)
}

async function deleteBookmarkKey(verseKey: string): Promise<void> {
  const res = await fetch(
    `/api/account/bookmarks?verseKey=${encodeURIComponent(verseKey)}`,
    { method: "DELETE" },
  )
  if (!res.ok) throw new Error(`Bookmark toggle failed: ${res.status}`)
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const fetchCallback = useCallback(() => fetchBookmarkKeys(), [])
  const addCallback = useCallback((key: string) => addBookmarkKey(key), [])
  const deleteCallback = useCallback((key: string) => deleteBookmarkKey(key), [])

  const remote = useRemoteSet({
    fetchKeys: fetchCallback,
    onAdd: addCallback,
    onDelete: deleteCallback,
  })

  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [collectionsUserId, setCollectionsUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setCollections([])
      setCollectionsUserId(null)
      return
    }

    fetchCollections().then((cols) => {
      if (!cancelled) {
        setCollections(cols)
        setCollectionsUserId(userId)
      }
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const effectiveCollections =
    userId && collectionsUserId === userId ? collections : EMPTY_COLLECTIONS

  const saveTo = useCallback(
    async (verseKey: string, collectionId: string | null) => {
      if (!remote.keys || remote.isPending(verseKey)) return false
      const wasSaved = remote.has(verseKey)

      remote.setKeysDirect((prev) => new Set(prev ?? []).add(verseKey))

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
          remote.setKeysDirect((prev) => {
            const next = new Set(prev ?? [])
            next.delete(verseKey)
            return next
          })
        }
        return false
      }
    },
    [remote],
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

  const refreshAll = useCallback(async () => {
    await remote.refresh()
    if (userId) {
      const cols = await fetchCollections()
      setCollections(cols)
      setCollectionsUserId(userId)
    }
  }, [remote, userId])

  const value = useMemo(
    () => ({
      loaded: remote.loaded,
      collections: effectiveCollections,
      isBookmarked: remote.has,
      isPending: remote.isPending,
      toggle: remote.toggle,
      saveTo,
      createCollection,
      refresh: refreshAll,
    }),
    [
      remote.loaded,
      effectiveCollections,
      remote.has,
      remote.isPending,
      remote.toggle,
      saveTo,
      createCollection,
      refreshAll,
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

