import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"
import { localDayStart, localDayKey } from "@/lib/progress/date"

export interface AyahRange {
  from: number
  to: number
}

export interface ProgressEventRecord {
  surah: number
  ranges: AyahRange[]
  date: Date
}

function progressRef(userId: string) {
  return getDb()
    .collection("users")
    .doc(userId)
    .collection("progressEvents") as FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
}

/**
 * Reads the current `ranges` array, or falls back to the legacy single
 * fromAyah/toAyah fields for docs written before this schema change — no
 * migration needed, an old row just looks like a one-range doc.
 */
function extractRanges(data: FirebaseFirestore.DocumentData): AyahRange[] {
  if (Array.isArray(data.ranges)) return data.ranges as AyahRange[]
  if (typeof data.fromAyah === "number" && typeof data.toAyah === "number") {
    return [{ from: data.fromAyah, to: data.toAyah }]
  }
  return []
}

/**
 * Merges overlapping/adjacent ranges into the fewest disjoint intervals,
 * sorted ascending — the canonical form stored on each doc, so summing a
 * doc's ranges never double-counts an ayah read more than once.
 */
function mergeRanges(ranges: AyahRange[]): AyahRange[] {
  if (ranges.length === 0) return []
  const sorted = [...ranges].sort((a, b) => a.from - b.from)
  const merged: AyahRange[] = [{ ...sorted[0]! }]
  for (const r of sorted.slice(1)) {
    const last = merged[merged.length - 1]!
    if (r.from <= last.to + 1) {
      last.to = Math.max(last.to, r.to)
    } else {
      merged.push({ ...r })
    }
  }
  return merged
}

function rangesEqual(a: AyahRange[], b: AyahRange[]): boolean {
  return (
    a.length === b.length &&
    a.every((r, i) => r.from === b[i]!.from && r.to === b[i]!.to)
  )
}

function sumRanges(ranges: AyahRange[]): number {
  return ranges.reduce((total, r) => total + Math.max(0, r.to - r.from + 1), 0)
}

/**
 * One doc per user/surah/local-day, id-encoded as `${surah}_${yyyy-mm-dd}` —
 * the deterministic id gives the "one row per day" uniqueness Mongo's
 * compound unique index enforced, for free. Reading the doc inside the
 * transaction also means concurrent tabs serialize and merge correctly
 * without the create-then-catch race dance the Mongo version needed.
 *
 * The day-key is derived directly from `timeZone` (not by re-slicing the
 * resulting UTC instant's ISO string) — for timezones ahead of UTC, local
 * midnight can fall on the *previous* UTC calendar date, which would
 * otherwise silently bucket a "today" event under yesterday's doc id.
 *
 * Events for the same day/surah are merged into disjoint ranges, not
 * collapsed into one min/max span — non-contiguous reading (e.g. ayah 1-5,
 * then later 50-55) counts only the ~11 ayahs actually read toward the daily
 * goal, not the full 1-55 span.
 */
export async function recordProgressEvent(
  userId: string,
  surah: number,
  fromAyah: number,
  toAyah: number,
  timeZone: string,
): Promise<ProgressEventRecord> {
  const db = getDb()
  const now = new Date()
  const date = localDayStart(timeZone, now)
  const ref = progressRef(userId).doc(`${surah}_${localDayKey(timeZone, now)}`)
  const userRef = db.collection("users").doc(userId)
  const dateTs = Timestamp.fromDate(date)

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now2 = FieldValue.serverTimestamp()

    if (!snap.exists) {
      const ranges: AyahRange[] = [{ from: fromAyah, to: toAyah }]
      tx.set(ref, { surah, ranges, date: dateTs, createdAt: now2 })
      tx.update(userRef, {
        viewedSurahs: FieldValue.arrayUnion(surah),
        updatedAt: now2,
      })
      return { surah, ranges, date }
    }

    const existing = extractRanges(snap.data()!)
    const merged = mergeRanges([...existing, { from: fromAyah, to: toAyah }])
    if (!rangesEqual(merged, existing)) {
      tx.update(ref, { ranges: merged })
    }
    return { surah, ranges: merged, date }
  })
}

/** Sum distinct ayahs covered by progress events on a given local day, across all surahs. */
export async function sumAyahsForDay(userId: string, day: Date): Promise<number> {
  const snap = await progressRef(userId).where("date", "==", Timestamp.fromDate(day)).get()
  let total = 0
  for (const doc of snap.docs) {
    total += sumRanges(extractRanges(doc.data()))
  }
  return total
}
