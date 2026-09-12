/**
 * QCF (Quran Complex Font) v2 — one pre-shaped glyph font per Madani Mushaf
 * page (604 pages), hosted on the Quran Foundation CDN. Each word's
 * `code_v2` is a single private-use-area codepoint whose glyph, in that
 * page's font, is already kerned/kashida-stretched to its exact position on
 * the printed line — this is what makes real flush-both-edges Mushaf
 * justification possible (CSS text-justify cannot do this on its own).
 *
 * Fonts are fetched directly from Quran Foundation's CDN rather than
 * bundled: they're periodically corrected/improved, and 604 files is too
 * much to ship upfront regardless — see loadQcfPageFont's lazy, per-page,
 * cached loading.
 */

const QCF_VERSION = "v2"
const QCF_FONT_BASE = `https://verses.quran.foundation/fonts/quran/hafs/${QCF_VERSION}/woff2`

export function qcfFontFamily(pageNumber: number): string {
  return `qcf-${QCF_VERSION}-p${pageNumber}`
}

// Network Information API — Chromium/Android only, absent in Firefox/Safari.
// Feature-detected, not relied on: everything here degrades to "just load
// it" when the API isn't available, which is the correct default.
interface NetworkInformation {
  saveData?: boolean
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g"
}

/**
 * True when the user has Data Saver on, or is on a connection slow enough
 * that a ~15-40KB font-per-page fetch isn't worth it — the Unicode fallback
 * (already downloaded as part of the app shell) reads perfectly well, just
 * without the pixel-exact printed-Mushaf justification.
 */
function shouldSkipForNetwork(): boolean {
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation }
  ).connection
  if (!connection) return false
  if (connection.saveData) return true
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g"
}

const loadPromises = new Map<number, Promise<boolean>>()

/**
 * Loads and registers the glyph font for one Mushaf page. Resolves `true`
 * once the font is ready to use, `false` if the fetch/parse failed (callers
 * should keep rendering the Unicode fallback in that case). Safe to call
 * repeatedly for the same page — subsequent calls reuse the in-flight or
 * settled promise.
 */
export function loadQcfPageFont(pageNumber: number): Promise<boolean> {
  if (typeof document === "undefined" || typeof FontFace === "undefined") {
    return Promise.resolve(false)
  }

  const cached = loadPromises.get(pageNumber)
  if (cached) return cached

  if (shouldSkipForNetwork()) {
    const skipped = Promise.resolve(false)
    loadPromises.set(pageNumber, skipped)
    return skipped
  }

  const family = qcfFontFamily(pageNumber)
  const promise = (async () => {
    try {
      const fontFace = new FontFace(family, `url(${QCF_FONT_BASE}/p${pageNumber}.woff2)`)
      fontFace.display = "swap"
      await fontFace.load()
      document.fonts.add(fontFace)
      return true
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[qcfFonts] failed to load page ${pageNumber}:`, err)
      }
      return false
    }
  })()

  loadPromises.set(pageNumber, promise)
  return promise
}
