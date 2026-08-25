"use client"

import { ChevronDown } from "lucide-react"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahPickerTriggerProps {
  chapter: Chapter
  expanded?: boolean
  isLoading?: boolean
  onClick: () => void
  className?: string
}

export function SurahPickerTrigger({
  chapter,
  expanded = false,
  isLoading = false,
  onClick,
  className,
}: SurahPickerTriggerProps) {
  return (
    <button
      type="button"
      aria-label="Choose surah"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      title="Choose surah"
      onClick={onClick}
      className={cn(
        "flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1",
        "text-foreground transition-colors duration-[120ms] hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isLoading && "opacity-80",
        className,
      )}
    >
      <span className="truncate text-sm font-medium tabular-nums">
        {chapter.id}. {chapter.name_simple}
      </span>
      <ChevronDown
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
          expanded && "rotate-180",
        )}
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </button>
  )
}
