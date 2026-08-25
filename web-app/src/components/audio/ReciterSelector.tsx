"use client"

import { useState } from "react"
import { AudioLines, Check, MicVocal } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { RECITERS, getReciter } from "@/lib/audioSources"
import { cn } from "@/lib/utils"

const barBtn = cn(
  "flex size-8 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
)

function matchesQuery(query: string, name: string, arabic: string, style?: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    name.toLowerCase().includes(q) ||
    arabic.includes(query.trim()) ||
    (style?.toLowerCase().includes(q) ?? false)
  )
}

/** Compact player-bar picker — searchable list over the full RECITERS registry. */
export function ReciterSelector() {
  const { reciterId, setReciter } = useAudioPlayer()
  const current = getReciter(reciterId)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = RECITERS.filter((r) =>
    matchesQuery(query, r.name, r.arabicName, r.style),
  )

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <SheetTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            title={`Reciter: ${current.name}`}
            aria-label={`Reciter: ${current.name}`}
            className={barBtn}
          >
            <MicVocal className="size-4" strokeWidth={1.75} />
          </button>
        )}
      />
      <SheetContent side="bottom" className="mx-auto flex max-h-[85vh] w-full flex-col gap-4 rounded-t-3xl p-0 sm:max-w-md">
        <SheetHeader className="px-6 pt-6 text-left">
          <SheetTitle className="text-xl">Select Reciter</SheetTitle>
        </SheetHeader>
        
        <div className="px-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reciter…"
            aria-label="Search reciter"
            className={cn(
              "h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base",
              "outline-none placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
          />
        </div>

        <div
          role="radiogroup"
          aria-label="Reciter"
          className="flex-1 overflow-y-auto px-4 pb-8"
        >
          {filtered.length === 0 ? (
            <p className="px-2.5 py-8 text-center text-sm text-muted-foreground">
              No reciter found.
            </p>
          ) : (
            filtered.map((reciter) => {
              const active = reciter.id === current.id
              return (
                <button
                  key={reciter.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setReciter(reciter.id)
                    setOpen(false)
                    setQuery("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left",
                    "transition-colors duration-[120ms]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-primary/10 text-primary" : "hover:bg-accent",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-medium">
                      {reciter.name}
                      {reciter.style ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {reciter.style}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "mt-1 flex flex-wrap items-center gap-2 text-xs",
                        active ? "text-primary/75" : "text-muted-foreground",
                      )}
                    >
                      <span dir="rtl" lang="ar">
                        {reciter.arabicName}
                      </span>
                      {reciter.hasWordTiming && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <AudioLines className="size-3" strokeWidth={2} />
                          Word Sync
                        </span>
                      )}
                    </span>
                  </span>
                  {active && <Check className="size-5 shrink-0" strokeWidth={2} />}
                </button>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

