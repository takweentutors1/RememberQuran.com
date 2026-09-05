import { Fragment, type ReactNode } from "react"

/**
 * Arabic Small High Rounded Zero (silent-alif mark, e.g. وَتَوَاصَوْا۟).
 *
 * UthmanicHafs (all versions — v1.8 through the King Fahd Complex's own
 * v2.2) classifies this glyph as a spacing base glyph rather than a
 * combining mark, so it renders at nearly full letter size instead of as a
 * small raised dot. Isolating it in its own inline element lets us shrink
 * and raise it with CSS.
 *
 * That's only safe where nothing needs to cursively join through it. ~94%
 * of occurrences in the mushaf are word-final (followed by whitespace), but
 * ~6% sit mid-word — most commonly in أُو۟لَـٰٓئِكَ — where splitting the
 * DOM text node risks breaking Arabic letter-joining shaping across the
 * boundary. Those are left untouched.
 */
const SILENT_ALIF_MARK = "۟"
const SAFE_TO_ISOLATE = new RegExp(`(${SILENT_ALIF_MARK})(?=\\s|$)`, "g")

export function renderUthmaniText(text: string): ReactNode {
  const parts = text.split(SAFE_TO_ISOLATE)
  if (parts.length === 1) return text

  return parts.map((part, i) =>
    part === SILENT_ALIF_MARK ? (
      <span key={i} className="silent-alif-mark">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
