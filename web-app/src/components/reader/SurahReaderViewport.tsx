"use client"

import { QuranReader } from "@/components/reader/QuranReader"
import { useSurahContent } from "@/context/SurahContentContext"
import { cn } from "@/lib/utils"

function SurahReaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto max-w-6xl animate-pulse px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="mb-8 flex flex-col items-center gap-3 border-b border-border/40 pb-8">
        <div className="h-10 w-40 rounded-lg bg-muted" />
        <div className="h-5 w-28 rounded-md bg-muted" />
        <div className="h-4 w-20 rounded-md bg-muted/60" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg px-2 py-4">
            <div className="h-8 rounded-md bg-muted" style={{ width: `${70 + (i % 2) * 12}%` }} />
            <div className="h-4 rounded bg-muted/70" style={{ width: `${55 + (i % 3) * 10}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SurahReaderViewport() {
  const { chapter, verses, isLoading, targetAyahId } = useSurahContent()

  if (!chapter || verses.length === 0) {
    return <SurahReaderSkeleton />
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/10"
        >
          <div className="h-full w-1/3 animate-[surah-load_1s_ease-in-out_infinite] bg-primary" />
        </div>
      )}

      <div
        className={cn(
          "transition-opacity duration-200 ease-out",
          isLoading && "opacity-55",
        )}
      >
        <QuranReader
          chapter={chapter}
          verses={verses}
          targetAyahId={targetAyahId}
        />
      </div>
    </div>
  )
}
