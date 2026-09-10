"use client"

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useSurahContent } from "@/context/SurahContentContext"
import {
  DEFAULT_TRANSLATIONS,
  isRegisteredTranslationId,
  MAX_ACTIVE_TRANSLATIONS,
} from "@/lib/translations"
import { DEFAULT_TAFSIR_SLUG, isTafsirSlug } from "@/lib/studyApi"
import {
  type QuranFont,
  type FontScale,
  DEFAULT_ARABIC_SCALE,
  DEFAULT_TRANSLATION_SCALE,
  ARABIC_FONT_SIZES,
  READING_MODE_ARABIC_FONT_SIZES,
  TRANSLATION_FONT_SIZES,
  QURAN_FONT_FAMILY,
  MIN_FONT_SCALE,
  MAX_FONT_SCALE,
} from "@/lib/readerFonts"
import {
  type HideArabicRange,
  getAyahCount,
  isAyahInHideRange,
} from "@/lib/quran/verse-key"

/** verse = translation/verse-by-verse view; reading = continuous Arabic (mushaf-like); card = verse-card grid */
export type DisplayMode = "verse" | "reading"


/** @deprecated Use FontScale — kept for migration from older localStorage */
export type FontSize = "small" | "medium" | "large" | "xlarge"

export interface ReaderSettings {
  quranFont: QuranFont
  arabicFontScale: FontScale
  translationFontScale: FontScale
  displayMode: DisplayMode
  activeTranslations: number[]
  showTranslation: boolean
  /** Active tafsir book (M3) — must be a slug from TAFSIR_RESOURCES */
  tafsirSlug: string
  /** Tajweed colour coding toggle (M3) — default false */
  tajweedEnabled: boolean
  /** Memorisation: blur Arabic until tapped (M5) — default false */
  hideArabic: boolean
  /** Auto-load the next surah as the reader scrolls to the bottom — default false */
  infiniteScroll: boolean
}

interface ReaderSettingsContextValue extends ReaderSettings {
  setQuranFont: (font: QuranFont) => void
  setArabicFontScale: (scale: FontScale) => void
  setTranslationFontScale: (scale: FontScale) => void
  increaseArabicFontScale: () => void
  decreaseArabicFontScale: () => void
  increaseTranslationFontScale: () => void
  decreaseTranslationFontScale: () => void
  setDisplayMode: (mode: DisplayMode) => void
  setActiveTranslations: (ids: number[]) => void
  toggleTranslation: (id: number) => void
  setShowTranslation: (show: boolean) => void
  setTafsirSlug: (slug: string) => void
  setTajweedEnabled: (enabled: boolean) => void
  setHideArabic: (enabled: boolean) => void
  setInfiniteScroll: (enabled: boolean) => void
  /**
   * Session-only: when hide Arabic is on, limit blur to this inclusive range.
   * null = whole surah (default).
   */
  hideArabicRange: HideArabicRange | null
  setHideArabicRange: (range: HideArabicRange | null) => void
  /** Session-only: ayahs revealed while hide mode is on */
  isVerseRevealed: (verseKey: string) => boolean
  toggleVerseReveal: (verseKey: string) => void
  /** Whether this verse is inside the active hide scope (always true if no range). */
  isVerseInHideScope: (verseKey: string) => boolean
  /**
   * Reveal every ayah in the current hide scope. In "All ayahs" scope this
   * spans every surah infinite scroll has appended, up to `latestSurahId`.
   */
  revealAllInHideScope: (surahId: number, maxAyah: number, latestSurahId?: number | null) => void
  /** Re-hide every ayah currently in the hide scope. */
  hideAllInHideScope: (surahId: number) => void
  arabicFontSize: string
  readingModeArabicFontSize: string
  translationFontSize: string
  arabicFontFamily: string
}

const LEGACY_SIZE_MAP: Record<FontSize, FontScale> = {
  small: 2,
  medium: 3,
  large: 4,
  xlarge: 5,
}


