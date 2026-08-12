import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"

export const MAX_MEMORISED = 6236

interface MemorisedAyahDoc {
  surahId: number
  ayahId: number
  memorisedAt: Timestamp
}

export interface MemorisedAyahRecord {
  verseKey: string
  surahId: number
  ayahId: number
  memorisedAt: Date
}

function hifzRef(userId: string) {
  return getDb()
    .collection("users")
    .doc(userId)
    .collection("memorisedAyahs") as FirebaseFirestore.CollectionReference<MemorisedAyahDoc>
}

function fromSnapshot(
  snap: FirebaseFirestore.QueryDocumentSnapshot<MemorisedAyahDoc>,
): MemorisedAyahRecord {
  const data = snap.data()
  return {
    verseKey: snap.id,
    surahId: data.surahId,
    ayahId: data.ayahId,
    memorisedAt: data.memorisedAt?.toDate() ?? new Date(0),
  }
}

export async function countMemorisedAyahs(userId: string): Promise<number> {
  const snap = await hifzRef(userId).count().get()
  return snap.data().count
}

/** Sorted by (surahId, ayahId) — needs the composite index in firestore.indexes.json. */
export async function listMemorisedAyahs(
  userId: string,
  surahId?: number,
): Promise<MemorisedAyahRecord[]> {
  let query: FirebaseFirestore.Query<MemorisedAyahDoc> = hifzRef(userId)
  if (surahId !== undefined) {
    query = query.where("surahId", "==", surahId)
  }
  const snap = await query
    .orderBy("surahId", "asc")
    .orderBy("ayahId", "asc")
    .limit(MAX_MEMORISED)
    .get()
  return snap.docs.map(fromSnapshot)
}

export type MarkMemorisedResult =
  | { ok: true; created: boolean; ayah: MemorisedAyahRecord }
  | { ok: false; error: "limit-reached" }

export async function markMemorised(
  userId: string,
  verseKey: string,
  surahId: number,
  ayahId: number,
): Promise<MarkMemorisedResult> {
  const ref = hifzRef(userId)
  const existingSnap = await ref.doc(verseKey).get()
  if (existingSnap.exists) {
    return {
      ok: true,
      created: false,
      ayah: fromSnapshot(existingSnap as FirebaseFirestore.QueryDocumentSnapshot<MemorisedAyahDoc>),
    }
  }

  const countSnap = await ref.count().get()
  if (countSnap.data().count >= MAX_MEMORISED) {
    return { ok: false, error: "limit-reached" }
  }

  try {
    await ref.doc(verseKey).create({
      surahId,
      ayahId,
      memorisedAt: FieldValue.serverTimestamp() as unknown as Timestamp,
    })
  } catch (error) {
    if (isAlreadyExists(error)) {
      const raced = await ref.doc(verseKey).get()
      if (raced.exists) {
        return {
          ok: true,
          created: false,
          ayah: fromSnapshot(raced as FirebaseFirestore.QueryDocumentSnapshot<MemorisedAyahDoc>),
        }
      }
    }
    throw error
  }

  const createdSnap = await ref.doc(verseKey).get()
  return {
    ok: true,
    created: true,
    ayah: fromSnapshot(createdSnap as FirebaseFirestore.QueryDocumentSnapshot<MemorisedAyahDoc>),
  }
}

export async function unmarkMemorised(userId: string, verseKey: string): Promise<boolean> {
  const ref = hifzRef(userId).doc(verseKey)
  const snap = await ref.get()
  if (!snap.exists) return false
  await ref.delete()
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
