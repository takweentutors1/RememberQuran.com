import { useEffect, useState } from "react"
import { loadQcfPageFont, qcfFontFamily } from "@/lib/qcfFonts"

/**
 * Loads the QCF v2 glyph font for one Mushaf page and returns its
 * font-family name once ready, or `null` while loading / on failure — in
 * both of the latter cases callers should keep rendering the Unicode
 * fallback rather than block on the network.
 *
 * Pass `enabled: false` to defer the fetch (e.g. until the page is near the
 * viewport) — a surah can span dozens of Mushaf pages, and font-loading all
 * of them on mount defeats the point of a per-page font scheme.
 */
export function useQcfPageFont(pageNumber: number, enabled = true): string | null {
  // Keyed by the page it resolved for — if `pageNumber` changes before this
  // fires, the stale result is simply ignored below rather than requiring a
  // synchronous reset inside the effect.
  const [resolved, setResolved] = useState<{ pageNumber: number; ok: boolean } | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    loadQcfPageFont(pageNumber).then((ok) => {
      if (!cancelled) setResolved({ pageNumber, ok })
    })
    return () => {
      cancelled = true
    }
  }, [pageNumber, enabled])

  const ready = resolved?.pageNumber === pageNumber && resolved.ok
  return ready ? qcfFontFamily(pageNumber) : null
}
