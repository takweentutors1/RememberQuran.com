"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Clipboard, Download, ImageIcon, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { AyahPicker } from "@/components/quran/AyahPicker"
import {
  MEDIA_PRESETS,
  type MediaPresetId,
  getMediaPreset,
  isMediaPresetId,
  truncateText,
  arabicFontSize,
} from "@/lib/media/card-presets"
import { parseVerseKey } from "@/lib/quran/verse-key"

interface AyahCardDesignerProps {
  initialVerse?: string
  initialPreset?: string
}

interface AyahCardData {
  verseKey: string
  arabic: string
  translation: string
  surahName: string
  surahArabic: string
}

function arabicSizeClass(length: number) {
  if (length > 280) return "text-[3cqw]"
  if (length > 180) return "text-[3.6cqw]"
  if (length > 100) return "text-[4.2cqw]"
  return "text-[5.3cqw]"
}

function supportsFileShare() {
  const sharing = navigator as unknown as {
    share?: Navigator["share"]
    canShare?: Navigator["canShare"]
  }
  if (!sharing.share || !sharing.canShare) return false
  const testFile = new File([""], "ayah.png", { type: "image/png" })
  return sharing.canShare({ files: [testFile] })
}

export function AyahCardDesigner({
  initialVerse = "2:255",
  initialPreset = "jade",
}: AyahCardDesignerProps) {
  const [preset, setPreset] = useState<MediaPresetId>(
    isMediaPresetId(initialPreset) ? initialPreset : "jade",
  )
  const [appliedVerse, setAppliedVerse] = useState(() => {
    const parsed = parseVerseKey(initialVerse)
    return parsed ? `${parsed.surahId}:${parsed.ayahId}` : "2:255"
  })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<AyahCardData | null>(null)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const colors = getMediaPreset(preset)

  useEffect(() => {
    queueMicrotask(() => setCanNativeShare(supportsFileShare()))
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/media/ayah?verse=${encodeURIComponent(appliedVerse)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as
          | AyahCardData
          | { error?: string }
        if (!response.ok || !("arabic" in body)) {
          throw new Error(
            "error" in body && body.error
              ? body.error
              : "Could not load this ayah.",
          )
        }
        setCard(body)
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return
        setError(
          reason instanceof Error ? reason.message : "Could not load this ayah.",
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [appliedVerse])

  function selectVerse(nextVerse: string) {
    const parsed = parseVerseKey(nextVerse)
    if (!parsed) {
      setError("Use a valid ayah like 2:255")
      return
    }
    const key = `${parsed.surahId}:${parsed.ayahId}`
    setError(null)
    if (key === appliedVerse) return
    setLoading(true)
    setCard(null)
    setAppliedVerse(key)
  }

  async function renderPng() {
    if (!cardRef.current || !card) throw new Error("Card is not ready")
    await document.fonts.ready

    const nodeWidth = cardRef.current.offsetWidth
    if (nodeWidth <= 0) throw new Error("Card has no measurable width")
    const { toPng } = await import("html-to-image")
    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 1200 / nodeWidth,
    })
  }

  function downloadDataUrl(dataUrl: string) {
    const anchor = document.createElement("a")
    anchor.href = dataUrl
    anchor.download = `rememberquran-${appliedVerse.replace(":", "-")}.png`
    anchor.click()
  }

  async function downloadPng() {
    setBusy(true)
    setError(null)
    try {
      downloadDataUrl(await renderPng())
    } catch {
      setError("Couldn’t create the PNG. Try again.")
    } finally {
      setBusy(false)
    }
  }

  async function exportSecondary() {
    setBusy(true)
    setCopied(false)
    setError(null)
    try {
      const dataUrl = await renderPng()
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File(
        [blob],
        `rememberquran-${appliedVerse.replace(":", "-")}.png`,
        { type: "image/png" },
      )
      if (canNativeShare) {
        await navigator.share({
          files: [file],
          title: `Quran ${appliedVerse}`,
          text: `Ayah ${appliedVerse} — RememberQuran.com`,
        })
        return
      }

      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("clipboard unavailable")
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ])
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return
      setError(
        canNativeShare
          ? "Couldn’t share the image. Try again."
          : "Your browser couldn’t copy the image. Use Download PNG instead.",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AyahPicker value={appliedVerse} onChange={selectVerse} />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs text-muted-foreground">Preset</legend>
        <ToggleGroup
          value={[preset]}
          onValueChange={(values) => {
            const next = values[0]
            if (isMediaPresetId(next)) setPreset(next)
          }}
          variant="outline"
          spacing={2}
          aria-label="Card color preset"
          className="flex-wrap"
        >
          {MEDIA_PRESETS.map((p) => (
            <ToggleGroupItem
              key={p.id}
              value={p.id}
              aria-label={`${p.label} preset`}
              className="gap-2 px-3"
            >
              <span
                className="size-3.5 rounded-sm border border-border/60"
                style={{ background: p.background }}
                aria-hidden
              />
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <div className="overflow-hidden rounded-[28px] border border-border bg-muted/30 shadow-sm">
        {loading || !card ? (
          <div className="flex aspect-40/21 items-center justify-center text-sm text-muted-foreground">
            {loading ? "Preparing your ayah card…" : "Preview unavailable"}
          </div>
        ) : (
          <div
            ref={cardRef}
            role="img"
            aria-label={`Ayah card for ${card.verseKey}`}
            className="relative flex aspect-40/21 w-full flex-col justify-between overflow-hidden rounded-[28px] p-[5cqw] @container"
            style={{
              background: colors.background,
              color: colors.foreground,
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-[2.2cqw]">
              <p
                dir="rtl"
                lang="ar"
                className={`font-uthmani text-center leading-[1.8] ${arabicSizeClass(card.arabic.length)}`}
              >
                {card.arabic}
              </p>
              <p
                className="mx-auto max-w-[88%] text-center font-serif text-[2.15cqw] leading-[1.45]"
                style={{ color: colors.muted }}
              >
                {truncateText(card.translation, 280)}
              </p>
            </div>

            <div
              className="mt-[2cqw] flex items-end justify-between border-t pt-[2cqw]"
              style={{ borderColor: `${colors.accent}55` }}
            >
              <div className="flex flex-col gap-[0.2cqw]">
                <p
                  className="font-serif text-[1.9cqw]"
                  style={{ color: colors.accent }}
                >
                  {card.surahName}
                </p>
                <p className="text-[1.55cqw]" style={{ color: colors.muted }}>
                  {card.verseKey}
                </p>
              </div>
              <div className="flex items-center gap-[0.7cqw]">
                <span
                  className="size-[1.1cqw] rounded-full"
                  style={{ backgroundColor: colors.accent }}
                />
                <p className="font-serif text-[1.55cqw]" style={{ color: colors.muted }}>
                  Remember Quran
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="lg"
          disabled={busy || loading || !card}
          onClick={() => void downloadPng()}
        >
          <Download data-icon="inline-start" />
          {busy ? "Working…" : "Download PNG"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={busy || loading || !card}
          onClick={() => void exportSecondary()}
          className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
        >
          {canNativeShare ? (
            <Share2 data-icon="inline-start" />
          ) : copied ? (
            <Check data-icon="inline-start" />
          ) : (
            <Clipboard data-icon="inline-start" />
          )}
          {canNativeShare ? "Share" : copied ? "Copied" : "Copy image"}
        </Button>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:ml-2">
          <ImageIcon className="size-3.5" strokeWidth={1.75} />
          Free — no account needed
        </p>
      </div>
    </div>
  )
}
