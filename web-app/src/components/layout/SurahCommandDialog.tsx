"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { useUI } from "@/context/UIContext"
import { useChapters } from "@/context/ChaptersContext"
import { useSurahContentOptional } from "@/context/SurahContentContext"

const AYAH_KEY_RE = /^(\d+):(\d+)$/

export function SurahCommandDialog() {
  const { commandOpen, setCommandOpen } = useUI()
  const chapters = useChapters()
  const surahContent = useSurahContentOptional()
  const router = useRouter()
  const [input, setInput] = useState("")

  function handleSelect(href: string) {
    setCommandOpen(false)
    setInput("")

    const surahMatch = /^\/(\d+)$/.exec(href)
    if (surahContent && surahMatch) {
      surahContent.loadSurah(Number(surahMatch[1]))
      return
    }

    router.push(href, { scroll: false })
  }

  function handleOpenChange(open: boolean) {
    setCommandOpen(open)
    if (!open) setInput("")
  }

  const ayahMatch = AYAH_KEY_RE.exec(input.trim())
  const trimmedInput = input.trim()
  const showSearch = !ayahMatch && trimmedInput.length >= 2

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={handleOpenChange}
      title="Navigate to surah or ayah"
      description="Search by surah name, number, or type 2:255 for a specific ayah"
    >
      <Command shouldFilter={!ayahMatch}>
        <CommandInput
          placeholder="Surah name, number, or 2:255…"
          value={input}
          onValueChange={setInput}
        />
        <CommandList>
          <CommandEmpty>No surah found.</CommandEmpty>

          {showSearch ? (
            <CommandGroup heading="Search Quran">
              <CommandItem
                value={`search:${trimmedInput}`}
                onSelect={() =>
                  handleSelect(`/search?q=${encodeURIComponent(trimmedInput)}`)
                }
                className="flex items-center gap-2"
              >
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <span>Search Quran for</span>
                <span className="font-medium text-foreground">
                  &ldquo;{trimmedInput}&rdquo;
                </span>
              </CommandItem>
            </CommandGroup>
          ) : null}

          {ayahMatch ? (
            <CommandGroup heading="Go to ayah">
              <CommandItem
                value={input}
                onSelect={() => handleSelect(`/${ayahMatch[1]}/${ayahMatch[2]}`)}
              >
                <span className="text-primary font-medium">{input.trim()}</span>
                <span className="ml-1 text-muted-foreground">— jump to ayah</span>
              </CommandItem>
            </CommandGroup>
          ) : null}

          {!ayahMatch ? (
            <CommandGroup heading="Surahs">
              {chapters.map((chapter) => (
                <CommandItem
                  key={chapter.id}
                  value={`${chapter.id} ${chapter.name_simple} ${chapter.name_arabic}`}
                  onSelect={() => handleSelect(`/${chapter.id}`)}
                  className="flex items-center gap-3"
                >
                  <span className="tabular-nums text-xs text-muted-foreground w-6 text-right shrink-0">
                    {chapter.id}
                  </span>
                  <span className="flex-1">{chapter.name_simple}</span>
                  <span
                    className="font-arabic text-base leading-none text-muted-foreground shrink-0"
                    dir="rtl"
                    lang="ar"
                  >
                    {chapter.name_arabic}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
