import type { Segment, VerseTiming } from "@/types/audio"

/**
 * Pure timing math for word-by-word sync. Kept free of React/DOM so it can
 * be unit-tested in isolation.
 */

export interface CleanVerseTiming {
  verseKey: string
  verseNumber: number
  /** Absolute ms within the chapter file */
  from: number
  to: number
  /** Sanitized, sorted by start time */
  segments: Segment[]
}

/**
 * The API returns real-world dirt (verified 2026-07): interleaved
 * single-element arrays (Alafasy 1:3), float timestamps (Sudais), and first
 * segments starting slightly before the verse's own timestamp_from. Keep only
 * well-formed [position, start, end] triples with position >= 1.
 */
export function sanitizeTimings(timings: VerseTiming[]): CleanVerseTiming[] {
  return (timings ?? []).map((t) => {
    const segments = (t.segments ?? [])
      .filter(
        (s): s is Segment =>
          Array.isArray(s) &&
          s.length >= 3 &&
          s.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n)) &&
          s[0] >= 1 &&
          s[2] > s[1],
      )
      .map((s) => [s[0], s[1], s[2]] as Segment)
      .sort((a, b) => a[1] - b[1])

    return {
      verseKey: t.verse_key,
      verseNumber: Number(t.verse_key.split(":")[1]),
      from: t.timestamp_from,
      to: t.timestamp_to,
      segments,
    }
  })
}

/**
 * Index of the verse whose [from, to) window contains timeMs, clamped to
 * [0, length - 1]. Segments can start slightly before their verse window, so
 * always resolve the verse first and only then the word within it.
 */
export function findVerseIndex(
  timings: CleanVerseTiming[],
  timeMs: number,
): number {
  if (timings.length === 0) return -1
  let lo = 0
  let hi = timings.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (timings[mid].from <= timeMs) lo = mid
    else hi = mid - 1
  }
  return lo
}

/**
 * Word position recited at timeMs within one verse, or null during gaps
 * (pauses, madd tails) — callers keep the previous highlight on null to
 * avoid flicker.
 */
export function findWordPosition(
  timing: CleanVerseTiming,
  timeMs: number,
): number | null {
  const segs = timing.segments
  if (segs.length === 0) return null
  let lo = 0
  let hi = segs.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (segs[mid][1] <= timeMs) lo = mid
    else hi = mid - 1
  }
  const seg = segs[lo]
  return seg[1] <= timeMs && timeMs < seg[2] ? seg[0] : null
}
