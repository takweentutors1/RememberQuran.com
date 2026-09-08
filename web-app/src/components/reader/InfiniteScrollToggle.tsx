"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { Switch } from "@/components/ui/switch"

export function InfiniteScrollToggle() {
  const { infiniteScroll, setInfiniteScroll } = useReaderSettings()

  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <span className="block text-sm">Infinite scroll</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          Auto-load the next surah as you scroll
        </span>
      </div>
      <Switch checked={infiniteScroll} onCheckedChange={setInfiniteScroll} />
    </div>
  )
}
