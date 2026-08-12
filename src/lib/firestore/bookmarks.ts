import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"
import { adjustBookmarkCount, getOrCreateFavourites, getCollection } from "./bookmarkCollections"

export const MAX_BOOKMARKS = 2000

/** Raw Firestore doc shape (before the `verseKey` id is attached). */
export interface Bookmark {
  collectionId: string
  createdAt: Timestamp
}

export interface BookmarkRecord {
  verseKey: string
  collectionId: string
  createdAt: Date
}

function bookmarksRef(userId: string) {
  return getDb()
    .collection("users")
    .doc(userId)
    .collection("bookmarks") as FirebaseFirestore.CollectionReference<Bookmark>
}

function fromSnapshot(
  snap: FirebaseFirestore.QueryDocumentSnapshot<Bookmark>,
): BookmarkRecord {
  const data = snap.data()
  return {
    verseKey: snap.id,
    collectionId: data.collectionId,
    createdAt: data.createdAt?.toDate() ?? new Date(0),
  }
}

export async function listBookmarks(
  userId: string,
  filter: { collectionId?: string; surahPrefix?: number } = {},
): Promise<BookmarkRecord[]> {
  let query: FirebaseFirestore.Query<Bookmark> = bookmarksRef(userId)

  if (filter.collectionId) {
    query = query.where("collectionId", "==", filter.collectionId)
  }
  // "2:255" style keys sort lexicographically within a surah, so a range on
  // the document id (verseKey) is a correct surah-prefix filter — same
  // approach as the old `$regex: '^2:'` query, no composite index needed.
  if (filter.surahPrefix) {
    const prefix = `${filter.surahPrefix}:`
    query = query
      .orderBy(FieldPath.documentId())
      .startAt(prefix)
      .endAt(`${prefix}`)
    const snap = await query.limit(MAX_BOOKMARKS).get()
    return snap.docs.map(fromSnapshot)
  }

  const snap = await query.orderBy("createdAt", "desc").limit(MAX_BOOKMARKS).get()
  return snap.docs.map(fromSnapshot)
}

export async function countBookmarks(userId: string): Promise<number> {
  const snap = await bookmarksRef(userId).count().get()
  return snap.data().count
}

export async function getBookmark(
  userId: string,
  verseKey: string,
): Promise<BookmarkRecord | null> {
  const snap = await bookmarksRef(userId).doc(verseKey).get()
  if (!snap.exists) return null
  return fromSnapshot(snap as FirebaseFirestore.QueryDocumentSnapshot<Bookmark>)
}

export type CreateBookmarkResult =
  | { ok: true; created: boolean; bookmark: BookmarkRecord }
  | { ok: false; error: "limit-reached" | "collection-not-found" }

export async function createBookmark(
  userId: string,
  verseKey: string,
  collectionId: string | null,
): Promise<CreateBookmarkResult> {
  const existing = await getBookmark(userId, verseKey)
  if (existing) return { ok: true, created: false, bookmark: existing }

  let targetCollectionId: string
  if (collectionId) {
    const owned = await getCollection(userId, collectionId)
    if (!owned) return { ok: false, error: "collection-not-found" }
    targetCollectionId = collectionId
  } else {
    targetCollectionId = (await getOrCreateFavourites(userId)).id
  }

  const ref = bookmarksRef(userId)
  const countSnap = await ref.count().get()
  if (countSnap.data().count >= MAX_BOOKMARKS) {
    return { ok: false, error: "limit-reached" }
  }

  try {
    await ref.doc(verseKey).create({
      collectionId: targetCollectionId,
      createdAt: FieldValue.serverTimestamp() as unknown as Timestamp,
    })
  } catch (error) {
    // Concurrent tab already saved it — idempotent success, same as the
    // Mongo E11000 duplicate-key race handling this replaces.
    if (isAlreadyExists(error)) {
      const raced = await getBookmark(userId, verseKey)
      if (raced) return { ok: true, created: false, bookmark: raced }
    }
    throw error
  }

  await adjustBookmarkCount(userId, targetCollectionId, 1)
  const createdRecord = await getBookmark(userId, verseKey)
  return { ok: true, created: true, bookmark: createdRecord! }
}

export type MoveBookmarkResult =
  | { ok: true; bookmark: BookmarkRecord }
  | { ok: false; error: "not-found" | "collection-not-found" }

export async function moveBookmark(
  userId: string,
  verseKey: string,
  collectionId: string | null,
): Promise<MoveBookmarkResult> {
  let targetCollectionId: string
  if (collectionId) {
    const owned = await getCollection(userId, collectionId)
    if (!owned) return { ok: false, error: "collection-not-found" }
    targetCollectionId = collectionId
  } else {
    targetCollectionId = (await getOrCreateFavourites(userId)).id
  }

  const db = getDb()
  const ref = bookmarksRef(userId).doc(verseKey)

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) return { ok: false as const, error: "not-found" as const }
    const previousCollectionId = snap.data()!.collectionId
    if (previousCollectionId === targetCollectionId) {
      return { ok: true as const, moved: false as const }
    }

    tx.update(ref, { collectionId: targetCollectionId })
    return { ok: true as const, moved: true as const, previousCollectionId }
  })

  if (!result.ok) return result
  if (result.moved) {
    await Promise.all([
      adjustBookmarkCount(userId, result.previousCollectionId, -1),
      adjustBookmarkCount(userId, targetCollectionId, 1),
    ])
  }

  const updated = await getBookmark(userId, verseKey)
  return { ok: true, bookmark: updated! }
}

export async function deleteBookmark(
  userId: string,
  verseKey: string,
): Promise<boolean> {
  const db = getDb()
  const ref = bookmarksRef(userId).doc(verseKey)

  const collectionId = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) return null
    tx.delete(ref)
    return snap.data()!.collectionId
  })

  if (!collectionId) return false
  await adjustBookmarkCount(userId, collectionId, -1)
  return true
}

function isAlreadyExists(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 6
  )
}
