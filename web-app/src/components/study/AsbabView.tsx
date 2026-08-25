"use client"

import { useEffect, useState, useCallback } from "react"
import { RotateCcw } from "lucide-react"
import { getAsbab } from "@/lib/studyApi"
import { hasAsbab } from "@/lib/asbabIndex"
import type { AsbabContent } from "@/types/study"
import { StudyPanelSkeleton } from "./StudyPanelSkeleton"

interface AsbabViewProps {
  verseKey: string
}

interface LoadResult {
  requestKey: string
  /** undefined = fetch failed; null = no asbab for this ayah */
  content: AsbabContent | undefined
}

function EmptyState() {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      No recorded reason for revelation for this ayah — only a few hundred of
      the Quran&apos;s 6,236 ayahs have one documented in al-Wāḥidī.
    </p>
  )
}

export function AsbabView({ verseKey }: AsbabViewProps) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<LoadResult | null>(null)

  // The static index knows coverage upfront — skip the network entirely
  const covered = hasAsbab(verseKey)
  const requestKey = `${verseKey}:${attempt}`

  useEffect(() => {
    if (!covered) return
    let cancelled = false
    getAsbab(verseKey)
      .then((content) => {
        if (!cancelled) setResult({ requestKey, content })
      })
      .catch(() => {
        if (!cancelled) setResult({ requestKey, content: undefined })
      })
    return () => {
      cancelled = true
    }
  }, [covered, verseKey, requestKey])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  if (!covered) return <EmptyState />

  if (result?.requestKey !== requestKey) return <StudyPanelSkeleton />

  if (result.content === undefined) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load the reason for revelation. Check your connection and
          try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors duration-[120ms] hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-3" strokeWidth={2} />
          Retry
        </button>
      </div>
    )
  }

  // Index said covered but the CDN entry was missing/padded — expected rarely
  if (!result.content.text) return <EmptyState />

  return (
    <div>
      <div className="study-prose whitespace-pre-line">{result.content.text}</div>
      <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
        Asbāb al-Nuzūl by ʿAlī ibn Aḥmad al-Wāḥidī, translated by Mokrane
        Guezzou.
      </p>
    </div>
  )
}
