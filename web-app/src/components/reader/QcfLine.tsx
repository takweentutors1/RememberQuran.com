"use client"

import { useLayoutEffect, useRef, useState, type ReactNode, type ComponentPropsWithoutRef } from "react"

interface QcfLineProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  /** False for a genuinely short trailing line (e.g. the last line before a
   * surah divider) — renders it at the page's natural font-size, centered,
   * instead of force-fitting it to the full width. A 2-3 word line blown up
   * to span the whole page looks wrong; real Mushaf typesetting centers it. */
  justify?: boolean
}

/**
 * Wraps one printed Mushaf line rendered in QCF glyphs. QCF fonts pre-shape
 * every word's advance width for one canonical page width, so the rendered
 * line only comes out flush-both-edges if it happens to render at exactly
 * that width — any other container width leaves a gap or overflows.
 *
 * Fits by adjusting `font-size`, not a `transform: scaleX`. A transform
 * stretches horizontally only, distorting the font's own pre-shaped
 * kashida/letter-spacing — visually, words start crowding into each other
 * once the ratio drifts far from 1. Scaling `font-size` instead resizes the
 * whole glyph proportionally (exactly like reading the same page printed
 * bigger or smaller), so every letterform's real proportions are preserved
 * at any container width.
 */
export function QcfLine({ children, className, justify = true, ...rest }: QcfLineProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [fontScale, setFontScale] = useState(1)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const measure = () => {
      if (!justify) {
        inner.style.fontSize = "100%"
        setFontScale(1)
        return
      }

      // Reset to the unscaled baseline before measuring — unlike a
      // transform, font-size changes the box's own layout width, so last
      // render's ratio would otherwise compound into this one.
      inner.style.fontSize = "100%"
      const natural = inner.scrollWidth
      const available = outer.clientWidth
      if (natural > 0 && available > 0) {
        const ratio = available / natural
        inner.style.fontSize = `${ratio * 100}%`
        setFontScale(ratio)
      }
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    // The glyph font can finish loading/swapping after first paint —
    // re-measure once it settles so the fallback-font measurement doesn't stick.
    document.fonts?.ready?.then(measure)

    return () => ro.disconnect()
  }, [children, justify])

  return (
    <div
      ref={outerRef}
      className={className}
      style={justify ? undefined : { textAlign: "center" }}
      {...rest}
    >
      <div
        ref={innerRef}
        dir="rtl"
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          fontSize: `${fontScale * 100}%`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
