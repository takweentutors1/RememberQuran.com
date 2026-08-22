"use client"

import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { getWordMorphology, prefetchSurahMorphology } from "@/lib/morphologyApi"
import { humanizePOS, humanizeFeatures } from "@/lib/morphologyLabels"
import type { MorphologyEntry } from "@/types/study"

interface WordDetailViewProps {
  verseKey: string
  wordPosition: number
}

type Status = "loading" | "done" | "unavailable" | "error"

export function WordDetailView({ verseKey, wordPosition }: WordDetailViewProps) {
  const [entry, setEntry] = useState<MorphologyEntry | null>(null)
  const [status, setStatus] = useState<Status>("loading")

  // Reset during render (not the effect below) when the word changes — the
  // React-endorsed way to derive state from props without an extra
  // render+effect round trip. The fetch effect still owns the async part.
  const currentKey = `${verseKey}:${wordPosition}`
  const [trackedKey, setTrackedKey] = useState(currentKey)
  if (currentKey !== trackedKey) {
    setTrackedKey(currentKey)
    setStatus("loading")
    setEntry(null)
  }

  useEffect(() => {
    const surahId = Number(verseKey.split(":")[0])
    prefetchSurahMorphology(surahId)

    let cancelled = false

    getWordMorphology(verseKey, wordPosition)
      .then((result) => {
        if (cancelled) return
        setEntry(result)
        setStatus(result ? "done" : "unavailable")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })

    return () => { cancelled = true }
  }, [verseKey, wordPosition])

  if (status === "loading") {
    return (
      <div className="space-y-4">
        {[80, 60, 100, 50, 70].map((w, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-muted/60"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">Failed to load grammar data.</p>
        <button
          type="button"
          onClick={() => setStatus("loading")}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent/70"
        >
          <RotateCcw className="size-3" strokeWidth={2} /> Retry
        </button>
      </div>
    )
  }

  if (status === "unavailable" || !entry) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Detailed grammar is not available for this word.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Particles and conjunctions often lack root/lemma data.
        </p>
      </div>
    )
  }

  const humanFeatures = humanizeFeatures(entry.features)

  return (
    <div className="space-y-5">
      {/* Arabic form + root */}
      <div className="flex items-start justify-between gap-4">
        {entry.lemma && (
          <div>
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Lemma
            </p>
            <span
              className="font-arabic text-2xl leading-none text-foreground"
              dir="rtl"
              lang="ar"
            >
              {entry.lemma}
            </span>
          </div>
        )}
        {entry.root && (
          <div className="text-right">
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Root
            </p>
            <span
              className="font-arabic text-2xl leading-none text-foreground"
              dir="rtl"
              lang="ar"
            >
              {entry.root}
            </span>
          </div>
        )}
      </div>

      {/* Part of speech */}
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Part of Speech
        </p>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-foreground">
          {humanizePOS(entry.pos)}
        </span>
      </div>

      {/* Features */}
      {humanFeatures.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Features
          </p>
          <div className="flex flex-wrap gap-1.5">
            {humanFeatures.map((f, i) => (
              <span
                key={i}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attribution */}
      <p className="border-t border-border/40 pt-4 text-[10px] text-muted-foreground/60">
        Source: Quranic Arabic Corpus — University of Leeds (GPL)
      </p>
    </div>
  )
}
