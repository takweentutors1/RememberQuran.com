import * as React from "react"

const MOBILE_BREAKPOINT = 768
// docs/DESIGN-SYSTEM.md §6 — the reader is three columns at `lg` (1024px) and
// up; below that, side columns (nav, study panel) become overlays.
const DESKTOP_COLUMN_BREAKPOINT = 1024

function subscribe(breakpoint: number, mode: "max" | "min") {
  return (callback: () => void) => {
    const query =
      mode === "max"
        ? `(max-width: ${breakpoint - 1}px)`
        : `(min-width: ${breakpoint}px)`
    const mql = window.matchMedia(query)
    mql.addEventListener("change", callback)
    return () => mql.removeEventListener("change", callback)
  }
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe(MOBILE_BREAKPOINT, "max"),
    () => window.innerWidth < MOBILE_BREAKPOINT,
    getServerSnapshot,
  )
}

/** True at `lg` (1024px) and up — where side columns are laid out in-flow
 * instead of rendered as overlays. */
export function useIsDesktopColumn() {
  return React.useSyncExternalStore(
    subscribe(DESKTOP_COLUMN_BREAKPOINT, "min"),
    () => window.innerWidth >= DESKTOP_COLUMN_BREAKPOINT,
    getServerSnapshot,
  )
}
