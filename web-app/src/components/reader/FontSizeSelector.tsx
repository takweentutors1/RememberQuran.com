"use client"

import { Minus, Plus } from "lucide-react"
import type { ReactNode } from "react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import {
  FONT_SCALE_LABELS,
  MIN_FONT_SCALE,
  MAX_FONT_SCALE,
  type FontScale,
} from "@/lib/readerFonts"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function ScaleControl({
  label,
  hint,
  preview,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string
  hint: string
  preview: ReactNode
  value: FontScale
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <span className="shrink-0 rounded-md bg-background px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground ring-1 ring-border/60">
          {FONT_SCALE_LABELS[value]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= MIN_FONT_SCALE}
          onClick={onDecrease}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            "disabled:pointer-events-none disabled:opacity-30",
            FOCUS,
          )}
        >
          <Minus className="size-3.5" strokeWidth={1.75} />
        </button>

        <div className="flex min-h-10 flex-1 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background px-3">
          {preview}
        </div>

        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= MAX_FONT_SCALE}
          onClick={onIncrease}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            "disabled:pointer-events-none disabled:opacity-30",
            FOCUS,
          )}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

export function FontSizeSelector() {
  const {
    arabicFontScale,
    translationFontScale,
    arabicFontSize,
    translationFontSize,
    arabicFontFamily,
    increaseArabicFontScale,
    decreaseArabicFontScale,
    increaseTranslationFontScale,
    decreaseTranslationFontScale,
  } = useReaderSettings()

  return (
    <div className="space-y-2.5">
      <ScaleControl
        label="Arabic size"
        hint="Script size for ayah text"
        value={arabicFontScale}
        onDecrease={decreaseArabicFontScale}
        onIncrease={increaseArabicFontScale}
        preview={
          <span
            className="truncate leading-none text-foreground"
            dir="rtl"
            lang="ar"
            style={{
              fontFamily: arabicFontFamily,
              fontSize: `calc(${arabicFontSize} * 0.55)`,
            }}
          >
            بِسْمِ ٱللَّهِ
          </span>
        }
      />
      <ScaleControl
        label="Translation size"
        hint="English meaning under each ayah"
        value={translationFontScale}
        onDecrease={decreaseTranslationFontScale}
        onIncrease={increaseTranslationFontScale}
        preview={
          <span
            className="truncate font-serif text-foreground"
            style={{ fontSize: translationFontSize }}
          >
            In the name of Allah
          </span>
        }
      />
    </div>
  )
}
