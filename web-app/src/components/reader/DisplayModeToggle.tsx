"use client"

import { LayoutList, AlignLeft } from "lucide-react"
import { useReaderSettings, type DisplayMode } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

const OPTIONS: {
  value: DisplayMode
  label: string
  description: string
  icon: typeof LayoutList
}[] = [
  {
    value: "verse",
    label: "Verse by verse",
    description: "Each ayah on its own, with translation underneath",
    icon: LayoutList,
  },
  {
    value: "reading",
    label: "Reading",
    description: "Continuous Arabic flow, like a printed mushaf",
    icon: AlignLeft,
  },
]

export function DisplayModeToggle() {
  const { displayMode, setDisplayMode } = useReaderSettings()

  return (
    <div
      role="radiogroup"
      aria-label="Display mode"
      className="grid grid-cols-1 gap-1.5"
    >
      {OPTIONS.map(({ value, label, description, icon: Icon }) => {
        const active = displayMode === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setDisplayMode(value)}
            className={cn(
              "flex w-full items-start gap-3 rounded-md px-2.5 py-2.5 text-left",
              "transition-colors duration-[120ms]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border",
                active
                  ? "border-primary/25 bg-primary/10"
                  : "border-border bg-muted/60 text-muted-foreground",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px] leading-snug",
                  active ? "text-primary/75" : "text-muted-foreground",
                )}
              >
                {description}
              </span>
            </span>
            <span
              className={cn(
                "mt-1 size-1.5 shrink-0 rounded-full",
                active ? "bg-primary" : "border border-muted-foreground/40",
              )}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
