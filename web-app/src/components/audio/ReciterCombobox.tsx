"use client"

import { AudioLines } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { RECITERS } from "@/lib/audioSources"
import type { Reciter } from "@/types/audio"
import { cn } from "@/lib/utils"

interface ReciterComboboxProps {
  value: number
  onChange: (reciterId: number) => void
  label?: string
  className?: string
}

function reciterLabel(reciter: Reciter) {
  const style = reciter.style ? ` · ${reciter.style}` : ""
  return `${reciter.name}${style}`
}

function ReciterRow({ reciter }: { reciter: Reciter }) {
  return (
    <>
      <span className="min-w-0 flex-1 truncate">
        <span className="block truncate">{reciter.name}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
          {reciter.style && <span>{reciter.style}</span>}
          <span dir="rtl" lang="ar">
            {reciter.arabicName}
          </span>
          {reciter.hasWordTiming && (
            <span className="inline-flex items-center gap-0.5">
              <AudioLines className="size-2.5" strokeWidth={2} />
              word sync
            </span>
          )}
        </span>
      </span>
    </>
  )
}

export function ReciterCombobox({
  value,
  onChange,
  label = "Reciter",
  className,
}: ReciterComboboxProps) {
  const selected = RECITERS.find((r) => r.id === value) ?? RECITERS[0]

  return (
    <Combobox
      items={RECITERS}
      value={selected}
      onValueChange={(reciter) => {
        if (reciter) onChange(reciter.id)
      }}
      itemToStringLabel={reciterLabel}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxInput
        aria-label={label}
        placeholder="Search reciter…"
        className={cn("w-full", className)}
        showClear={false}
      />
      <ComboboxContent className="min-w-[min(100vw-2rem,20rem)]">
        <ComboboxEmpty>No reciter found.</ComboboxEmpty>
        <ComboboxList>
          {(reciter: Reciter) => (
            <ComboboxItem key={reciter.id} value={reciter} className="items-start border-b border-border/50 py-2 last:border-b-0">
              <ReciterRow reciter={reciter} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
