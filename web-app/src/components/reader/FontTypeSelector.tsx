"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { QURAN_FONT_OPTIONS, type QuranFont } from "@/lib/readerFonts"
import { cn } from "@/lib/utils"

export function FontTypeSelector() {
  const { quranFont, setQuranFont } = useReaderSettings()

  return (
    <div role="radiogroup" aria-label="Arabic font" className="grid grid-cols-1 gap-1.5">
      {QURAN_FONT_OPTIONS.map((opt) => {
        const active = quranFont === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setQuranFont(opt.value as QuranFont)}
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
                "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md border",
                active
                  ? "border-primary/25 bg-primary/10"
                  : "border-border bg-muted/60 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "text-base leading-none",
                  opt.value === "uthmani" ? "font-uthmani" : "font-amiri-quran",
                )}
                dir="rtl"
                lang="ar"
              >
                بسم
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{opt.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px] leading-snug",
                  active ? "text-primary/75" : "text-muted-foreground",
                )}
              >
                {opt.description}
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
