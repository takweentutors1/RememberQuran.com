"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { TAFSIR_RESOURCES } from "@/lib/studyApi"
import type { TafsirResource } from "@/types/study"
import { cn } from "@/lib/utils"

function bookLabel(book: TafsirResource) {
  return `${book.name} · ${book.author} · ${book.language}`
}

interface TafsirBookSelectorProps {
  className?: string
}

export function TafsirBookSelector({ className }: TafsirBookSelectorProps) {
  const { tafsirSlug, setTafsirSlug } = useReaderSettings()
  const selected =
    TAFSIR_RESOURCES.find((b) => b.slug === tafsirSlug) ?? TAFSIR_RESOURCES[0]

  return (
    <Combobox
      items={TAFSIR_RESOURCES}
      value={selected}
      onValueChange={(book) => {
        if (book) setTafsirSlug(book.slug)
      }}
      itemToStringLabel={bookLabel}
      isItemEqualToValue={(a, b) => a.slug === b.slug}
    >
      <ComboboxInput
        aria-label="Tafsir book"
        placeholder="Search tafsir…"
        className={cn("w-full", className)}
        showClear={false}
      />
      <ComboboxContent className="min-w-[min(100vw-2rem,18rem)]">
        <ComboboxEmpty>No tafsir found.</ComboboxEmpty>
        <ComboboxList>
          {(book: TafsirResource) => (
            <ComboboxItem key={book.slug} value={book} className="items-start py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate">{book.name}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {book.author}
                  <span className="capitalize"> · {book.language}</span>
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
