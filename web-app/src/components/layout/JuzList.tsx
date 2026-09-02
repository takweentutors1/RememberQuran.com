"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { JUZ_RANGES, type JuzRange } from "@/lib/quran/juz"
import { useChapters } from "@/context/ChaptersContext"
import { useSurahContentOptional } from "@/context/SurahContentContext"
import { cn } from "@/lib/utils"

interface JuzListProps {
  onNavigate?: () => void
}

export function JuzList({ onNavigate }: JuzListProps) {
  const chapters = useChapters()
  const surahContent = useSurahContentOptional()
  const [activeJuzTab, setActiveJuzTab] = useState<"juz" | "hizb">("juz")

  const chapterMap = useMemo(() => {
    return new Map(chapters.map((c) => [c.id, c]))
  }, [chapters])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Juz / Hizb switcher */}
      <div className="shrink-0 border-b border-border/60 bg-sidebar px-3 py-2">
        <div className="flex rounded-md bg-muted/70 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveJuzTab("juz")}
            className={cn(
              "flex-1 rounded-sm py-1 font-medium transition-colors",
              activeJuzTab === "juz"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            30 Ajza'
          </button>
          <button
            type="button"
            onClick={() => setActiveJuzTab("hizb")}
            className={cn(
              "flex-1 rounded-sm py-1 font-medium transition-colors",
              activeJuzTab === "hizb"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            60 Ahzab / Quarters
          </button>
        </div>
      </div>

      <nav
        aria-label="Juz Navigation"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
      >
        {activeJuzTab === "juz" ? (
          <ul className="space-y-1">
            {JUZ_RANGES.map((j: JuzRange) => {
              const startChap = chapterMap.get(j.startSurah)
              const endChap = chapterMap.get(j.endSurah)

              return (
                <li key={j.juz}>
                  <Link
                    href={`/${j.startSurah}/${j.startAyah}`}
                    scroll={false}
                    onClick={() => {
                      if (surahContent) {
                        surahContent.loadSurah(j.startSurah)
                      }
                      onNavigate?.()
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                      "text-foreground/80 hover:bg-accent hover:text-foreground transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {j.juz}
                      </span>
                      <div className="min-w-0 truncate">
                        <p className="font-medium truncate text-xs text-foreground">
                          Juz {j.juz}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {startChap?.name_simple} {j.startAyah} – {endChap?.name_simple} {j.endAyah}
                        </p>
                      </div>
                    </div>
                    <span
                      dir="rtl"
                      lang="ar"
                      className="font-uthmani text-base text-muted-foreground/60 shrink-0"
                    >
                      الجزء {j.juz}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="space-y-1">
            {/* 60 Ahzab */}
            {Array.from({ length: 60 }, (_, i) => {
              const hizbNumber = i + 1
              const correspondingJuz = Math.ceil(hizbNumber / 2)
              const isFirstHalf = hizbNumber % 2 !== 0
              const juzDef = JUZ_RANGES[correspondingJuz - 1]!
              const startChap = chapterMap.get(juzDef.startSurah)

              return (
                <li key={hizbNumber}>
                  <Link
                    href={`/${juzDef.startSurah}/${isFirstHalf ? juzDef.startAyah : Math.ceil((juzDef.startAyah + juzDef.endAyah) / 2)}`}
                    scroll={false}
                    onClick={() => {
                      if (surahContent) {
                        surahContent.loadSurah(juzDef.startSurah)
                      }
                      onNavigate?.()
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                      "text-foreground/80 hover:bg-accent hover:text-foreground transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-foreground">
                        {hizbNumber}
                      </span>
                      <div className="min-w-0 truncate">
                        <p className="font-medium truncate text-xs text-foreground">
                          Hizb {hizbNumber} (Juz {correspondingJuz})
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Near {startChap?.name_simple}
                        </p>
                      </div>
                    </div>
                    <span
                      dir="rtl"
                      lang="ar"
                      className="font-uthmani text-sm text-muted-foreground/60 shrink-0"
                    >
                      الحزب {hizbNumber}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </div>
  )
}
