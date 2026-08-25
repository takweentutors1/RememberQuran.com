/**
 * Media Maker presets + helpers — client-safe (no Mongoose / Node APIs).
 */

export const MEDIA_PRESETS = [
  {
    id: "jade",
    label: "Jade",
    background: "linear-gradient(145deg, #0e6b57 0%, #094a3c 100%)",
    foreground: "#fdfbf6",
    muted: "rgba(253, 251, 246, 0.7)",
    accent: "#d8bc7e",
  },
  {
    id: "gold",
    label: "Gold",
    background: "linear-gradient(145deg, #d8bc7e 0%, #b89b58 100%)",
    foreground: "#0b0a08",
    muted: "rgba(11, 10, 8, 0.6)",
    accent: "#0e6b57",
  },
] as const

export type MediaPresetId = (typeof MEDIA_PRESETS)[number]["id"]

export function getMediaPreset(id: string | null | undefined) {
  return MEDIA_PRESETS.find((p) => p.id === id) ?? MEDIA_PRESETS[0]
}

export function isMediaPresetId(id: unknown): id is MediaPresetId {
  return typeof id === "string" && MEDIA_PRESETS.some((p) => p.id === id)
}

/** Strip HTML entities/tags from API translation text. */
export function plainTranslation(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  const candidate = text.slice(0, max - 1).trimEnd()
  const lastSpace = candidate.lastIndexOf(" ")
  const boundary = lastSpace > max * 0.7 ? lastSpace : candidate.length
  return `${candidate.slice(0, boundary).trimEnd()}…`
}

export function arabicFontSize(charCount: number): number {
  if (charCount > 280) return 36
  if (charCount > 180) return 44
  if (charCount > 100) return 52
  return 64
}
