"use client"

import { useCallback, useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

/**
 * Press ripple driven imperatively — the span is created, animated, and
 * removed outside React so a press never triggers a render.
 *
 * The host element must carry the `ripple-host` utility (position: relative
 * + overflow: hidden). See docs/DESIGN-SYSTEM.md §4.
 *
 * Respects `prefers-reduced-motion`: the ripple is skipped entirely rather
 * than being played at 0.01ms, which would still churn the DOM.
 */
export function useRipple<T extends HTMLElement = HTMLButtonElement>() {
  const cleanupRef = useRef<number | null>(null)

  const onPointerDown = useCallback((event: ReactPointerEvent<T>) => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const host = event.currentTarget
    const rect = host.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)

    const ink = document.createElement("span")
    ink.className = "ripple-ink"
    ink.style.width = `${size}px`
    ink.style.height = `${size}px`
    ink.style.left = `${event.clientX - rect.left - size / 2}px`
    ink.style.top = `${event.clientY - rect.top - size / 2}px`
    ink.addEventListener("animationend", () => ink.remove(), { once: true })

    host.appendChild(ink)

    // Belt and braces: if animationend never fires (element unmounted mid
    // animation, tab backgrounded), sweep the node anyway.
    if (cleanupRef.current) window.clearTimeout(cleanupRef.current)
    cleanupRef.current = window.setTimeout(() => ink.remove(), 800)
  }, [])

  return { onPointerDown }
}
