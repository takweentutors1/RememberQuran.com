/** A tafsir book available in the study panel (registry lives in studyApi.ts) */
export interface TafsirResource {
  /** quran.com resource id (e.g. 169 for Ibn Kathir EN) */
  id: number
  /** QDC slug used in API paths — note upstream typos are canonical */
  slug: string
  name: string
  author: string
  language: string
}

/** Sanitized tafsir passage for one ayah (may cover several grouped ayahs) */
export interface TafsirContent {
  slug: string
  resourceName: string
  /** HTML sanitized server-side in /api/tafsir — safe to inject */
  text: string
  /** Every verse_key this passage covers, e.g. ["2:285", "2:286"] */
  coveredKeys: string[]
}

/** Cleaned Asbab al-Nuzul entry — null when the ayah has no recorded reason */
export interface AsbabContent {
  text: string | null
}

// ── Search ────────────────────────────────────────────────────────────────────

/** One Arabic word from a search result — highlight=true means it matched */
export interface SearchWord {
  text: string
  highlight: boolean
}

/** One translation row in a search result (text may contain <em> highlights) */
export interface SearchTranslation {
  resource_id: number
  text: string
}

export interface SearchResult {
  verse_key: string
  chapter_id: number
  verse_number: number
  words: SearchWord[]
  translations: SearchTranslation[]
}

/** Normalised search response returned by /api/search */
export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  currentPage: number
  nextPage: number | null
}

// ── Morphology ────────────────────────────────────────────────────────────────

export interface MorphologyEntry {
  /** Corpus POS tag, e.g. "N", "V", "P", "CONJ", "PRON" */
  pos: string
  /** Arabic lemma */
  lemma: string
  /** Arabic root letters (converted from Buckwalter at build time) */
  root: string
  /** Original Buckwalter root, shown as secondary reference */
  rootLatin: string
  /** Human-readable feature strings, e.g. ["Masculine", "Genitive", "Singular"] */
  features: string[]
}

// ── Raw QDC shapes (used server-side only) ────────────────────────────────────

/** Raw QDC response shape for /tafsirs/{slug}/by_ayah/{verse_key} */
export interface QdcTafsirResponse {
  tafsir?: {
    verses?: Record<string, unknown>
    resource_id?: number
    resource_name?: string
    slug?: string
    text?: string
  }
}
