"use client"

import { useEffect, useState, useCallback } from "react"
import { RotateCcw } from "lucide-react"
import { getTafsir, getTafsirResource } from "@/lib/studyApi"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import type { TafsirContent } from "@/types/study"
import { StudyPanelSkeleton } from "./StudyPanelSkeleton"
import { TafsirBookSelector } from "./TafsirBookSelector"
import { cn } from "@/lib/utils"

interface TafsirViewProps {
  verseKey: string
}

interface LoadResult {
  /** Which request this result belongs to — anything else means "loading" */
  requestKey: string
  content: TafsirContent | null
}

export function TafsirView({ verseKey }: TafsirViewProps) {
  const { tafsirSlug } = useReaderSettings()
  // Bumping this refetches after an error (the cache evicts failed loads)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<LoadResult | null>(null)

  const requestKey = `${tafsirSlug}:${verseKey}:${attempt}`

  useEffect(() => {
    let cancelled = false
    getTafsir(tafsirSlug, verseKey)
      .then((content) => {
        if (!cancelled) setResult({ requestKey, content })
      })
      .catch(() => {
        if (!cancelled) setResult({ requestKey, content: null })
      })
    return () => {
      cancelled = true
    }
  }, [tafsirSlug, verseKey, requestKey])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const activeBook = getTafsirResource(tafsirSlug)
  const isRtl = (activeBook?.language ?? "").toLowerCase() === "arabic"

  return (
    <div className="flex flex-col gap-4">
      <TafsirBookSelector />

      {result?.requestKey !== requestKey ? (
        <StudyPanelSkeleton />
      ) : result.content === null ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load the tafsir. Check your connection and try again.
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
      ) : (
        <TafsirBody content={result.content} isRtl={isRtl} />
      )}
    </div>
  )
}

function TafsirBody({
  content,
  isRtl,
}: {
  content: TafsirContent
  isRtl: boolean
}) {
  const resource = getTafsirResource(content.slug)
  const bookName = content.resourceName || resource?.name || content.slug
  const hasText = content.text.trim().length > 0

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{bookName}</span>
        {content.coveredKeys.length > 1 && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[0.6875rem] text-muted-foreground">
            Covers {content.coveredKeys[0]}–
            {content.coveredKeys[content.coveredKeys.length - 1].split(":")[1]}
          </span>
        )}
      </div>

      {hasText ? (
        // Safe: sanitized server-side in /api/tafsir (single choke point)
        <div
          className={cn("study-prose", isRtl && "text-right")}
          dir={isRtl ? "rtl" : "ltr"}
          lang={isRtl ? "ar" : "en"}
          dangerouslySetInnerHTML={{ __html: content.text }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          No commentary is available for this ayah in {bookName}.
        </p>
      )}
    </div>
  )
}
