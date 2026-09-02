/**
 * Media Maker presets + helpers — client-safe (no Mongoose / Node APIs).
 */

export const MEDIA_PRESETS = [
  {
    id: "minimal",
    label: "Minimal",
    background: "linear-gradient(145deg, #FAF8F5 0%, #F3EFEA 100%)",
    foreground: "#1C1917",
    muted: "rgba(28, 25, 23, 0.65)",
    accent: "#8C6D38",
  },
  {
    id: "gold",
    label: "Gold Illuminated",
    background: "linear-gradient(145deg, #261F14 0%, #15110B 100%)",
    foreground: "#F7EEDB",
    muted: "rgba(247, 238, 219, 0.75)",
    accent: "#D4AF37",
  },
  {
    id: "dark-modern",
    label: "Dark Modern",
    background: "linear-gradient(145deg, #18181B 0%, #09090B 100%)",
    foreground: "#FAFAFA",
    muted: "rgba(250, 250, 250, 0.65)",
    accent: "#38BDF8",
  },
  {
    id: "jade",
    label: "Jade",
    background: "linear-gradient(145deg, #0e6b57 0%, #094a3c 100%)",
    foreground: "#fdfbf6",
    muted: "rgba(253, 251, 246, 0.7)",
    accent: "#d8bc7e",
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
