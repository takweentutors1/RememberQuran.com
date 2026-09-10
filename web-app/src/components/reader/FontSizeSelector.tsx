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

const SCALE_POSITIONS = [1, 2, 3, 4, 5, 6] as const

function ScaleTrack({
  value,
  onChange,
}: {
  value: FontScale
  onChange: (scale: FontScale) => void
}) {
  const percentage = ((value - MIN_FONT_SCALE) / (MAX_FONT_SCALE - MIN_FONT_SCALE)) * 100

  return (
    <div className="relative flex items-center gap-3 py-2">
      <button
        type="button"
        aria-label="Decrease size"
        disabled={value <= MIN_FONT_SCALE}
        onClick={() => onChange(Math.max(MIN_FONT_SCALE, value - 1) as FontScale)}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background",
          "text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
          "disabled:pointer-events-none disabled:opacity-30",
          FOCUS,
        )}
      >
        <Minus className="size-3" strokeWidth={2} />
      </button>

      <div className="relative flex-1 h-8 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted/80" />
        {/* Track fill */}
        <div
          className="absolute h-1.5 rounded-full bg-primary/60 transition-all duration-150 ease-out"
          style={{ width: `${percentage}%` }}
        />
        {/* Scale dots */}
        {SCALE_POSITIONS.map((pos) => {
          const left = ((pos - MIN_FONT_SCALE) / (MAX_FONT_SCALE - MIN_FONT_SCALE)) * 100
          const isActive = pos === value
          const isPast = pos <= value
          return (
            <button
              key={pos}
              type="button"
              aria-label={`Set size to ${FONT_SCALE_LABELS[pos]}`}
              onClick={() => onChange(pos)}
              className={cn(
                "absolute -translate-x-1/2 z-10 rounded-full transition-all duration-150",
                "hover:scale-125",
                isActive
                  ? "size-3.5 bg-primary ring-2 ring-primary/20"
                  : isPast
                    ? "size-2.5 bg-primary/70"
                    : "size-2.5 bg-border hover:bg-muted-foreground/50",
                FOCUS,
              )}
              style={{ left: `${left}%` }}
            />
          )
        })}
      </div>

      <button
        type="button"
        aria-label="Increase size"
        disabled={value >= MAX_FONT_SCALE}
        onClick={() => onChange(Math.min(MAX_FONT_SCALE, value + 1) as FontScale)}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background",
          "text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
          "disabled:pointer-events-none disabled:opacity-30",
          FOCUS,
        )}
      >
        <Plus className="size-3" strokeWidth={2} />
      </button>
    </div>
  )
}

function ScaleControl({
  label,
  hint,
  preview,
  value,
  onChange,
  onDecrease,
  onIncrease,
}: {
  label: string
  hint: string
  preview: ReactNode
  value: FontScale
  onChange: (scale: FontScale) => void
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary">
          {FONT_SCALE_LABELS[value]}
        </span>
      </div>

      {/* Live preview */}
      <div className="my-3 flex items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/30 px-4 py-3 min-h-[3rem]">
        {preview}
      </div>

      {/* Track */}
      <ScaleTrack value={value} onChange={onChange} />
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
    setArabicFontScale,
    setTranslationFontScale,
    increaseArabicFontScale,
    decreaseArabicFontScale,
    increaseTranslationFontScale,
    decreaseTranslationFontScale,
  } = useReaderSettings()

  return (
    <div className="space-y-3">
      <ScaleControl
        label="Arabic size"
        hint="Script size for ayah text"
        value={arabicFontScale}
        onChange={setArabicFontScale}
        onDecrease={decreaseArabicFontScale}
        onIncrease={increaseArabicFontScale}
        preview={
          <span
            className="leading-none text-foreground transition-all duration-150"
            dir="rtl"
            lang="ar"
            style={{
              fontFamily: arabicFontFamily,
              fontSize: `calc(${arabicFontSize} * 0.5)`,
            }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </span>
        }
      />
      <ScaleControl
        label="Translation size"
        hint="English meaning under each ayah"
        value={translationFontScale}
        onChange={setTranslationFontScale}
        onDecrease={decreaseTranslationFontScale}
        onIncrease={increaseTranslationFontScale}
        preview={
          <span
            className="truncate font-serif text-foreground transition-all duration-150"
            style={{ fontSize: `calc(${translationFontSize} * 0.9)` }}
          >
            In the name of Allah, the Most Gracious, the Most Merciful
          </span>
        }
      />
    </div>
  )
}
