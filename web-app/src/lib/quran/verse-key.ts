/**
 * Ayah count per surah (Hafs/Uthmani numbering, 6236 total). Static so the
 * auth-gated bookmark APIs never depend on an external API call to validate.
 */
const AYAH_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
]

export interface ParsedVerseKey {
  surahId: number
  ayahId: number
}

export function getAyahCount(surahId: number): number | null {
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) return null
  return AYAH_COUNTS[surahId - 1]
}

/**
 * Parse and validate a canonical verse key ("2:255"). Returns null for
 * anything malformed or out of range ("abc", "999:1", "2:9999", "02:1").
 */
export function parseVerseKey(input: unknown): ParsedVerseKey | null {
  if (typeof input !== "string") return null
  const match = input.trim().match(/^([1-9]\d{0,2}):([1-9]\d{0,2})$/)
  if (!match) return null
  const surahId = Number(match[1])
  const ayahId = Number(match[2])
  const count = getAyahCount(surahId)
  if (count === null || ayahId > count) return null
  return { surahId, ayahId }
}

/** Inclusive ayah range for memorisation hide scope (session-only). */
export type HideArabicRange = { start: number; end: number }

/**
 * Clamp + swap start/end into a valid inclusive range for the current surah.
 * Returns null for non-integers or when maxAyah is invalid.
 */
export function normalizeHideRange(
  start: unknown,
  end: unknown,
  maxAyah: number,
): HideArabicRange | null {
  const s = typeof start === "number" ? start : Number(start)
  const e = typeof end === "number" ? end : Number(end)
  if (!Number.isInteger(s) || !Number.isInteger(e)) return null
  if (!Number.isInteger(maxAyah) || maxAyah < 1) return null
  const a = Math.min(Math.max(s, 1), maxAyah)
  const b = Math.min(Math.max(e, 1), maxAyah)
  return { start: Math.min(a, b), end: Math.max(a, b) }
}

/** null range = whole surah is in hide scope. */
export function isAyahInHideRange(
  ayahNum: number,
  range: HideArabicRange | null,
): boolean {
  if (!range) return true
  return ayahNum >= range.start && ayahNum <= range.end
}
