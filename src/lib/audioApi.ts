import type { ChapterAudioFile, ChapterAudioResponse } from "@/types/audio"

/**
 * Chapter audio (one MP3 per surah + verse/word timings) from the QDC API —
 * the same source quran.com's own player uses, and the same API family as
 * our verses fetch in quranApi.ts. Fetched client-side on demand: audio data
 * is only needed once the user presses play, so it never weighs down SSR.
 */
const AUDIO_BASE_URL =
  process.env.NEXT_PUBLIC_QURAN_QDC_API_URL ?? "https://api.qurancdn.com/api/qdc"

/** Promise cache keyed by `${reciterId}:${chapterId}` — failed loads are
 * evicted so a retry actually refetches. */
const chapterAudioCache = new Map<string, Promise<ChapterAudioFile>>()

export async function getChapterAudio(
  reciterId: number,
  chapterId: number,
): Promise<ChapterAudioFile> {
  const key = `${reciterId}:${chapterId}`
  const cached = chapterAudioCache.get(key)
  if (cached) return cached

  const promise = (async () => {
    const res = await fetch(
      `${AUDIO_BASE_URL}/audio/reciters/${reciterId}/audio_files?chapter=${chapterId}&segments=true`,
      { headers: { Accept: "application/json" } },
    )
    if (!res.ok) {
      throw new Error(`Audio API error ${res.status} ${res.statusText}`)
    }
    const data = (await res.json()) as ChapterAudioResponse
    const file = data.audio_files?.[0]
    if (!file?.audio_url) {
      throw new Error(
        `No audio available for reciter ${reciterId}, chapter ${chapterId}`,
      )
    }
    return file
  })()

  chapterAudioCache.set(key, promise)
  promise.catch(() => chapterAudioCache.delete(key))
  return promise
}

/** Warm the cache (e.g. radio mode nearing a surah boundary) — errors ignored */
export function prefetchChapterAudio(reciterId: number, chapterId: number): void {
  getChapterAudio(reciterId, chapterId).catch(() => {})
}
