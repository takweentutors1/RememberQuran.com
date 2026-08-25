import type { MorphologyEntry } from "@/types/study"

/** Promise-cache keyed by surahId — fetched once per session */
const surahCache = new Map<number, Promise<Record<string, MorphologyEntry>>>()

async function fetchSurahMorphology(
  surahId: number,
): Promise<Record<string, MorphologyEntry>> {
  const res = await fetch(`/data/morphology/v1/${surahId}.json`)
  if (!res.ok) throw new Error(`Morphology fetch failed (${res.status})`)
  return (await res.json()) as Record<string, MorphologyEntry>
}

function loadSurah(surahId: number): Promise<Record<string, MorphologyEntry>> {
  const cached = surahCache.get(surahId)
  if (cached) return cached

  const promise = fetchSurahMorphology(surahId)
  surahCache.set(surahId, promise)
  // Evict on failure so the next call retries
  promise.catch(() => surahCache.delete(surahId))
  return promise
}

/**
 * Prefetch a surah's morphology chunk into the cache. Fire-and-forget —
 * call when the study panel first opens for fast subsequent lookups.
 */
export function prefetchSurahMorphology(surahId: number): void {
  loadSurah(surahId)
}

/**
 * Fetch morphology for one word. Returns null when the word has no corpus
 * entry (e.g. particles, conjunctions with no root).
 *
 * verseKey: "2:255", wordPosition: 1-based index matching corpus word count
 */
export async function getWordMorphology(
  verseKey: string,
  wordPosition: number,
): Promise<MorphologyEntry | null> {
  const parts = verseKey.split(":")
  const surahId = Number(parts[0])
  const verseNumber = Number(parts[1])

  if (!surahId || !verseNumber || !wordPosition) return null

  const surahMap = await loadSurah(surahId)
  const key = `${verseNumber}:${wordPosition}`
  return surahMap[key] ?? null
}