const DEFAULT_SETTINGS: ReaderSettings = {
  quranFont: "uthmani",
  arabicFontScale: DEFAULT_ARABIC_SCALE,
  translationFontScale: DEFAULT_TRANSLATION_SCALE,
  displayMode: "reading",
  activeTranslations: DEFAULT_TRANSLATIONS,
  showTranslation: true,
  tafsirSlug: DEFAULT_TAFSIR_SLUG,
  tajweedEnabled: false,
  hideArabic: false,
  infiniteScroll: true,
}

function clampScale(n: number): FontScale {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, n)) as FontScale
}

/**
 * Pre-QA-fix builds stored transliteration id 57 as part of the default pair
 * (131 + 57, both mislabeled). 57 present → user had the old default; reset
 * to the corrected pair. Otherwise keep only registered translation ids (cap 3).
 */
function migrateActiveTranslations(raw: unknown): number[] {
  if (!Array.isArray(raw)) return DEFAULT_TRANSLATIONS
  const ids = raw.filter((id): id is number => typeof id === "number")
  if (ids.includes(57)) return DEFAULT_TRANSLATIONS
  const valid = ids.filter(isRegisteredTranslationId)
  if (ids.length > 0 && valid.length === 0) return DEFAULT_TRANSLATIONS
  return valid.slice(0, MAX_ACTIVE_TRANSLATIONS)
}

