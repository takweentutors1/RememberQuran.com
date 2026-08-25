"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronsUpDown } from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AyahSelectorProps {
  surahId: number
  versesCount: number
}

/** Jump to a specific ayah in the open surah — updates the URL (/surah/ayah) */
export function AyahSelector({ surahId, versesCount }: AyahSelectorProps) {
  const router = useRouter()
  const params = useParams<{ ayahId?: string }>()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const parsed = Number(params.ayahId)
  const currentAyah =
    !isNaN(parsed) && parsed >= 1 && parsed <= versesCount ? parsed : null

  /* Callback refs — the popup content mounts in a portal after `open`
     flips, so effects keyed on `open` fire before these nodes exist.
     Scroll the grid internally (never the page) and focus without
     scrolling so opening the popover can't lose the reading position. */
  const focusInput = (el: HTMLInputElement | null) =>
    el?.focus({ preventScroll: true })

  const scrollGridToActive = (node: HTMLDivElement | null) => {
    if (!node) return
    const active = node.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!active) return
    node.scrollTop =
      active.offsetTop - node.clientHeight / 2 + active.clientHeight / 2
  }

  function goTo(ayah: number) {
    setOpen(false)
    setQuery("")
    router.push(`/${surahId}/${ayah}`)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(query.trim())
    if (isNaN(n) || n < 1 || n > versesCount) return
    goTo(n)
  }

  const ayahs = Array.from({ length: versesCount }, (_, i) => i + 1)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            title="Go to ayah"
            aria-label="Go to ayah"
            className={cn(
              "flex h-8 items-center gap-1 rounded-md px-2",
              "text-xs text-muted-foreground transition-colors duration-[120ms]",
              "hover:bg-accent hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <span className="tabular-nums">
              {currentAyah ? `Ayah ${currentAyah}` : "Ayah"}
            </span>
            <ChevronsUpDown className="size-3" strokeWidth={1.75} />
          </button>
        )}
      />
      <PopoverContent align="start" className="w-56 p-2">
        <form onSubmit={onSubmit}>
          <Input
            ref={focusInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            inputMode="numeric"
            placeholder={`Ayah 1–${versesCount}`}
            aria-label={`Go to ayah, 1 to ${versesCount}`}
            className="h-8 text-xs"
          />
        </form>
        <div
          ref={scrollGridToActive}
          className="grid max-h-56 grid-cols-5 gap-1 overflow-y-auto overscroll-contain pr-0.5"
          role="listbox"
          aria-label="Ayahs"
        >
          {ayahs.map((n) => {
            const active = n === currentAyah
            return (
              <button
                key={n}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => goTo(n)}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md text-xs tabular-nums",
                  "transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground",
                )}
              >
                {n}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
