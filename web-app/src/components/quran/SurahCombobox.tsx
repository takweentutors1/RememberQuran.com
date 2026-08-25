"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahComboboxProps {
  chapters: Chapter[]
  value: number
  onChange: (surahId: number) => void
  label?: string
  className?: string
}

function chapterLabel(chapter: Chapter) {
  return `${chapter.id} · ${chapter.name_simple}`
}

export function SurahCombobox({
  chapters,
  value,
  onChange,
  label = "Starting surah",
  className,
}: SurahComboboxProps) {
  const selected = chapters.find((chapter) => chapter.id === value) ?? null

  return (
    <Combobox
      items={chapters}
      value={selected}
      onValueChange={(chapter) => {
        if (chapter) onChange(chapter.id)
      }}
      itemToStringLabel={chapterLabel}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxInput
        aria-label={label}
        placeholder="Search surah name or number…"
        className={cn("w-full", className)}
        showClear={false}
      />
      <ComboboxContent>
        <ComboboxEmpty>No surah found.</ComboboxEmpty>
        <ComboboxList>
          {(chapter) => (
            <ComboboxItem key={chapter.id} value={chapter}>
              <span className="w-7 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {chapter.id}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {chapter.name_simple}
              </span>
              <span
                className="shrink-0 font-uthmani text-base leading-none text-muted-foreground"
                dir="rtl"
                lang="ar"
              >
                {chapter.name_arabic}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
