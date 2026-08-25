"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { Switch } from "@/components/ui/switch"

export function TajweedToggle() {
  const { tajweedEnabled, setTajweedEnabled } = useReaderSettings()

  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <span className="block text-sm">Tajweed colours</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          Highlight pronunciation rules in Arabic text
        </span>
      </div>
      <Switch checked={tajweedEnabled} onCheckedChange={setTajweedEnabled} />
    </div>
  )
}
