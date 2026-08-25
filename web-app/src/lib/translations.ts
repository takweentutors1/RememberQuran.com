/**
 * Translation registry (M5 Phase 2).
 * Clear Quran (131) is CDN-only — never send that id to quran.com / QDC.
 */

export type TranslationDirection = "ltr" | "rtl"
export type TranslationSource = "api" | "cdn"

export interface TranslationResource {
  id: number
  name: string
  language: string
  /** BCP 47-ish tag for `lang` attribute */
  lang: string
  direction: TranslationDirection
  source: TranslationSource
  author?: string
}

/** Soft cap for simultaneous active translations in the reader */
export const MAX_ACTIVE_TRANSLATIONS = 3

export const TRANSLATION_IDS = {
  SAHEEH_INTERNATIONAL: 20,
  /** Internal ID — CDN-sourced, never sent to the quran.com API */
  CLEAR_QURAN: 131,
  ABDEL_HALEEM: 85,
  PICKTHALL: 19,
  YUSUF_ALI: 22,
  TAQI_USMANI: 84,
  HILALI_KHAN: 203,
  MAUDUDI: 95,
  BRIDGES: 149,
  JUNAGARHI: 54,
} as const

export const TRANSLATIONS: TranslationResource[] = [
  {
    id: TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
    name: "Saheeh International",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Saheeh International",
  },
  {
    id: TRANSLATION_IDS.CLEAR_QURAN,
    name: "The Clear Quran — Dr Mustafa Khattab",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "cdn",
    author: "Dr Mustafa Khattab",
  },
  {
    id: TRANSLATION_IDS.ABDEL_HALEEM,
    name: "M.A.S. Abdel Haleem",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Abdul Haleem",
  },
  {
    id: TRANSLATION_IDS.PICKTHALL,
    name: "M. Pickthall",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Mohammed Marmaduke William Pickthall",
  },
  {
    id: TRANSLATION_IDS.YUSUF_ALI,
    name: "A. Yusuf Ali",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Abdullah Yusuf Ali",
  },
  {
    id: TRANSLATION_IDS.TAQI_USMANI,
    name: "T. Usmani",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Mufti Taqi Usmani",
  },
  {
    id: TRANSLATION_IDS.HILALI_KHAN,
    name: "Al-Hilali & Khan",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Muhammad Taqi-ud-Din al-Hilali & Muhammad Muhsin Khan",
  },
  {
    id: TRANSLATION_IDS.MAUDUDI,
    name: "A. Maududi (Tafhim)",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Sayyid Abul Ala Maududi",
  },
  {
    id: TRANSLATION_IDS.BRIDGES,
    name: "Bridges’ translation",
    language: "English",
    lang: "en",
    direction: "ltr",
    source: "api",
    author: "Fadel Soliman",
  },
  {
    id: TRANSLATION_IDS.JUNAGARHI,
    name: "Maulana Muhammad Junagarhi",
    language: "Urdu",
    lang: "ur",
    direction: "rtl",
    source: "api",
    author: "Maulana Muhammad Junagarhi",
  },
]

export const DEFAULT_TRANSLATIONS = [
  TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
  TRANSLATION_IDS.CLEAR_QURAN,
]

/**
 * Full registry ids requested when loading a surah so the reader can switch
 * translations client-side without another network round-trip.
 */
export const BUNDLE_TRANSLATION_IDS = TRANSLATIONS.map((t) => t.id)

export const TRANSLATION_NAMES: Record<number, string> = Object.fromEntries(
  TRANSLATIONS.map((t) => [t.id, t.name]),
)

const BY_ID = new Map(TRANSLATIONS.map((t) => [t.id, t]))

export function getTranslation(id: number): TranslationResource | undefined {
  return BY_ID.get(id)
}

export function isRegisteredTranslationId(id: number): boolean {
  return BY_ID.has(id)
}

export function getTranslationName(id: number): string {
  return BY_ID.get(id)?.name ?? "Translation"
}

/** Ids safe to pass to QDC / quran.com translation query params */
export function toApiTranslationIds(ids: number[]): number[] {
  return ids.filter((id) => {
    const t = BY_ID.get(id)
    return t && t.source === "api"
  })
}

export function translationsByLanguage(): {
  language: string
  items: TranslationResource[]
}[] {
  const order: string[] = []
  const map = new Map<string, TranslationResource[]>()
  for (const t of TRANSLATIONS) {
    if (!map.has(t.language)) {
      map.set(t.language, [])
      order.push(t.language)
    }
    map.get(t.language)!.push(t)
  }
  return order.map((language) => ({ language, items: map.get(language)! }))
}
