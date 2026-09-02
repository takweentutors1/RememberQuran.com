"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useRemoteSet } from "@/hooks/useRemoteSet"

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
  getMemorisedCountForSurah: (surahId: number) => number
}

const HifzContext = createContext<HifzContextValue | null>(null)

async function fetchHifzKeys(): Promise<Set<string>> {
  const res = await fetch("/api/account/hifz")
  if (!res.ok) return new Set()
  const data = (await res.json()) as { ayahs?: HifzEntry[] }
  return new Set((data.ayahs ?? []).map((a) => a.verseKey))
}

async function addHifzKey(verseKey: string): Promise<void> {
  const res = await fetch("/api/account/hifz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verseKey }),
  })
  if (!res.ok) throw new Error(`Hifz add failed: ${res.status}`)
}

async function deleteHifzKey(verseKey: string): Promise<void> {
  const res = await fetch(
    `/api/account/hifz?verseKey=${encodeURIComponent(verseKey)}`,
    { method: "DELETE" },
  )
  if (!res.ok) throw new Error(`Hifz delete failed: ${res.status}`)
}

export function HifzProvider({ children }: { children: ReactNode }) {
  const fetchCallback = useCallback(() => fetchHifzKeys(), [])
  const addCallback = useCallback((key: string) => addHifzKey(key), [])
  const deleteCallback = useCallback((key: string) => deleteHifzKey(key), [])

  const remote = useRemoteSet({
    fetchKeys: fetchCallback,
    onAdd: addCallback,
    onDelete: deleteCallback,
  })

  const getMemorisedCountForSurah = useCallback(
    (surahId: number) => {
      if (!remote.keys) return 0
      let count = 0
      const prefix = `${surahId}:`
      for (const k of remote.keys) {
        if (k.startsWith(prefix)) {
          count++
        }
      }
      return count
    },
    [remote.keys],
  )

  const value = useMemo<HifzContextValue>(
    () => ({
      loaded: remote.loaded,
      isMemorised: remote.has,
      isPending: remote.isPending,
      toggle: remote.toggle,
      refresh: remote.refresh,
      memorisedCount: remote.size,
      getMemorisedCountForSurah,
    }),
    [remote.loaded, remote.has, remote.isPending, remote.toggle, remote.refresh, remote.size, getMemorisedCountForSurah],
  )

  return <HifzContext.Provider value={value}>{children}</HifzContext.Provider>
}

export function useHifz() {
  const ctx = useContext(HifzContext)
  if (!ctx) {
    throw new Error("useHifz must be used within HifzProvider")
  }
  return ctx
}
