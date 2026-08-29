import { cache } from "react"
import type {
  Chapter,
  Verse,
  Word,
  ChaptersResponse,
  ChapterResponse,
  VersesResponse,
  VerseResponse,
  PaginationMeta,
} from "@/types/quran"

/** QDC page size used by getVerses / progressive surah loading */
export const VERSES_PER_PAGE = 50
import {
  BUNDLE_TRANSLATION_IDS,
  TRANSLATION_IDS,
  toApiTranslationIds,
} from "@/lib/translations"

export {
  DEFAULT_TRANSLATIONS,
  BUNDLE_TRANSLATION_IDS,
  TRANSLATION_IDS,
  TRANSLATION_NAMES,
  TRANSLATIONS,
  getTranslation,
  getTranslationName,
  isRegisteredTranslationId,
  MAX_ACTIVE_TRANSLATIONS,
} from "@/lib/translations"

const CHAPTERS_BASE_URL =
  process.env.NEXT_PUBLIC_QURAN_CHAPTERS_API_URL ?? "https://api.quran.com/api/v4"
/**
 * QDC — the API quran.com's own reader uses. Unlike the public v4 API it
 * returns word-level qpc_uthmani_hafs, the encoding the KFGQPC UthmanicHafs
 * font is built for (v4 leaves that word field empty).
 */
const VERSES_BASE_URL =
  process.env.NEXT_PUBLIC_QURAN_QDC_API_URL ?? "https://api.qurancdn.com/api/qdc"
/**
 * Dr Mustafa Khattab's Clear Quran is no longer served by the quran.com API
 * (IDs verified 2026-07 — resource 131 returns nothing and the translation is
 * absent from /resources/translations). Sourced instead from the static
 * quran-api CDN and merged into each verse's translations.
 */
const KHATTAB_CDN_URL =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-mustafakhattaba"

const WORD_FIELDS =
  "text_uthmani,qpc_uthmani_hafs,translation,audio_url,transliteration,text_uthmani_tajweed,line_number,code_v1,code_v2,page_number"
const VERSE_FIELDS =
  "text_uthmani,qpc_uthmani_hafs,verse_key,verse_number,page_number,juz_number,hizb_number"

async function apiFetch<T>(
  url: string,
  cacheOption: RequestInit["cache"] | { revalidate: number } = {
    revalidate: 86400,
  },
): Promise<T> {
  const fetchOptions: RequestInit =
    typeof cacheOption === "object" && "revalidate" in cacheOption
      ? { next: cacheOption }
      : { cache: cacheOption as RequestInit["cache"] }

  const res = await fetch(url, {
    ...fetchOptions,
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`Quran API error ${res.status} ${res.statusText} — ${url}`)
  }

  return res.json() as Promise<T>
}

