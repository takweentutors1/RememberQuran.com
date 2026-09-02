import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"

export const MAX_MEMORISED = 6236

interface MemorisedAyahDoc {
  surahId: number
  ayahId: number
  memorisedAt: Timestamp
  repetitions?: number
  intervalDays?: number
  easeFactor?: number
  nextReviewAt?: Timestamp
  lastReviewedAt?: Timestamp
}

export interface MemorisedAyahRecord {
  verseKey: string
  surahId: number
  ayahId: number
  memorisedAt: Date
  repetitions?: number
  intervalDays?: number
  easeFactor?: number
  nextReviewAt?: Date
  lastReviewedAt?: Date
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
    repetitions: data.repetitions,
    intervalDays: data.intervalDays,
    easeFactor: data.easeFactor,
    nextReviewAt: data.nextReviewAt?.toDate(),
    lastReviewedAt: data.lastReviewedAt?.toDate(),
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

/**
 * Existence + count-limit check and the write are all in one transaction —
 * otherwise two concurrent marks for two different new ayahs can both pass
 * the count check before either commits, bypassing MAX_MEMORISED (same class
 * of race fixed in bookmarks.ts/notes.ts this pass).
 */
export async function markMemorised(
  userId: string,
  verseKey: string,
  surahId: number,
  ayahId: number,
): Promise<MarkMemorisedResult> {
  const db = getDb()
  const ref = hifzRef(userId).doc(verseKey)

  const outcome = await db.runTransaction(async (tx) => {
    const existing = await tx.get(ref)
    if (existing.exists) return { ok: true as const, created: false as const }

    const countSnap = await tx.get(hifzRef(userId).count())
    if (countSnap.data().count >= MAX_MEMORISED) {
      return { ok: false as const, error: "limit-reached" as const }
    }

    tx.set(ref, {
      surahId,
      ayahId,
      memorisedAt: FieldValue.serverTimestamp() as unknown as Timestamp,
    })
    return { ok: true as const, created: true as const }
  })

  if (!outcome.ok) return outcome
  const snap = await ref.get()
  return {
    ok: true,
    created: outcome.created,
    ayah: fromSnapshot(snap as FirebaseFirestore.QueryDocumentSnapshot<MemorisedAyahDoc>),
  }
}

export async function recordReviewSRS(
  userId: string,
  verseKey: string,
  srsUpdate: {
    repetitions: number
    intervalDays: number
    easeFactor: number
    nextReviewAt: Date
    lastReviewedAt: Date
  },
): Promise<MemorisedAyahRecord | null> {
  const ref = hifzRef(userId).doc(verseKey)
  const snap = await ref.get()
  if (!snap.exists) return null

  await ref.update({
    repetitions: srsUpdate.repetitions,
    intervalDays: srsUpdate.intervalDays,
    easeFactor: srsUpdate.easeFactor,
    nextReviewAt: Timestamp.fromDate(srsUpdate.nextReviewAt),
    lastReviewedAt: Timestamp.fromDate(srsUpdate.lastReviewedAt),
  })

  const updatedSnap = await ref.get()
  return fromSnapshot(updatedSnap as FirebaseFirestore.QueryDocumentSnapshot<MemorisedAyahDoc>)
}

export async function unmarkMemorised(userId: string, verseKey: string): Promise<boolean> {
  const ref = hifzRef(userId).doc(verseKey)
  const snap = await ref.get()
  if (!snap.exists) return false
  await ref.delete()
  return true
}
