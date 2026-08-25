"use client"

import { useState } from "react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { useSurahContent } from "@/context/SurahContentContext"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { normalizeHideRange } from "@/lib/quran/verse-key"
import { cn } from "@/lib/utils"

function scrollToAyah(ayahNum: number) {
  const el = document.getElementById(`ayah-${ayahNum}`)
  if (!el) return
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  })
}

export function HideArabicToggle({
  onRequestClose,
}: {
  /** Close settings after Apply starts a hide-range practice session. */
  onRequestClose?: () => void
} = {}) {
  const {
    hideArabic,
    setHideArabic,
    hideArabicRange,
    setHideArabicRange,
    revealAllInHideScope,
    hideAllInHideScope,
  } = useReaderSettings()
  const { chapter, surahId, targetAyahId } = useSurahContent()
  const maxAyah = chapter?.verses_count ?? 0
  const rangeReady = maxAyah > 0 && surahId != null

  const [scopeMode, setScopeMode] = useState<"all" | "range">(
    hideArabicRange ? "range" : "all",
  )
  const [draftStart, setDraftStart] = useState(
    hideArabicRange ? String(hideArabicRange.start) : "",
  )
  const [draftEnd, setDraftEnd] = useState(
    hideArabicRange ? String(hideArabicRange.end) : "",
  )

  // Keep local draft in sync when range is cleared (e.g. surah change) —
  // done during render via a tracked-key comparison rather than an effect,
  // so there's no extra render+effect round trip.
  const rangeKey = hideArabicRange
    ? `${hideArabicRange.start}:${hideArabicRange.end}`
    : null
  const [trackedRangeKey, setTrackedRangeKey] = useState(rangeKey)
  if (rangeKey !== trackedRangeKey) {
    setTrackedRangeKey(rangeKey)
    if (!hideArabicRange) {
      setScopeMode("all")
      setDraftStart("")
      setDraftEnd("")
    } else {
      setScopeMode("range")
      setDraftStart(String(hideArabicRange.start))
      setDraftEnd(String(hideArabicRange.end))
    }
  }

  const placeholderStart = targetAyahId ?? 1
  const placeholderEnd = rangeReady
    ? Math.min(placeholderStart + 5, maxAyah)
    : placeholderStart

  function selectAll() {
    setScopeMode("all")
    setHideArabicRange(null)
    setDraftStart("")
    setDraftEnd("")
  }

  function selectRange() {
    setScopeMode("range")
    if (!rangeReady) return
    const next = normalizeHideRange(
      Number(draftStart) || placeholderStart,
      Number(draftEnd) || placeholderEnd,
      maxAyah,
    )
    if (!next) return
    setHideArabicRange(next)
    setDraftStart(String(next.start))
    setDraftEnd(String(next.end))
  }

  function applyRange() {
    if (!rangeReady) return
    const next = normalizeHideRange(draftStart, draftEnd, maxAyah)
    if (!next) return
    setHideArabicRange(next)
    setDraftStart(String(next.start))
    setDraftEnd(String(next.end))
    setScopeMode("range")
    onRequestClose?.()
    // Wait for sheet close animation before scrolling
    window.setTimeout(() => scrollToAyah(next.start), 250)
  }

  const segBtn = (active: boolean) =>
    cn(
      "flex-1 rounded-md px-2 py-1.5 text-xs font-medium",
      "transition-colors duration-[120ms]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-accent",
      !rangeReady && "pointer-events-none opacity-40",
    )

  return (
    <div className="space-y-2 rounded-md px-2.5 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="block text-sm">Hide Arabic</span>
          <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
            Blur ayahs for memorisation — tap to reveal or hide again
          </span>
        </div>
        <Switch checked={hideArabic} onCheckedChange={setHideArabic} />
      </div>

      {hideArabic && (
        <div className="space-y-2 border-t border-border/50 pt-2">
          <div
            role="radiogroup"
            aria-label="Hide scope"
            className="flex gap-1 rounded-lg bg-muted/60 p-0.5"
          >
            <button
              type="button"
              role="radio"
              aria-checked={scopeMode === "all"}
              onClick={selectAll}
              className={segBtn(scopeMode === "all")}
            >
              All ayahs
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={scopeMode === "range"}
              disabled={!rangeReady}
              onClick={selectRange}
              className={segBtn(scopeMode === "range")}
            >
              Range
            </button>
          </div>

          {scopeMode === "range" && (
            <div className="flex items-end gap-2">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-muted-foreground">
                From
                <Input
                  type="number"
                  min={1}
                  max={maxAyah || undefined}
                  inputMode="numeric"
                  disabled={!rangeReady}
                  placeholder={String(placeholderStart)}
                  value={draftStart}
                  onChange={(e) => setDraftStart(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyRange()
                  }}
                  className="h-8 text-sm"
                />
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-muted-foreground">
                To
                <Input
                  type="number"
                  min={1}
                  max={maxAyah || undefined}
                  inputMode="numeric"
                  disabled={!rangeReady}
                  placeholder={String(placeholderEnd)}
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyRange()
                  }}
                  className="h-8 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={applyRange}
                disabled={!rangeReady}
                className={cn(
                  "h-8 shrink-0 rounded-md px-2.5 text-xs font-medium",
                  "bg-primary text-primary-foreground",
                  "transition-colors duration-[120ms] hover:bg-primary/90",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-40",
                )}
              >
                Apply
              </button>
            </div>
          )}

          {hideArabicRange && (
            <p className="text-[11px] text-muted-foreground">
              Hiding ayahs {hideArabicRange.start}–{hideArabicRange.end}
              {rangeReady ? ` of ${maxAyah}` : ""}
            </p>
          )}

          {rangeReady && surahId != null && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => revealAllInHideScope(surahId, maxAyah)}
                className={cn(
                  "flex-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-medium",
                  "text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                Reveal all
              </button>
              <button
                type="button"
                onClick={() => hideAllInHideScope(surahId, maxAyah)}
                className={cn(
                  "flex-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-medium",
                  "text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                Hide all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
