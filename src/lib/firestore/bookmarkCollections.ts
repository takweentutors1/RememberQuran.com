import { FieldValue } from "firebase-admin/firestore"
import { getDb } from "./admin"
import type { Bookmark } from "./bookmarks"

export const FAVOURITES_NAME = "Favourites"
export const MAX_COLLECTIONS = 50

export interface BookmarkCollectionRecord {
  id: string
  name: string
  isDefault: boolean
  count: number
}

function collectionsRef(userId: string) {
  return getDb().collection("users").doc(userId).collection("bookmarkCollections")
}

function fromSnapshot(snap: FirebaseFirestore.QueryDocumentSnapshot): BookmarkCollectionRecord {
  const data = snap.data()
  return {
    id: snap.id,
    name: data.name,
    isDefault: Boolean(data.isDefault),
    count: data.bookmarkCount ?? 0,
  }
}

/**
 * Ownership is implicit in the subcollection path (`users/{uid}/...`) —
 * unlike Mongo, there's no separate `userId` field to filter by, and no way
 * to fetch another user's collection by guessing an id.
 */
export async function listCollections(
  userId: string,
): Promise<BookmarkCollectionRecord[]> {
  const snap = await collectionsRef(userId)
    .orderBy("isDefault", "desc")
    .orderBy("createdAt", "asc")
    .get()
  return snap.docs.map(fromSnapshot)
}

export async function getCollection(
  userId: string,
  id: string,
): Promise<BookmarkCollectionRecord | null> {
  const snap = await collectionsRef(userId).doc(id).get()
  if (!snap.exists) return null
  return fromSnapshot(snap as FirebaseFirestore.QueryDocumentSnapshot)
}

/**
 * Seeded at registration — this is the safety net for accounts created
 * before the seed existed (or the emulator/manual data-fixups scenario).
 */
export async function getOrCreateFavourites(
  userId: string,
): Promise<BookmarkCollectionRecord> {
  const ref = collectionsRef(userId)
  const existing = await ref.where("isDefault", "==", true).limit(1).get()
  if (!existing.empty) return fromSnapshot(existing.docs[0]!)

  // A non-default collection already named "Favourites" — promote it instead
  // of creating a duplicate name.
  const byName = await ref.where("name", "==", FAVOURITES_NAME).limit(1).get()
  if (!byName.empty) {
    const doc = byName.docs[0]!
    await doc.ref.update({ isDefault: true, updatedAt: FieldValue.serverTimestamp() })
    return { ...fromSnapshot(doc), isDefault: true }
  }

  const now = FieldValue.serverTimestamp()
  const newRef = ref.doc()
  await newRef.set({
    name: FAVOURITES_NAME,
    isDefault: true,
    bookmarkCount: 0,
    createdAt: now,
    updatedAt: now,
  })
  return { id: newRef.id, name: FAVOURITES_NAME, isDefault: true, count: 0 }
}

export type CreateCollectionResult =
  | { ok: true; collection: BookmarkCollectionRecord }
  | { ok: false; error: "duplicate-name" | "limit-reached" }

export async function createCollection(
  userId: string,
  name: string,
): Promise<CreateCollectionResult> {
  const db = getDb()
  const ref = collectionsRef(userId)
  const newRef = ref.doc()

  return db.runTransaction(async (tx) => {
    const [dupeSnap, countSnap] = await Promise.all([
      tx.get(ref.where("name", "==", name).limit(1)),
      tx.get(ref.count()),
    ])
    if (!dupeSnap.empty) return { ok: false as const, error: "duplicate-name" as const }
    if (countSnap.data().count >= MAX_COLLECTIONS) {
      return { ok: false as const, error: "limit-reached" as const }
    }

    const now = FieldValue.serverTimestamp()
    tx.set(newRef, { name, isDefault: false, bookmarkCount: 0, createdAt: now, updatedAt: now })
    return {
      ok: true as const,
      collection: { id: newRef.id, name, isDefault: false, count: 0 },
    }
  })
}

export type RenameCollectionResult =
  | { ok: true; collection: BookmarkCollectionRecord }
  | { ok: false; error: "not-found" | "is-default" | "duplicate-name" }

export async function renameCollection(
  userId: string,
  id: string,
  name: string,
): Promise<RenameCollectionResult> {
  const db = getDb()
  const ref = collectionsRef(userId)
  const targetRef = ref.doc(id)

  return db.runTransaction(async (tx) => {
    const [targetSnap, dupeSnap] = await Promise.all([
      tx.get(targetRef),
      tx.get(ref.where("name", "==", name).limit(1)),
    ])
    if (!targetSnap.exists) return { ok: false as const, error: "not-found" as const }
    if (targetSnap.data()!.isDefault) return { ok: false as const, error: "is-default" as const }
    const dupe = dupeSnap.docs[0]
    if (dupe && dupe.id !== id) return { ok: false as const, error: "duplicate-name" as const }

    tx.update(targetRef, { name, updatedAt: FieldValue.serverTimestamp() })
    return {
      ok: true as const,
      collection: {
        id,
        name,
        isDefault: false,
        count: targetSnap.data()!.bookmarkCount ?? 0,
      },
    }
  })
}

export type DeleteCollectionResult =
  | { ok: true; movedToFavourites: number }
  | { ok: false; error: "not-found" | "is-default" }

/** Keeps the ayahs: folds bookmarks into Favourites before removing the folder. */
export async function deleteCollection(
  userId: string,
  id: string,
): Promise<DeleteCollectionResult> {
  const db = getDb()
  const target = await collectionsRef(userId).doc(id).get()
  if (!target.exists) return { ok: false, error: "not-found" }
  if (target.data()!.isDefault) return { ok: false, error: "is-default" }

  const favourites = await getOrCreateFavourites(userId)
  const bookmarksRef = db
    .collection("users")
    .doc(userId)
    .collection("bookmarks") as FirebaseFirestore.CollectionReference<Bookmark>

  const toMove = await bookmarksRef.where("collectionId", "==", id).get()
  const batches: FirebaseFirestore.WriteBatch[] = []
  let batch = db.batch()
  let opsInBatch = 0
  for (const doc of toMove.docs) {
    batch.update(doc.ref, { collectionId: favourites.id })
    opsInBatch += 1
    if (opsInBatch === 450) {
      batches.push(batch)
      batch = db.batch()
      opsInBatch = 0
    }
  }
  batches.push(batch)
  await Promise.all(batches.map((b) => b.commit()))

  const movedCount = toMove.size
  await Promise.all([
    collectionsRef(userId)
      .doc(favourites.id)
      .update({ bookmarkCount: FieldValue.increment(movedCount) }),
    collectionsRef(userId).doc(id).delete(),
  ])

  return { ok: true, movedToFavourites: movedCount }
}

/** Internal — bookmarks.ts adjusts counters when bookmarks move/are removed. */
export async function adjustBookmarkCount(
  userId: string,
  collectionId: string,
  delta: number,
): Promise<void> {
  await collectionsRef(userId)
    .doc(collectionId)
    .update({ bookmarkCount: FieldValue.increment(delta) })
}
