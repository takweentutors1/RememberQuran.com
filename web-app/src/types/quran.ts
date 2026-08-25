export interface TranslatedName {
  language_name: string
  name: string
}

export interface Chapter {
  id: number
  revelation_place: "makkah" | "madinah"
  revelation_order: number
  bismillah_pre: boolean
  name_simple: string
  name_complex: string
  name_arabic: string
  verses_count: number
  pages: [number, number]
  translated_name: TranslatedName
}

export interface WordTranslation {
  text: string
  language_name: string
}

export type WordCharType = "word" | "end" | "pause" | "sajdah" | "rubel_hizb"

export interface Word {
  id: number
  position: number
  audio_url: string | null
  char_type_name: WordCharType
  text_uthmani: string
  /** QPC Hafs encoding — matches the KFGQPC UthmanicHafs font */
  qpc_uthmani_hafs?: string
  /** Per-word tajweed markup — `<rule class=ham_wasl>ٱ</rule>…` with unquoted attrs */
  text_uthmani_tajweed?: string
  translation: WordTranslation
  transliteration?: WordTranslation
}

export interface VerseTranslation {
  resource_id: number
  text: string
}

export interface Verse {
  id: number
  verse_number: number
  verse_key: string
  page_number: number
  juz_number: number
  hizb_number: number
  text_uthmani: string
  /** QPC Hafs encoding — matches the KFGQPC UthmanicHafs font */
  qpc_uthmani_hafs?: string
  words: Word[]
  translations: VerseTranslation[]
}

export interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

export interface ChaptersResponse {
  chapters: Chapter[]
}

export interface ChapterResponse {
  chapter: Chapter
}

export interface VersesResponse {
  verses: Verse[]
  pagination: PaginationMeta
}

export interface VerseResponse {
  verse: Verse
}
