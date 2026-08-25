"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import type { Chapter } from "@/types/quran"
import { useChapterMeta } from "@/context/ChaptersContext"
import { useUI } from "@/context/UIContext"
import { useSurahContent } from "@/context/SurahContentContext"
import { SurahPickerTrigger } from "@/components/reader/SurahPickerTrigger"
import { SurahList } from "./SurahList"
import { AyahGrid } from "./AyahGrid"
import { cn } from "@/lib/utils"

type NavTab = "surah" | "verse"

interface SurahNavigationPanelProps {
  chapters: Chapter[]
  onClose: () => void
  /** When true, picking a surah/ayah closes the panel (mobile sheet). Sidebar stays open. */
  closeOnNavigate?: boolean
  /** Desktop sidebar: surah picker lives here while open (hidden from main toolbar). */
  showPickerTrigger?: boolean
}

function parseSurahId(pathname: string): number | null {
  const match = pathname.match(/^\/(\d+)(?:\/|$)/)
  if (!match) return null
  const id = Number(match[1])
  return id >= 1 && id <= 114 ? id : null
}

export function SurahNavigationPanel({
  chapters,
  onClose,
  closeOnNavigate = false,
  showPickerTrigger = false,
}: SurahNavigationPanelProps) {
  const pathname = usePathname()
  const [tab, setTab] = useState<NavTab>("surah")
  const { sidebarOpen, toggleSidebar } = useUI()
  const { pendingSurahId, isLoading } = useSurahContent()

  const surahId = parseSurahId(pathname)
  const chapter = useChapterMeta(surahId)
  const pickerChapter = useChapterMeta(pendingSurahId ?? surahId)

  function handleNavigate() {
    if (closeOnNavigate) onClose()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showPickerTrigger && pickerChapter && (
        <div className="hidden h-11 shrink-0 items-center border-b border-border/60 px-2 md:group-data-[sidebar=open]:flex">
          <SurahPickerTrigger
            chapter={pickerChapter}
            expanded={sidebarOpen}
            isLoading={isLoading}
            onClick={toggleSidebar}
            className="min-w-0 flex-1"
          />
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-2 py-2">
        <div
          role="tablist"
          aria-label="Navigation"
          className="flex flex-1 items-center rounded-full bg-muted/80 p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "surah"}
            onClick={() => setTab("surah")}
            className={cn(
              "flex-1 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-[120ms]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === "surah"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Surah
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "verse"}
            onClick={() => setTab("verse")}
            disabled={!chapter}
            className={cn(
              "flex-1 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-[120ms]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === "verse"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              !chapter && "cursor-not-allowed opacity-40",
            )}
          >
            Verse
          </button>
        </div>

        <button
          type="button"
          aria-label="Close navigation"
          title="Close"
          onClick={onClose}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            "text-muted-foreground transition-colors duration-[120ms]",
            "hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "surah" ? (
          <SurahList
            chapters={chapters}
            onNavigate={closeOnNavigate ? handleNavigate : undefined}
            showSearch
          />
        ) : chapter ? (
          <AyahGrid
            surahId={chapter.id}
            versesCount={chapter.verses_count}
            onNavigate={closeOnNavigate ? handleNavigate : undefined}
          />
        ) : (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Open a surah to pick a verse.
          </p>
        )}
      </div>
    </div>
  )
}
