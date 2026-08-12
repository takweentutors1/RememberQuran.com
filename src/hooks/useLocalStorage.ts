"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

type Listener = () => void
const listeners = new Map<string, Set<Listener>>()

function notify(key: string): void {
  listeners.get(key)?.forEach((listener) => listener())
}

function getServerSnapshot(): string | null {
  return null
}

/**
 * Read via useSyncExternalStore (correct primitive for external, mutable,
 * non-React state — hydration-safe by design, unlike the old
 * read-in-an-effect-then-setState approach). Writes go straight to
 * localStorage and notify(key) to fan out to every other mounted instance
 * using the same key, plus the native `storage` event for cross-tab sync
 * (a small upgrade over the previous per-instance-only state).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const subscribe = useCallback(
    (callback: Listener) => {
      if (!listeners.has(key)) listeners.set(key, new Set())
      listeners.get(key)!.add(callback)

      const onStorage = (event: StorageEvent) => {
        if (event.key === key) callback()
      }
      window.addEventListener("storage", onStorage)

      return () => {
        listeners.get(key)?.delete(callback)
        window.removeEventListener("storage", onStorage)
      }
    },
    [key],
  )

  const getSnapshot = useCallback((): string | null => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }, [key])

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const storedValue = useMemo<T>(() => {
    if (raw === null) return initialValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
  }, [raw, initialValue])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const currentRaw = window.localStorage.getItem(key)
        const current =
          currentRaw !== null ? (JSON.parse(currentRaw) as T) : initialValue
        const next =
          typeof value === "function" ? (value as (prev: T) => T)(current) : value
        window.localStorage.setItem(key, JSON.stringify(next))
        notify(key)
      } catch {}
    },
    [key, initialValue],
  )

  return [storedValue, setValue] as const
}
