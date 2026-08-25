import type { TafsirResource, TafsirContent, AsbabContent } from "@/types/study"

/**
 * Tafsir book registry — adding a book in Milestone 5 means appending an
 * entry here (slug must exist on QDC; verify via /resources/tafsirs).
 * The /api/tafsir route validates slugs against this list, so it doubles
 * as the proxy allowlist.
 */
export const TAFSIR_RESOURCES: TafsirResource[] = [
  {
    id: 169,
    // Upstream slug really is misspelled ("tafisr") — verified 2026-07
    slug: "en-tafisr-ibn-kathir",
    name: "Ibn Kathir (Abridged)",
    author: "Hafiz Ibn Kathir",
    language: "english",
  },
  {
    id: 168,
    slug: "en-tafsir-maarif-ul-quran",
    name: "Ma'arif al-Qur'an",
    author: "Mufti Muhammad Shafi",
    language: "english",
  },
  {
    id: 817,
    slug: "tazkirul-quran-en",
    name: "Tazkirul Quran",
    author: "Maulana Wahiduddin Khan",
    language: "english",
  },
  {
    id: 91,
    slug: "ar-tafseer-al-saddi",
    name: "Al-Sa'di",
    author: "Abdur-Rahman As-Sa'di",
    language: "arabic",
  },
  {
    id: 16,
    slug: "ar-tafsir-muyassar",
    name: "Tafsir Muyassar",
    author: "King Fahd Complex",
    language: "arabic",
  },
]

export const DEFAULT_TAFSIR_SLUG = TAFSIR_RESOURCES[0].slug

export function isTafsirSlug(slug: string): boolean {
  return TAFSIR_RESOURCES.some((r) => r.slug === slug)
}

export function getTafsirResource(slug: string): TafsirResource | undefined {
  return TAFSIR_RESOURCES.find((r) => r.slug === slug)
}

/** Promise cache keyed by `${slug}:${verseKey}` — failed loads are evicted
 * so a retry actually refetches (same pattern as audioApi.ts). */
const tafsirCache = new Map<string, Promise<TafsirContent>>()

export async function getTafsir(
  slug: string,
  verseKey: string,
): Promise<TafsirContent> {
  const key = `${slug}:${verseKey}`
  const cached = tafsirCache.get(key)
  if (cached) return cached

  const [surahId, ayahId] = verseKey.split(":")
  const promise = (async () => {
    const res = await fetch(`/api/tafsir/${slug}/${surahId}/${ayahId}`)
    if (!res.ok) {
      throw new Error(`Tafsir ${slug} ${verseKey} failed to load (${res.status})`)
    }
    const data = (await res.json()) as TafsirContent

    // A passage often covers several grouped ayahs — prime the cache for all
    // of them so tapping a sibling ayah is instant.
    for (const covered of data.coveredKeys) {
      const coveredKey = `${slug}:${covered}`
      if (!tafsirCache.has(coveredKey)) {
        tafsirCache.set(coveredKey, Promise.resolve(data))
      }
    }
    return data
  })()

  tafsirCache.set(key, promise)
  promise.catch(() => tafsirCache.delete(key))
  return promise
}

/** Asbab al-Nuzul cache keyed by verseKey — same eviction-on-failure pattern */
const asbabCache = new Map<string, Promise<AsbabContent>>()

export async function getAsbab(verseKey: string): Promise<AsbabContent> {
  const cached = asbabCache.get(verseKey)
  if (cached) return cached

  const [surahId, ayahId] = verseKey.split(":")
  const promise = (async () => {
    const res = await fetch(`/api/asbab/${surahId}/${ayahId}`)
    if (!res.ok) {
      throw new Error(`Asbab ${verseKey} failed to load (${res.status})`)
    }
    return (await res.json()) as AsbabContent
  })()

  asbabCache.set(verseKey, promise)
  promise.catch(() => asbabCache.delete(verseKey))
  return promise
}
