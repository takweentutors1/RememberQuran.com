"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useChapters } from "@/context/ChaptersContext"
import { getAyahCount, parseVerseKey } from "@/lib/quran/verse-key"
import { cn } from "@/lib/utils"

interface AyahPickerProps {
  value: string
  onChange: (verseKey: string) => void
  className?: string
}

type Step = "surah" | "ayah"

export function AyahPicker({ value, onChange, className }: AyahPickerProps) {
  const chapters = useChapters()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("surah")
  const [surahId, setSurahId] = useState<number | null>(null)
  const [query, setQuery] = useState("")

  const parsed = parseVerseKey(value)
  const selectedChapter = chapters.find((c) => c.id === parsed?.surahId)

  const ayahMatch = parseVerseKey(query.trim())
  const ayahOptions = useMemo(() => {
    if (surahId == null) return []
    const count = getAyahCount(surahId) ?? 0
    return Array.from({ length: count }, (_, index) => index + 1)
  }, [surahId])

  function resetDialog(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setStep("surah")
      setSurahId(null)
      setQuery("")
    }
  }

  function selectVerse(next: string) {
    onChange(next)
    resetDialog(false)
  }

  const filteredAyahs = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed || ayahMatch) return ayahOptions
    const asNumber = Number(trimmed)
    if (!Number.isInteger(asNumber)) return ayahOptions
    return ayahOptions.filter((ayah) => String(ayah).includes(trimmed))
  }, [ayahOptions, ayahMatch, query])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label="Choose an ayah"
        className={cn(
          "h-auto w-full justify-between gap-3 px-3 py-2.5 text-left font-normal",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <span className="min-w-0">
          <span className="block text-xs text-muted-foreground">Ayah</span>
          <span className="mt-0.5 block truncate text-sm text-foreground">
            {selectedChapter && parsed
              ? `${selectedChapter.name_simple} · Ayah ${parsed.ayahId}`
              : "Choose a Surah and ayah"}
          </span>
          {parsed ? (
            <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
              {value}
            </span>
          ) : null}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </Button>

      <Dialog open={open} onOpenChange={resetDialog}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-4 py-3 text-left">
            <DialogTitle className="font-serif text-lg">
              {step === "surah" ? "Choose a Surah" : "Choose an ayah"}
            </DialogTitle>
            <DialogDescription>
              {step === "surah"
                ? "Search by name, number, or type 2:255."
                : `Pick an ayah from ${chapters.find((c) => c.id === surahId)?.name_simple ?? "this Surah"}.`}
            </DialogDescription>
          </DialogHeader>

          <Command shouldFilter={step === "surah" && !ayahMatch}>
            <CommandInput
              placeholder={
                step === "surah"
                  ? "Surah name, number, or 2:255…"
                  : "Ayah number…"
              }
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>No matches.</CommandEmpty>

              {step === "surah" && ayahMatch ? (
                <CommandGroup heading="Go to ayah">
                  <CommandItem
                    value={query}
                    onSelect={() =>
                      selectVerse(`${ayahMatch.surahId}:${ayahMatch.ayahId}`)
                    }
                  >
                    <Search className="size-3.5 text-muted-foreground" />
                    <span className="font-medium text-primary">
                      {ayahMatch.surahId}:{ayahMatch.ayahId}
                    </span>
                    <span className="text-muted-foreground">— jump directly</span>
                  </CommandItem>
                </CommandGroup>
              ) : null}

              {step === "surah" && !ayahMatch ? (
                <CommandGroup heading="Surahs">
                  {chapters.map((chapter) => (
                    <CommandItem
                      key={chapter.id}
                      value={`${chapter.id} ${chapter.name_simple} ${chapter.name_arabic}`}
                      onSelect={() => {
                        setSurahId(chapter.id)
                        setStep("ayah")
                        setQuery("")
                      }}
                      className="flex items-center gap-3"
                    >
                      <span className="w-7 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {chapter.id}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {chapter.name_simple}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {chapter.verses_count} ayahs
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}

              {step === "ayah" && surahId != null ? (
                <CommandGroup heading={`Ayahs in Surah ${surahId}`}>
                  <CommandItem
                    value="back-to-surahs"
                    onSelect={() => {
                      setStep("surah")
                      setSurahId(null)
                      setQuery("")
                    }}
                  >
                    ← Back to Surahs
                  </CommandItem>
                  {filteredAyahs.map((ayah) => {
                    const key = `${surahId}:${ayah}`
                    return (
                      <CommandItem
                        key={key}
                        value={`${ayah}`}
                        data-checked={value === key ? true : undefined}
                        onSelect={() => selectVerse(key)}
                      >
                        Ayah {ayah}
                        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                          {key}
                        </span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