function migrateSettings(raw: unknown): ReaderSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS
  const s = raw as Record<string, unknown>

  let arabicFontScale = DEFAULT_ARABIC_SCALE
  let translationFontScale = DEFAULT_TRANSLATION_SCALE

  if (typeof s.arabicFontScale === "number") {
    arabicFontScale = clampScale(s.arabicFontScale)
  } else if (typeof s.fontSize === "string" && s.fontSize in LEGACY_SIZE_MAP) {
    arabicFontScale = LEGACY_SIZE_MAP[s.fontSize as FontSize]
    translationFontScale = arabicFontScale
  }

  if (typeof s.translationFontScale === "number") {
    translationFontScale = clampScale(s.translationFontScale)
  }

  const quranFont =
    s.quranFont === "KFGQPC Hafs V2" || s.quranFont === "amiri" || s.quranFont === "uthmani"
      ? s.quranFont
      : DEFAULT_SETTINGS.quranFont

  const displayMode =
    s.displayMode === "reading" || s.displayMode === "verse"
      ? s.displayMode
      : DEFAULT_SETTINGS.displayMode

  return {
    quranFont,
    arabicFontScale,
    translationFontScale,
    displayMode,
    activeTranslations: migrateActiveTranslations(s.activeTranslations),
    showTranslation:
      typeof s.showTranslation === "boolean"
        ? s.showTranslation
        : DEFAULT_SETTINGS.showTranslation,
    // Pre-M3 payloads have no tafsirSlug; unknown slugs (removed books) reset
    tafsirSlug:
      typeof s.tafsirSlug === "string" && isTafsirSlug(s.tafsirSlug)
        ? s.tafsirSlug
        : DEFAULT_SETTINGS.tafsirSlug,
    tajweedEnabled:
      typeof s.tajweedEnabled === "boolean"
        ? s.tajweedEnabled
        : DEFAULT_SETTINGS.tajweedEnabled,
    hideArabic:
      typeof s.hideArabic === "boolean"
        ? s.hideArabic
        : DEFAULT_SETTINGS.hideArabic,
    infiniteScroll:
      typeof s.infiniteScroll === "boolean"
        ? s.infiniteScroll
        : DEFAULT_SETTINGS.infiniteScroll,
  }
}

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | null>(
  null,
)

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const { surahId } = useSurahContent()
  const [raw, setRaw] = useLocalStorage<unknown>(
    "rq-reader-settings",
    DEFAULT_SETTINGS,
  )
  const settings = migrateSettings(raw)
  const [revealedVerseKeys, setRevealedVerseKeys] = useState(
    () => new Set<string>(),
  )
  const [hideArabicRange, setHideArabicRangeState] = useState<HideArabicRange | null>(
    null,
  )
  const prevSurahIdRef = useRef<number | null>(null)

  // Surah change: drop range + reveals (ayah counts / keys are surah-specific)
  useEffect(() => {
    const prev = prevSurahIdRef.current
    if (prev !== null && surahId !== null && prev !== surahId) {
      setHideArabicRangeState(null)
      setRevealedVerseKeys(new Set())
    }
    prevSurahIdRef.current = surahId
  }, [surahId])

  const setSettings = useCallback(
    (updater: (prev: ReaderSettings) => ReaderSettings) => {
      setRaw((prev: unknown) => updater(migrateSettings(prev)))
    },
    [setRaw],
  )

  const setQuranFont = useCallback(
    (quranFont: QuranFont) => setSettings((p) => ({ ...p, quranFont })),
    [setSettings],
  )

  const setArabicFontScale = useCallback(
    (arabicFontScale: FontScale) =>
      setSettings((p) => ({ ...p, arabicFontScale: clampScale(arabicFontScale) })),
    [setSettings],
  )

  const setTranslationFontScale = useCallback(
    (translationFontScale: FontScale) =>
      setSettings((p) => ({
        ...p,
        translationFontScale: clampScale(translationFontScale),
      })),
    [setSettings],
  )

  const increaseArabicFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        arabicFontScale: clampScale(p.arabicFontScale + 1),
      })),
    [setSettings],
  )

  const decreaseArabicFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        arabicFontScale: clampScale(p.arabicFontScale - 1),
      })),
    [setSettings],
  )

  const increaseTranslationFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        translationFontScale: clampScale(p.translationFontScale + 1),
      })),
    [setSettings],
  )

  const decreaseTranslationFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        translationFontScale: clampScale(p.translationFontScale - 1),
      })),
    [setSettings],
  )

  const setDisplayMode = useCallback(
    (displayMode: DisplayMode) => setSettings((p) => ({ ...p, displayMode })),
    [setSettings],
  )

  const setActiveTranslations = useCallback(
    (activeTranslations: number[]) =>
      setSettings((p) => ({
        ...p,
        activeTranslations: activeTranslations
          .filter(isRegisteredTranslationId)
          .slice(0, MAX_ACTIVE_TRANSLATIONS),
      })),
    [setSettings],
  )

  const toggleTranslation = useCallback(
    (id: number) =>
      setSettings((p) => {
        if (!isRegisteredTranslationId(id)) return p
        if (p.activeTranslations.includes(id)) {
          return {
            ...p,
            activeTranslations: p.activeTranslations.filter((t) => t !== id),
          }
        }
        if (p.activeTranslations.length >= MAX_ACTIVE_TRANSLATIONS) return p
        return {
          ...p,
          activeTranslations: [...p.activeTranslations, id],
        }
      }),
    [setSettings],
  )

  const setShowTranslation = useCallback(
    (showTranslation: boolean) =>
      setSettings((p) => ({ ...p, showTranslation })),
    [setSettings],
  )

  const setTafsirSlug = useCallback(
    (tafsirSlug: string) =>
      setSettings((p) =>
        isTafsirSlug(tafsirSlug) ? { ...p, tafsirSlug } : p,
      ),
    [setSettings],
  )

  const setTajweedEnabled = useCallback(
    (tajweedEnabled: boolean) =>
      setSettings((p) => ({ ...p, tajweedEnabled })),
    [setSettings],
  )

  const setHideArabic = useCallback(
    (hideArabic: boolean) => {
      setSettings((p) => ({ ...p, hideArabic }))
      if (!hideArabic) setRevealedVerseKeys(new Set())
    },
    [setSettings],
  )

  const setInfiniteScroll = useCallback(
    (infiniteScroll: boolean) => setSettings((p) => ({ ...p, infiniteScroll })),
    [setSettings],
  )

  const setHideArabicRange = useCallback((range: HideArabicRange | null) => {
    setHideArabicRangeState(range)
  }, [])

  const isVerseRevealed = useCallback(
    (verseKey: string) => revealedVerseKeys.has(verseKey),
    [revealedVerseKeys],
  )

  const isVerseInHideScope = useCallback(
    (verseKey: string) => {
      const ayah = Number(verseKey.split(":")[1])
      if (!Number.isInteger(ayah) || ayah < 1) return false
      return isAyahInHideRange(ayah, hideArabicRange)
    },
    [hideArabicRange],
  )

  const toggleVerseReveal = useCallback((verseKey: string) => {
    setRevealedVerseKeys((prev) => {
      const next = new Set(prev)
      if (next.has(verseKey)) next.delete(verseKey)
      else next.add(verseKey)
      return next
    })
  }, [])

  // With infinite scroll, more than one surah can be on screen at once. A
  // fixed ayah Range is always scoped to the base surah (ranges are
  // surah-relative), but "All ayahs" scope means everything currently
  // loaded — so it must span every appended surah, not just the base one.
  const revealAllInHideScope = useCallback(
    (sid: number, maxAyah: number, latestSid?: number | null) => {
      if (hideArabicRange) {
        setRevealedVerseKeys((prev) => {
          const next = new Set(prev)
          for (let a = hideArabicRange.start; a <= hideArabicRange.end; a++) {
            next.add(`${sid}:${a}`)
          }
          return next
        })
        return
      }
      const endSid = Math.max(sid, latestSid ?? sid)
      setRevealedVerseKeys((prev) => {
        const next = new Set(prev)
        for (let s = sid; s <= endSid; s++) {
          const count = s === sid ? maxAyah : (getAyahCount(s) ?? 0)
          for (let a = 1; a <= count; a++) next.add(`${s}:${a}`)
        }
        return next
      })
    },
    [hideArabicRange],
  )

  const hideAllInHideScope = useCallback(
    (sid: number) => {
      if (hideArabicRange) {
        setRevealedVerseKeys((prev) => {
          const next = new Set(prev)
          for (let a = hideArabicRange.start; a <= hideArabicRange.end; a++) {
            next.delete(`${sid}:${a}`)
          }
          return next
        })
        return
      }
      // "All ayahs" scope covers the whole session, regardless of how many
      // surahs infinite scroll has appended — clearing every revealed key
      // hides all of them without needing to enumerate each surah.
      setRevealedVerseKeys(new Set())
    },
    [hideArabicRange],
  )

  return (
    <ReaderSettingsContext.Provider
      value={{
        ...settings,
        setQuranFont,
        setArabicFontScale,
        setTranslationFontScale,
        increaseArabicFontScale,
        decreaseArabicFontScale,
        increaseTranslationFontScale,
        decreaseTranslationFontScale,
        setDisplayMode,
        setActiveTranslations,
        toggleTranslation,
        setShowTranslation,
        setTafsirSlug,
        setTajweedEnabled,
        setHideArabic,
        setInfiniteScroll,
        hideArabicRange,
        setHideArabicRange,
        isVerseRevealed,
        toggleVerseReveal,
        isVerseInHideScope,
        revealAllInHideScope,
        hideAllInHideScope,
        arabicFontSize: ARABIC_FONT_SIZES[settings.arabicFontScale],
        readingModeArabicFontSize: READING_MODE_ARABIC_FONT_SIZES[settings.arabicFontScale],
        translationFontSize: TRANSLATION_FONT_SIZES[settings.translationFontScale],
        arabicFontFamily: QURAN_FONT_FAMILY[settings.quranFont],
      }}
    >
      {children}
    </ReaderSettingsContext.Provider>
  )
}

export function useReaderSettings() {
  const ctx = useContext(ReaderSettingsContext)
  if (!ctx)
    throw new Error(
      "useReaderSettings must be used within ReaderSettingsProvider",
    )
  return ctx
}

/** Legacy class maps — prefer CSS variables from QuranReader */
export const FONT_SIZE_ARABIC = {
  small: "text-[1.375rem]",
  medium: "text-[1.625rem]",
  large: "text-[1.875rem]",
  xlarge: "text-[2.125rem]",
} as const

export const FONT_SIZE_TRANSLATION = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
} as const
