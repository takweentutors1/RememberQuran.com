"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Clipboard, Download, ImageIcon, Share2, Video, Loader2 } from "lucide-react"
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
} from "@/lib/media/card-presets"
import { parseVerseKey } from "@/lib/quran/verse-key"
import { cn } from "@/lib/utils"

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
  surahId?: number
  startAyah?: number
  endAyah?: number
}

function arabicSizeClass(length: number) {
  if (length > 280) return "text-[2.8cqw]"
  if (length > 180) return "text-[3.4cqw]"
  if (length > 100) return "text-[4cqw]"
  return "text-[5.2cqw]"
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
  initialPreset = "minimal",
}: AyahCardDesignerProps) {
  const [preset, setPreset] = useState<MediaPresetId>(
    isMediaPresetId(initialPreset) ? initialPreset : "minimal",
  )
  const [appliedVerse, setAppliedVerse] = useState(() => {
    return initialVerse || "2:255"
  })
  const [endAyahOffset, setEndAyahOffset] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [videoBusy, setVideoBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<AyahCardData | null>(null)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const colors = getMediaPreset(preset)

  useEffect(() => {
    queueMicrotask(() => setCanNativeShare(supportsFileShare()))
  }, [])

  const currentQueryKey = (() => {
    const base = parseVerseKey(appliedVerse)
    if (!base) return appliedVerse
    if (endAyahOffset > 0) {
      return `${base.surahId}:${base.ayahId}-${base.ayahId + endAyahOffset}`
    }
    return `${base.surahId}:${base.ayahId}`
  })()

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    fetch(`/api/media/ayah?verse=${encodeURIComponent(currentQueryKey)}`, {
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
              : "Could not load this passage.",
          )
        }
        setCard(body)
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return
        setError(
          reason instanceof Error ? reason.message : "Could not load this passage.",
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [currentQueryKey])

  function selectVerse(nextVerse: string) {
    const parsed = parseVerseKey(nextVerse)
    if (!parsed) {
      setError("Use a valid ayah like 2:255")
      return
    }
    const key = `${parsed.surahId}:${parsed.ayahId}`
    setError(null)
    setAppliedVerse(key)
    setEndAyahOffset(0)
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

  function downloadDataUrl(dataUrl: string, ext = "png") {
    const anchor = document.createElement("a")
    anchor.href = dataUrl
    anchor.download = `rememberquran-${currentQueryKey.replace(/[:–]/g, "-")}.${ext}`
    anchor.click()
  }

  async function downloadPng() {
    setBusy(true)
    setError(null)
    try {
      downloadDataUrl(await renderPng(), "png")
    } catch {
      setError("Couldn’t create the PNG. Try again.")
    } finally {
      setBusy(false)
    }
  }

  async function exportVideo() {
    if (!cardRef.current || !card) return
    setVideoBusy(true)
    setError(null)

    try {
      // 1. Render card image to Image element
      const pngUrl = await renderPng()
      const img = new Image()
      img.src = pngUrl
      await new Promise((resolve) => {
        img.onload = resolve
      })

      // 2. Fetch Verse Recitation Audio (Alafasy default)
      const surahNum = card.surahId || Number(card.verseKey.split(":")[0]) || 1
      const ayahNum = card.startAyah || Number(card.verseKey.split(":")[1]?.split("–")[0]) || 1
      const audioUrl = `https://verses.qurancdn.com/Alafasy/mp3/${String(surahNum).padStart(3, "0")}${String(ayahNum).padStart(3, "0")}.mp3`

      const audio = new Audio()
      audio.crossOrigin = "anonymous"
      audio.src = audioUrl

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const source = audioCtx.createMediaElementSource(audio)
      const dest = audioCtx.createMediaStreamDestination()
      source.connect(dest)
      source.connect(audioCtx.destination)

      // 3. Setup canvas stream
      const canvas = document.createElement("canvas")
      canvas.width = 1200
      canvas.height = 630
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, 1200, 630)

      const canvasStream = canvas.captureStream(30)
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ])

      const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
        ? "video/mp4"
        : "video/webm"
      const recorder = new MediaRecorder(combinedStream, { mimeType })
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }))
        }
        recorder.onerror = reject
      })

      recorder.start()
      await audio.play()

      audio.onended = () => {
        recorder.stop()
      }

      // Safety timeout after 30s
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop()
        }
      }, 30000)

      const videoBlob = await recordPromise
      const videoUrl = URL.createObjectURL(videoBlob)
      downloadDataUrl(videoUrl, mimeType === "video/mp4" ? "mp4" : "webm")
    } catch {
      setError("Video export requires audio permissions or wasn't supported on this device.")
    } finally {
      setVideoBusy(false)
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
        `rememberquran-${currentQueryKey.replace(/[:–]/g, "-")}.png`,
        { type: "image/png" },
      )
      if (canNativeShare) {
        await navigator.share({
          files: [file],
          title: `Quran ${currentQueryKey}`,
          text: `Ayah ${currentQueryKey} — RememberQuran.com`,
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
      {/* Passage Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 w-full">
          <AyahPicker value={appliedVerse} onChange={selectVerse} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Passage span:</span>
          <div className="flex rounded-md border border-border bg-card p-0.5 text-xs">
            {[0, 1, 2].map((offset) => (
              <button
                key={offset}
                type="button"
                onClick={() => setEndAyahOffset(offset)}
                className={cn(
                  "px-2.5 py-1 rounded-sm font-medium transition-colors",
                  endAyahOffset === offset
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {offset === 0 ? "Single Ayah" : `+${offset} Verses`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs text-muted-foreground">Preset Theme</legend>
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
                {truncateText(card.translation, 300)}
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
                  Ayah {card.verseKey}
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
          disabled={busy || videoBusy || loading || !card}
          onClick={() => void downloadPng()}
        >
          <Download data-icon="inline-start" />
          {busy ? "Working…" : "Download PNG"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={busy || videoBusy || loading || !card}
          onClick={() => void exportVideo()}
          className="border-primary/40 hover:bg-primary/5"
        >
          {videoBusy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Video data-icon="inline-start" />}
          {videoBusy ? "Rendering Video…" : "Export Video (Audio)"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={busy || videoBusy || loading || !card}
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
          Free high-res export
        </p>
      </div>
    </div>
  )
}
