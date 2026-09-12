/** Reader typography — aligned with quran.com scale steps (simplified 1–6). */

export type QuranFont = "uthmani" | "KFGQPC Hafs V2" | "amiri"
export type FontScale = 1 | 2 | 3 | 4 | 5 | 6

export const QURAN_FONT_OPTIONS: {
  value: QuranFont
  label: string
  description: string
}[] = [
  {
    value: "uthmani",
    label: "Uthmanic Hafs",
    description: "King Fahd Complex — Madani mushaf",
  },
  {
    value: "KFGQPC Hafs V2",
    label: "King Fahd Complex V2",
    description: "KFGQPC Hafs V2 — Digital Nastaleeq & Naskh",
  },
]

export const FONT_SCALE_LABELS: Record<FontScale, string> = {
  1: "XS",
  2: "S",
  3: "M",
  4: "L",
  5: "XL",
  6: "2XL",
}

export const ARABIC_FONT_SIZES: Record<FontScale, string> = {
  1: "1.5rem",
  2: "1.875rem",
  3: "2.25rem",
  4: "2.75rem",
  5: "3.25rem",
  6: "3.75rem",
}

/** Reading mode (15-line Mushaf manuscript) font sizes in rem. QcfLine fits
 * every line to its container by measuring and scaling it (see
 * QcfLine.tsx), so these can stay large and bold — the line is compressed
 * to fit rather than needing to be pre-shrunk to avoid wrapping. */
export const READING_MODE_ARABIC_FONT_SIZES: Record<FontScale, string> = {
  1: "1.7rem",
  2: "1.9rem",
  3: "2.1rem",
  4: "2.3rem",
  5: "2.5rem",
  6: "2.7rem",
}

export const TRANSLATION_FONT_SIZES: Record<FontScale, string> = {
  1: "0.8125rem",
  2: "0.875rem",
  3: "1rem",
  4: "1.125rem",
  5: "1.25rem",
  6: "1.375rem",
}

export const QURAN_FONT_FAMILY: Record<QuranFont, string> = {
  uthmani: '"UthmanicHafs", "KFGQPC Uthmanic Hafs", serif',
  "KFGQPC Hafs V2": '"KFGQPC_HAFS_V2", "UthmanicHafs", serif',
  amiri: '"KFGQPC_HAFS_V2", "UthmanicHafs", serif',
}

export const MIN_FONT_SCALE = 1 as FontScale
export const MAX_FONT_SCALE = 6 as FontScale
export const DEFAULT_ARABIC_SCALE = 1 as FontScale
export const DEFAULT_TRANSLATION_SCALE = 3 as FontScale
