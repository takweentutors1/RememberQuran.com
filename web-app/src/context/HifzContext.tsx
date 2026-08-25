"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"

interface HifzEntry {
  verseKey: string
  surahId: number
  ayahId: number
}

interface HifzContextValue {
  loaded: boolean
  isMemorised: (verseKey: string) => boolean
  isPending: (verseKey: string) => boolean
  toggle: (verseKey: string) => Promise<void>
  refresh: () => Promise<void>
  memorisedCount: number
}

const HifzContext = createContext<HifzContextValue | null>(null)

async function fetchHifzKeys(): Promise<Set<string>> {
  const res = await fetch("/api/account/hifz")
  if (!res.ok) return new Set()
  const data = (await res.json()) as { ayahs?: HifzEntry[] }
  return new Set((data.ayahs ?? []).map((a) => a.verseKey))
}

export function HifzProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const [keys, setKeys] = useState<Set<string> | null>(null)
  const [keysUserId, setKeysUserId] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())

  const effectiveKeys = userId && keysUserId === userId ? keys : null

  const effectiveKeysRef = useRef<Set<string> | null>(null)
  const pendingRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    effectiveKeysRef.current = effectiveKeys
  })
  useEffect(() => {
    pendingRef.current = pending
  })

  useEffect(() => {
    let cancelled = false
    const fetchFor = userId

    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setKeys(null)
        setKeysUserId(null)
        setPending(new Set())
        if (!fetchFor) return
        return fetchHifzKeys()
      })
      .then((newKeys) => {
        if (cancelled || !newKeys || !fetchFor) return
        setKeys(newKeys)
        setKeysUserId(fetchFor)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const newKeys = await fetchHifzKeys()
      setKeys(newKeys)
      setKeysUserId(userId)
    } catch {
      // Reader stays usable
    }
  }, [userId])

  const isMemorised = useCallback(
    (verseKey: string) => effectiveKeys?.has(verseKey) ?? false,
    [effectiveKeys],
  )

  const isPending = useCallback(
    (verseKey: string) => pending.has(verseKey),
    [pending],
  )

  const toggle = useCallback(async (verseKey: string) => {
    if (effectiveKeysRef.current === null) return
    if (pendingRef.current.has(verseKey)) return
    const wasSaved = effectiveKeysRef.current.has(verseKey)

    setPending((prev) => new Set(prev).add(verseKey))
    setKeys((prev) => {
      const next = new Set(prev ?? [])
      if (wasSaved) next.delete(verseKey)
      else next.add(verseKey)
      return next
    })

    try {
      const res = wasSaved
        ? await fetch(
            `/api/account/hifz?verseKey=${encodeURIComponent(verseKey)}`,
            { method: "DELETE" },
          )
        : await fetch("/api/account/hifz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verseKey }),
          })
      if (!res.ok) throw new Error(`Hifz toggle failed: ${res.status}`)
    } catch {
      setKeys((prev) => {
        const next = new Set(prev ?? [])
        if (wasSaved) next.add(verseKey)
        else next.delete(verseKey)
        return next
      })
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(verseKey)
        return next
      })
    }
  }, [])

  const value = useMemo(
    () => ({
      loaded: effectiveKeys !== null,
      isMemorised,
      isPending,
      toggle,
      refresh,
      memorisedCount: effectiveKeys?.size ?? 0,
    }),
    [effectiveKeys, isMemorised, isPending, toggle, refresh],
  )

  return <HifzContext.Provider value={value}>{children}</HifzContext.Provider>
}

export function useHifz() {
  const ctx = useContext(HifzContext)
  if (!ctx) throw new Error("useHifz must be used within HifzProvider")
  return ctx
}
