"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { TAJWEED_RULES } from "@/lib/tajweed"

export function TajweedLegend() {
  const { tajweedEnabled } = useReaderSettings()
  if (!tajweedEnabled) return null

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1">
      {Object.entries(TAJWEED_RULES).map(([rule, { label }]) => (
        <div key={rule} className="flex items-center gap-1.5">
          <span
            className="size-2 flex-none rounded-full"
            style={{ background: `var(--tj-${rule})` }}
          />
          <span className="truncate text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