/** Saheeh International embeds <sup foot_note=…> markers — render plain text */
function stripHtml(text: string): string {
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function sanitizeVerse(verse: Verse): Verse {
  return {
    ...verse,
    translations: (verse.translations ?? []).map((t) => ({
      ...t,
      text: stripHtml(t.text),
    })),
  }
}

interface KhattabChapterResponse {
  chapter: { chapter: number; verse: number; text: string }[]
}

/** Khattab translation for a chapter, keyed by ayah number */
async function getKhattabChapter(
  chapterId: number,
): Promise<Map<number, string>> {
  const data = await apiFetch<KhattabChapterResponse>(
    `${KHATTAB_CDN_URL}/${chapterId}.json`,
    "force-cache",
  )
  return new Map(data.chapter.map((v) => [v.verse, v.text]))
}

function mergeKhattab(verse: Verse, khattab: Map<number, string>): Verse {
  const text = khattab.get(verse.verse_number)
  if (!text) return verse
  return {
    ...verse,
    translations: [
      ...verse.translations,
      { resource_id: TRANSLATION_IDS.CLEAR_QURAN, text },
    ],
  }
}

/** All 114 chapters — cached indefinitely (Quran never changes) */
export const getChapters = cache(async (): Promise<Chapter[]> => {
  const data = await apiFetch<ChaptersResponse>(
    `${CHAPTERS_BASE_URL}/chapters`,
    "force-cache",
  )
  return data.chapters
})

/** Single chapter metadata — cached indefinitely */
export const getChapter = cache(async (id: number): Promise<Chapter> => {
  const data = await apiFetch<ChapterResponse>(
    `${CHAPTERS_BASE_URL}/chapters/${id}`,
    "force-cache",
  )
  return data.chapter
})

/**
 * Drop duplicate wire weight — qpc text is what the Uthmani font renders;
 * keep a tiny fallback string only when qpc is missing.
 */
export function slimVerse(verse: Verse): Verse {
  return {
    ...verse,
    words: (verse.words ?? []).map(slimWord),
  }
}

function slimWord(word: Word): Word {
  const hasQpc = Boolean(word.qpc_uthmani_hafs)
  return {
    id: word.id,
    position: word.position,
    audio_url: word.audio_url,
    char_type_name: word.char_type_name,
    line_number: word.line_number,
    code_v1: word.code_v1,
    code_v2: word.code_v2,
    text_uthmani: hasQpc ? "" : word.text_uthmani,
    ...(word.qpc_uthmani_hafs
      ? { qpc_uthmani_hafs: word.qpc_uthmani_hafs }
      : {}),
    ...(word.text_uthmani_tajweed
      ? { text_uthmani_tajweed: word.text_uthmani_tajweed }
      : {}),
    translation: {
      text: word.translation?.text ?? "",
      language_name: word.translation?.language_name ?? "english",
    },
    ...(word.transliteration?.text
      ? {
          transliteration: {
            text: word.transliteration.text,
            language_name: word.transliteration.language_name ?? "english",
          },
        }
      : {}),
  }
}

/** One page of verses (max 50). Khattab is merged in getVersesPage / getAllVerses. */
export async function getVerses(
  chapterId: number,
  translations: number[] = BUNDLE_TRANSLATION_IDS,
  page = 1,
): Promise<VersesResponse> {
  const apiTranslations = toApiTranslationIds(translations)
  const params = new URLSearchParams({
    words: "true",
    word_fields: WORD_FIELDS,
    fields: VERSE_FIELDS,
    per_page: String(VERSES_PER_PAGE),
    page: String(page),
  })
  if (apiTranslations.length > 0) {
    params.set("translations", apiTranslations.join(","))
  }
  const data = await apiFetch<VersesResponse>(
    `${VERSES_BASE_URL}/verses/by_chapter/${chapterId}?${params}`,
  )
  return { ...data, verses: data.verses.map(sanitizeVerse) }
}

/** One page with Clear Quran merge + slim wire payload — for progressive loading */
export const getVersesPage = cache(async (
  chapterId: number,
  page: number,
  translations: number[] = BUNDLE_TRANSLATION_IDS,
): Promise<{ verses: Verse[]; pagination: PaginationMeta }> => {
  const wantsKhattab = translations.includes(TRANSLATION_IDS.CLEAR_QURAN)

  const [data, khattab] = await Promise.all([
    getVerses(chapterId, translations, page),
    wantsKhattab ? getKhattabChapter(chapterId).catch(() => null) : null,
  ])

  const verses = khattab
    ? data.verses.map((v) => mergeKhattab(v, khattab))
    : data.verses

  return {
    verses: verses.map(slimVerse),
    pagination: data.pagination,
  }
})

/** All verses for a chapter — handles pagination and Khattab merge */
export const getAllVerses = cache(async (
  chapterId: number,
  translations: number[] = BUNDLE_TRANSLATION_IDS,
): Promise<Verse[]> => {
  const first = await getVersesPage(chapterId, 1, translations)

  let verses = first.verses
  if (first.pagination.total_pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: first.pagination.total_pages - 1 }, (_, i) =>
        getVersesPage(chapterId, i + 2, translations).then((r) => r.verses),
      ),
    )
    verses = [...first.verses, ...rest.flat()]
  }

  return verses
})

/** Single verse by key e.g. "2:255" */
export const getVerseByKey = cache(async (
  verseKey: string,
  translations: number[] = BUNDLE_TRANSLATION_IDS,
): Promise<Verse> => {
  const apiTranslations = toApiTranslationIds(translations)
  const params = new URLSearchParams({
    words: "true",
    word_fields: WORD_FIELDS,
    fields: VERSE_FIELDS,
  })
  if (apiTranslations.length > 0) {
    params.set("translations", apiTranslations.join(","))
  }

  const [chapterId] = verseKey.split(":")
  const wantsKhattab = translations.includes(TRANSLATION_IDS.CLEAR_QURAN)

  const [data, khattab] = await Promise.all([
    apiFetch<VerseResponse>(`${VERSES_BASE_URL}/verses/by_key/${verseKey}?${params}`),
    wantsKhattab ? getKhattabChapter(Number(chapterId)).catch(() => null) : null,
  ])

  const verse = sanitizeVerse(data.verse)
  return khattab ? mergeKhattab(verse, khattab) : verse
})
