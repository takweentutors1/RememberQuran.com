"use client"

import { useLayoutEffect, useRef, useState, type ReactNode, type ComponentPropsWithoutRef } from "react"

/**
 * Wraps one printed Mushaf line rendered in QCF glyphs. QCF fonts pre-shape
 * every word's advance width for one canonical page width, so the rendered
 * line only comes out flush-both-edges if it happens to render at exactly
 * that width — any other container width leaves a gap or overflows.
 *
 * Rather than hand-tuning font-size-per-breakpoint to match the font's
 * canonical width (fragile, and only right at a few fixed sizes), this
 * measures the line's natural width and applies a horizontal `scaleX` to
 * fit the container exactly, at any width. `scaleX` only stretches/
 * compresses — unlike `overflow: hidden`, it can never clip a glyph.
 */
export function QcfLine({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"div"> & { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scaleX, setScaleX] = useState(1)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const measure = () => {
      const natural = inner.scrollWidth
      const available = outer.clientWidth
      if (natural > 0 && available > 0) setScaleX(available / natural)
    }

    // Reset to 1 before measuring so a stale scale doesn't feed back into
    // scrollWidth (a scaled element's own scrollWidth is still its
    // unscaled content width, but this keeps the measurement unambiguous
    // across re-renders with different children).
    setScaleX(1)
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    // The glyph font can finish loading/swapping after first paint —
    // re-measure once it settles so the fallback-font measurement doesn't stick.
    document.fonts?.ready?.then(measure)

    return () => ro.disconnect()
  }, [children])

  return (
    <div ref={outerRef} className={className} {...rest}>
      <div
        ref={innerRef}
        dir="rtl"
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          transform: `scaleX(${scaleX})`,
          transformOrigin: "right center",
        }}
      >
        {children}
      </div>
    </div>
  )
}
