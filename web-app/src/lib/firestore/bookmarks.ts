import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"
import {
  adjustBookmarkCount,
  getOrCreateFavourites,
  collectionDocRef,
} from "./bookmarkCollections"

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

  // Favourites is seeded at registration and protected from deletion
  // (deleteCollection refuses on isDefault), so resolving it up front is
  // safe. An explicit custom collection isn't protected — it's re-verified
  // inside the transaction below, not here, so a concurrent delete between
  // this call and the write can't leave the bookmark pointing at nothing.
  const targetCollectionId = collectionId ?? (await getOrCreateFavourites(userId)).id

  const ref = bookmarksRef(userId)
  const db = getDb()
  const bookmarkRef = ref.doc(verseKey)
  const collectionRef = collectionId ? collectionDocRef(userId, collectionId) : null

  // Existence + count-limit check and the write are all in one transaction —
  // otherwise two concurrent creates for two different new ayahs can both
  // pass the count check before either commits, bypassing MAX_BOOKMARKS.
  const outcome = await db.runTransaction(async (tx) => {
    if (collectionRef) {
      const collectionSnap = await tx.get(collectionRef)
      if (!collectionSnap.exists) {
        return { ok: false as const, error: "collection-not-found" as const }
      }
    }
    // Concurrent tab may have saved it since the fast-path check above —
    // idempotent success, same as the Mongo E11000 duplicate-key race
    // handling this replaces.
    const bookmarkSnap = await tx.get(bookmarkRef)
    if (bookmarkSnap.exists) return { ok: true as const, created: false as const }

    const countSnap = await tx.get(ref.count())
    if (countSnap.data().count >= MAX_BOOKMARKS) {
      return { ok: false as const, error: "limit-reached" as const }
    }

    tx.set(bookmarkRef, {
      collectionId: targetCollectionId,
      createdAt: FieldValue.serverTimestamp() as unknown as Timestamp,
    })
    return { ok: true as const, created: true as const }
  })

  if (!outcome.ok) return outcome
  if (!outcome.created) {
    const raced = await getBookmark(userId, verseKey)
    return { ok: true, created: false, bookmark: raced! }
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
  // Favourites is delete-protected, so resolving it up front is safe (see
  // createBookmark). A custom collectionId is re-verified inside the
  // transaction instead, guarding against a concurrent delete.
  const favouritesId = collectionId ? null : (await getOrCreateFavourites(userId)).id

  const db = getDb()
  const ref = bookmarksRef(userId).doc(verseKey)
  const collectionRef = collectionId ? collectionDocRef(userId, collectionId) : null

  const result = await db.runTransaction(async (tx) => {
    let targetCollectionId: string
    if (collectionRef) {
      const collectionSnap = await tx.get(collectionRef)
      if (!collectionSnap.exists) {
        return { ok: false as const, error: "collection-not-found" as const }
      }
      targetCollectionId = collectionId!
    } else {
      targetCollectionId = favouritesId!
    }

    const snap = await tx.get(ref)
    if (!snap.exists) return { ok: false as const, error: "not-found" as const }
    const previousCollectionId = snap.data()!.collectionId
    if (previousCollectionId === targetCollectionId) {
      return { ok: true as const, moved: false as const }
    }

    tx.update(ref, { collectionId: targetCollectionId })
    return { ok: true as const, moved: true as const, previousCollectionId, targetCollectionId }
  })

  if (!result.ok) return result
  if (result.moved) {
    await Promise.all([
      adjustBookmarkCount(userId, result.previousCollectionId, -1),
      adjustBookmarkCount(userId, result.targetCollectionId, 1),
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
