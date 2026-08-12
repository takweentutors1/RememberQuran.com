"use client"

import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(hover: none)")
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.matchMedia("(hover: none)").matches
}

function getServerSnapshot() {
  return false
}

export function useIsTouch() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
