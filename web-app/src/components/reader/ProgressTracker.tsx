"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import {
  EVENT_DEBOUNCE_MS,
  POSITION_THROTTLE_MS,
  PROGRESS_DWELL_MS,
} from "@/lib/progress/date"

interface ProgressTrackerProps {
  surahId: number
}

/**
 * Silent signed-in tracker: observes focused ayahs, throttles lastPosition
 * writes, and upserts a ProgressEvent after a meaningful dwell (≥3s).
 * Failures never block reading.
 */
export function ProgressTracker({ surahId }: ProgressTrackerProps) {
  const { data: session, status } = useSession()
  const signedIn = Boolean(session?.user)

  const focusedKeyRef = useRef<string | null>(null)
  const minAyahRef = useRef<number | null>(null)
  const maxAyahRef = useRef<number | null>(null)
  const mountedAtRef = useRef(0)
  const lastPositionAtRef = useRef(0)
  const eventTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ratiosRef = useRef(new Map<string, number>())

  useEffect(() => {
    if (status === "loading" || !signedIn) return

    mountedAtRef.current = Date.now()
    focusedKeyRef.current = null
    minAyahRef.current = null
    maxAyahRef.current = null
    lastPositionAtRef.current = 0
    ratiosRef.current.clear()

    function dwellOk() {
      return Date.now() - mountedAtRef.current >= PROGRESS_DWELL_MS
    }

    function recordFocus(verseKey: string) {
      const ayah = Number(verseKey.split(":")[1])
      if (!Number.isInteger(ayah) || ayah < 1) return
      focusedKeyRef.current = verseKey
      minAyahRef.current =
        minAyahRef.current === null
          ? ayah
          : Math.min(minAyahRef.current, ayah)
      maxAyahRef.current =
        maxAyahRef.current === null
          ? ayah
          : Math.max(maxAyahRef.current, ayah)
    }

    function pickFocused() {
      let bestKey: string | null = null
      let bestScore = 0
      const topBand = window.innerHeight * 0.35
      for (const [key, ratio] of ratiosRef.current) {
        if (ratio <= 0) continue
        const el = document.querySelector(
          `[data-verse-key="${CSS.escape(key)}"]`,
        )
        if (!el) continue
        const rect = el.getBoundingClientRect()
        // Prefer ayahs visible near the upper third of the viewport
        const centerY = (rect.top + rect.bottom) / 2
        const proximity = Math.max(0, 1 - Math.abs(centerY - topBand) / window.innerHeight)
        const score = ratio * 0.6 + proximity * 0.4
        if (score > bestScore) {
          bestScore = score
          bestKey = key
        }
      }
      if (bestKey) recordFocus(bestKey)
    }

    async function patchPosition() {
      const key = focusedKeyRef.current
      if (!key || !dwellOk()) return
      const now = Date.now()
      if (now - lastPositionAtRef.current < POSITION_THROTTLE_MS) return
      lastPositionAtRef.current = now
      try {
        await fetch("/api/account/progress/position", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verseKey: key }),
          keepalive: true,
        })
      } catch {
        // Silent — reader stays usable
      }
    }

    async function putEvent() {
      const from = minAyahRef.current
      const to = maxAyahRef.current
      if (from === null || to === null || !dwellOk()) return
      try {
        await fetch("/api/account/progress/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ surah: surahId, fromAyah: from, toAyah: to }),
          keepalive: true,
        })
      } catch {
        // Silent
      }
    }

    function scheduleEvent() {
      if (eventTimerRef.current) clearTimeout(eventTimerRef.current)
      eventTimerRef.current = setTimeout(() => {
        void putEvent()
      }, EVENT_DEBOUNCE_MS)
    }

    function flush() {
      if (eventTimerRef.current) {
        clearTimeout(eventTimerRef.current)
        eventTimerRef.current = null
      }
      // Force position write on leave (bypass throttle once dwell ok)
      const key = focusedKeyRef.current
      if (key && dwellOk()) {
        lastPositionAtRef.current = 0
        void patchPosition()
        void putEvent()
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.verseKey
          if (!key) continue
          ratiosRef.current.set(
            key,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          )
        }
        pickFocused()
        if (focusedKeyRef.current && dwellOk()) {
          void patchPosition()
          scheduleEvent()
        }
      },
      {
        root: null,
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-10% 0px -40% 0px",
      },
    )

    const nodes = document.querySelectorAll<HTMLElement>("[data-verse-key]")
    nodes.forEach((el) => observer.observe(el))

    // Re-observe when verses hydrate / mode switches (MutationObserver light)
    const mo = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>("[data-verse-key]").forEach((el) => {
        observer.observe(el)
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush()
    }
    window.addEventListener("pagehide", flush)
    document.addEventListener("visibilitychange", onVisibility)

    // Initial dwell gate: once 3s passed, try a write if we already have focus
    const dwellTimer = window.setTimeout(() => {
      pickFocused()
      if (focusedKeyRef.current) {
        void patchPosition()
        scheduleEvent()
      }
    }, PROGRESS_DWELL_MS)

    return () => {
      window.clearTimeout(dwellTimer)
      if (eventTimerRef.current) clearTimeout(eventTimerRef.current)
      observer.disconnect()
      mo.disconnect()
      window.removeEventListener("pagehide", flush)
      document.removeEventListener("visibilitychange", onVisibility)
      flush()
    }
  }, [signedIn, status, surahId])

  return null
}
