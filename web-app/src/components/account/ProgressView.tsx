"use client"

import Link from "next/link"
import { ContinuePrompt, type LastPositionDto } from "@/components/account/ContinuePrompt"
import { TOTAL_SURAHS } from "@/lib/progress/date"
import { cn } from "@/lib/utils"

export interface ProgressViewProps {
  viewedSurahIds: number[]
  lastPosition: LastPositionDto | null
  chapters: Array<{ id: number; name_simple: string }>
}

export function ProgressView({
  viewedSurahIds,
  lastPosition,
  chapters,
}: ProgressViewProps) {
  const viewed = new Set(viewedSurahIds)
  const count = viewed.size
  const pct = Math.floor((count / TOTAL_SURAHS) * 100)
  const nameById = new Map(chapters.map((c) => [c.id, c.name_simple]))

  return (
    <div className="space-y-8">
      {lastPosition && (
        <ContinuePrompt
          initialPosition={{
            ...lastPosition,
            surahName: nameById.get(lastPosition.surahId),
          }}
          surahName={nameById.get(lastPosition.surahId)}
        />
      )}

      <div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {count} of {TOTAL_SURAHS}
          </span>{" "}
          surahs viewed
          <span className="mx-1.5 text-muted-foreground/50">·</span>
          <span className="tabular-nums">{pct}%</span>
        </p>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct} percent of surahs viewed`}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {count === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-foreground">No progress yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start reading any surah — after a short visit it appears here.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Browse surahs
          </Link>
        </div>
      ) : (
        <ul
          className="grid grid-cols-6 gap-1.5 sm:grid-cols-9 md:grid-cols-12"
          aria-label="Surah progress grid"
        >
          {Array.from({ length: TOTAL_SURAHS }, (_, i) => {
            const id = i + 1
            const isViewed = viewed.has(id)
            const name = nameById.get(id) ?? `Surah ${id}`
            return (
              <li key={id}>
                <Link
                  href={`/${id}`}
                  title={`${name}${isViewed ? " · viewed" : ""}`}
                  aria-label={`${name}${isViewed ? ", viewed" : ", not viewed yet"}`}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md text-[0.65rem] tabular-nums transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isViewed
                      ? "bg-primary/15 font-medium text-primary hover:bg-primary/25"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {id}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
