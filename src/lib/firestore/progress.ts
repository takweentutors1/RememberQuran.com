import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"
import { utcDayStart } from "@/lib/progress/date"

interface ProgressEventDoc {
  surah: number
  fromAyah: number
  toAyah: number
  date: Timestamp
  createdAt: Timestamp
}

export interface ProgressEventRecord {
  surah: number
  fromAyah: number
  toAyah: number
  date: Date
}

function progressRef(userId: string) {
  return getDb()
    .collection("users")
    .doc(userId)
    .collection("progressEvents") as FirebaseFirestore.CollectionReference<ProgressEventDoc>
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10) // "2026-08-12" — date is already UTC midnight
}

/**
 * One doc per user/surah/UTC-day, id-encoded as `${surah}_${yyyy-mm-dd}` —
 * the deterministic id gives the "one row per day" uniqueness Mongo's
 * compound unique index enforced, for free. Reading the doc inside the
 * transaction also means concurrent tabs serialize and merge correctly
 * without the create-then-catch race dance the Mongo version needed.
 */
export async function recordProgressEvent(
  userId: string,
  surah: number,
  fromAyah: number,
  toAyah: number,
): Promise<ProgressEventRecord> {
  const db = getDb()
  const date = utcDayStart()
  const ref = progressRef(userId).doc(`${surah}_${dateKey(date)}`)
  const userRef = db.collection("users").doc(userId)
  const dateTs = Timestamp.fromDate(date)

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = FieldValue.serverTimestamp()

    if (!snap.exists) {
      tx.set(ref, { surah, fromAyah, toAyah, date: dateTs, createdAt: now })
      tx.update(userRef, {
        viewedSurahs: FieldValue.arrayUnion(surah),
        updatedAt: now,
      })
      return { surah, fromAyah, toAyah, date }
    }

    const existing = snap.data()!
    const nextFrom = Math.min(existing.fromAyah, fromAyah)
    const nextTo = Math.max(existing.toAyah, toAyah)
    if (nextFrom !== existing.fromAyah || nextTo !== existing.toAyah) {
      tx.update(ref, { fromAyah: nextFrom, toAyah: nextTo })
    }
    return { surah, fromAyah: nextFrom, toAyah: nextTo, date }
  })

  return result
}

/** Sum ayahs covered by progress events on a given UTC day, across all surahs. */
export async function sumAyahsForDay(userId: string, day: Date): Promise<number> {
  const snap = await progressRef(userId).where("date", "==", Timestamp.fromDate(day)).get()
  let total = 0
  for (const doc of snap.docs) {
    const { fromAyah, toAyah } = doc.data()
    total += Math.max(0, toAyah - fromAyah + 1)
  }
  return total
}
