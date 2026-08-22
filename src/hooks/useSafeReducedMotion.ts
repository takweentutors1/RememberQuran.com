"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

/**
 * `useReducedMotion` from framer-motion reads `matchMedia` on first render,
 * which is unknown during SSR. Branching JSX/props on it directly causes a
 * hydration mismatch: the server always renders as if motion is allowed, but
 * a client whose OS actually prefers reduced motion produces different
 * attributes (style, tabIndex) on its very first pass, before React can
 * reconcile.
 *
 * This defers the real value until after mount, so server and first-client
 * render always agree ("motion allowed"), and reduced motion kicks in one
 * tick later as an ordinary client-side re-render.
 */
export function useSafeReducedMotion(): boolean {
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  return mounted ? !!prefersReducedMotion : false
}
