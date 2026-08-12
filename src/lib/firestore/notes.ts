import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"

export const MAX_NOTES = 2000

interface NoteDoc {
  text: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface NoteRecord {
  verseKey: string
  text: string
  createdAt: Date
  updatedAt: Date
}

function notesRef(userId: string) {
  return getDb()
    .collection("users")
    .doc(userId)
    .collection("notes") as FirebaseFirestore.CollectionReference<NoteDoc>
}

function fromSnapshot(
  snap: FirebaseFirestore.QueryDocumentSnapshot<NoteDoc>,
): NoteRecord {
  const data = snap.data()
  return {
    verseKey: snap.id,
    text: data.text,
    createdAt: data.createdAt?.toDate() ?? new Date(0),
    updatedAt: data.updatedAt?.toDate() ?? new Date(0),
  }
}

export async function countNotes(userId: string): Promise<number> {
  const snap = await notesRef(userId).count().get()
  return snap.data().count
}

export async function getNote(
  userId: string,
  verseKey: string,
): Promise<NoteRecord | null> {
  const snap = await notesRef(userId).doc(verseKey).get()
  if (!snap.exists) return null
  return fromSnapshot(snap as FirebaseFirestore.QueryDocumentSnapshot<NoteDoc>)
}

export async function listNotes(
  userId: string,
  filter: { surahPrefix?: number } = {},
): Promise<NoteRecord[]> {
  let query: FirebaseFirestore.Query<NoteDoc> = notesRef(userId)

  if (filter.surahPrefix) {
    const prefix = `${filter.surahPrefix}:`
    query = query
      .orderBy(FieldPath.documentId())
      .startAt(prefix)
      .endAt(`${prefix}`)
    const snap = await query.limit(MAX_NOTES).get()
    return snap.docs.map(fromSnapshot)
  }

  const snap = await query.orderBy("updatedAt", "desc").limit(MAX_NOTES).get()
  return snap.docs.map(fromSnapshot)
}

export type SaveNoteResult =
  | { ok: true; note: NoteRecord }
  | { ok: false; error: "limit-reached" }

/** Upserts the note for an ayah — callers already route empty text to `deleteNote`. */
export async function saveNote(
  userId: string,
  verseKey: string,
  text: string,
): Promise<SaveNoteResult> {
  const ref = notesRef(userId).doc(verseKey)
  const existing = await ref.get()

  if (!existing.exists) {
    const countSnap = await notesRef(userId).count().get()
    if (countSnap.data().count >= MAX_NOTES) {
      return { ok: false, error: "limit-reached" }
    }
  }

  const now = FieldValue.serverTimestamp()
  await ref.set(
    {
      text,
      updatedAt: now,
      ...(existing.exists ? {} : { createdAt: now }),
    },
    { merge: true },
  )

  const saved = await getNote(userId, verseKey)
  return { ok: true, note: saved! }
}

export async function deleteNote(userId: string, verseKey: string): Promise<void> {
  await notesRef(userId).doc(verseKey).delete()
}
