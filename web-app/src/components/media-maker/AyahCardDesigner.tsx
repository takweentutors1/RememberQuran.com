"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
import { getChapterAudio } from "@/lib/audioApi"
import { DEFAULT_RECITER_ID, getReciter } from "@/lib/audioSources"
import { sanitizeTimings } from "@/lib/wordSync"
import { cn } from "@/lib/utils"

interface AyahCardDesignerProps {
  initialVerse?: string
  initialPreset?: string
}

interface AyahCardWord {
  position: number
  text: string
  isEndMarker: boolean
}

interface AyahCardVerseWords {
  verseNumber: number
  words: AyahCardWord[]
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
  words?: AyahCardVerseWords[]
}

interface FlatWord extends AyahCardWord {
  verseNumber: number
}

/** Highlight-eligible words in verse/position order, dropping ayah-number markers. */
function flattenWords(card: AyahCardData | null): FlatWord[] {
  if (!card?.words) return []
  return card.words.flatMap((v) =>
    v.words.map((w) => ({ ...w, verseNumber: v.verseNumber })),
  )
}

function arabicSizeClass(length: number) {
  if (length > 280) return "text-[2.8cqw]"
  if (length > 180) return "text-[3.4cqw]"
  if (length > 100) return "text-[4cqw]"
  return "text-[5.2cqw]"
}

interface ActiveSegment {
  globalIndex: number
  /** ms from the start of the combined (concatenated) export audio */
  start: number
  end: number
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function setWordHighlighted(
  el: HTMLSpanElement | null | undefined,
  active: boolean,
  accentColor: string,
) {
  if (!el) return
  if (active) {
    el.style.backgroundColor = `${accentColor}40`
    el.style.color = accentColor
    el.style.boxShadow = `0 0 0 0.15em ${accentColor}40`
  } else {
    el.style.backgroundColor = ""
    el.style.color = ""
    el.style.boxShadow = ""
  }
}

/** Sample-copy concat — buffers come from the same reciter/pipeline so a
 * shared sample rate is expected; no resampling attempted. */
function concatAudioBuffers(ctx: AudioContext, buffers: AudioBuffer[]): AudioBuffer {
  const numberOfChannels = Math.max(...buffers.map((b) => b.numberOfChannels))
  const sampleRate = buffers[0].sampleRate
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0)
  const out = ctx.createBuffer(numberOfChannels, totalLength, sampleRate)
  let offset = 0
  for (const b of buffers) {
    for (let ch = 0; ch < numberOfChannels; ch++) {
      out.getChannelData(ch).set(b.getChannelData(ch < b.numberOfChannels ? ch : 0), offset)
    }
    offset += b.length
  }
  return out
}

/**
 * Word-highlight timeline for the video export, reusing the same QDC
 * chapter-timing segments the reader's listen mode syncs to (see
 * src/lib/wordSync.ts). Best-effort: any failure (unsupported reciter,
 * network) just means the video exports without highlighting.
 */
async function buildActiveSegments(
  surahId: number,
  verseNumbers: number[],
  verseBuffers: AudioBuffer[],
  flatWords: FlatWord[],
): Promise<ActiveSegment[]> {
  if (!getReciter(DEFAULT_RECITER_ID).hasWordTiming || flatWords.length === 0) return []
  try {
    const chapterFile = await getChapterAudio(DEFAULT_RECITER_ID, surahId)
    const cleanTimings = sanitizeTimings(chapterFile.verse_timings)
    const wordIndex = new Map<string, number>()
    flatWords.forEach((w, i) => {
      if (!w.isEndMarker) wordIndex.set(`${w.verseNumber}:${w.position}`, i)
    })

    const segments: ActiveSegment[] = []
    let cumulativeMs = 0
    verseNumbers.forEach((vn, i) => {
      const timing = cleanTimings.find((t) => t.verseNumber === vn)
      if (timing) {
        for (const [pos, segStart, segEnd] of timing.segments) {
          const globalIndex = wordIndex.get(`${vn}:${pos}`)
          if (globalIndex === undefined) continue
          segments.push({
            globalIndex,
            start: cumulativeMs + Math.max(0, segStart - timing.from),
            end: cumulativeMs + Math.max(0, segEnd - timing.from),
          })
        }
      }
      cumulativeMs += verseBuffers[i].duration * 1000
    })
    return segments.sort((a, b) => a.start - b.start)
  } catch (err) {
    console.warn("Word timing unavailable, exporting without highlight", err)
    return []
  }
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
  const videoFrameRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  const colors = getMediaPreset(preset)
  const flatWords = useMemo(() => flattenWords(card), [card])

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

  async function renderVideoFramePng() {
    if (!videoFrameRef.current) throw new Error("Video frame is not ready")
    await document.fonts.ready
    const { toPng } = await import("html-to-image")
    return toPng(videoFrameRef.current, { cacheBust: true, pixelRatio: 1 })
  }

  async function exportVideo() {
    if (!videoFrameRef.current || !card) return
    setVideoBusy(true)
    setError(null)

    let animId: number | null = null
    let audioCtx: AudioContext | null = null

    try {
      // 1. Full-bleed frame (no card chrome), no highlight yet
      let latestImg = await loadImage(await renderVideoFramePng())

      // 2. Canvas stream with continuous redraw loop. onFrameTick is wired up
      //    below once we know whether word-highlight timing is available.
      const canvas = document.createElement("canvas")
      canvas.width = 1200
      canvas.height = 630
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(latestImg, 0, 0, 1200, 630)

      let onFrameTick: (() => void) | null = null
      const drawLoop = () => {
        ctx.drawImage(latestImg, 0, 0, 1200, 630)
        onFrameTick?.()
        animId = requestAnimationFrame(drawLoop)
      }
      animId = requestAnimationFrame(drawLoop)

      const canvasStream = canvas.captureStream ? canvas.captureStream(30) : (canvas as unknown as { mozCaptureStream: (fps: number) => MediaStream }).mozCaptureStream(30)

      // 3. Verse range for this card — audio is fetched per-verse (small,
      //    reliable clips) and concatenated so multi-verse cards get full
      //    audio coverage, not just the first ayah.
      const surahId = card.surahId || Number(card.verseKey.split(":")[0]) || 1
      const startAyah = card.startAyah || Number(card.verseKey.split(":")[1]?.split("–")[0]) || 1
      const endAyah = card.endAyah || startAyah
      const verseNumbers = Array.from({ length: endAyah - startAyah + 1 }, (_, i) => startAyah + i)

      // 4. Setup Audio Stream (concatenated WebAudio buffers + highlight, or
      //    single-clip MediaElementSource fallback with no highlight)
      let combinedStream: MediaStream
      let durationSec = 10
      let startPlay: () => Promise<void>
      let onAudioEnd: (cb: () => void) => void

      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtx = new AudioCtxClass()
        if (audioCtx.state === "suspended") {
          await audioCtx.resume()
        }

        const verseBuffers = await Promise.all(
          verseNumbers.map(async (vn) => {
            const res = await fetch(`/api/media/audio?surah=${surahId}&ayah=${vn}`)
            if (!res.ok) throw new Error("Audio fetch failed")
            const arrayBuffer = await res.arrayBuffer()
            return audioCtx!.decodeAudioData(arrayBuffer.slice(0))
          }),
        )
        const combinedBuffer =
          verseBuffers.length === 1 ? verseBuffers[0] : concatAudioBuffers(audioCtx, verseBuffers)
        durationSec = combinedBuffer.duration || 10

        const activeSegments = await buildActiveSegments(surahId, verseNumbers, verseBuffers, flatWords)

        const bufferSource = audioCtx.createBufferSource()
        bufferSource.buffer = combinedBuffer
        const dest = audioCtx.createMediaStreamDestination()
        bufferSource.connect(dest)

        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ])

        let activeIndex = -1
        let snapshotInFlight = false
        let startTimestamp = 0

        const updateHighlight = async (nextIndex: number) => {
          if (snapshotInFlight || nextIndex === activeIndex) return
          snapshotInFlight = true
          const previousIndex = activeIndex
          activeIndex = nextIndex
          try {
            setWordHighlighted(wordRefs.current[previousIndex], false, colors.accent)
            setWordHighlighted(wordRefs.current[nextIndex], true, colors.accent)
            latestImg = await loadImage(await renderVideoFramePng())
          } catch {
            // Keep showing the previous frame — not worth aborting the export over.
          } finally {
            snapshotInFlight = false
          }
        }

        if (activeSegments.length > 0) {
          onFrameTick = () => {
            const elapsedMs = (audioCtx!.currentTime - startTimestamp) * 1000
            const seg = activeSegments.find((s) => elapsedMs >= s.start && elapsedMs < s.end)
            void updateHighlight(seg ? seg.globalIndex : -1)
          }
        }

        startPlay = async () => {
          startTimestamp = audioCtx!.currentTime
          bufferSource.start(0)
        }
        onAudioEnd = (cb) => {
          bufferSource.onended = cb
        }
      } catch (audioErr) {
        console.warn("Multi-verse WebAudio pipeline failed, falling back to single-clip Audio element", audioErr)
        const audio = new Audio()
        audio.crossOrigin = "anonymous"
        audio.src = `/api/media/audio?surah=${surahId}&ayah=${startAyah}`

        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtx = new AudioCtxClass()
        if (audioCtx.state === "suspended") {
          await audioCtx.resume()
        }

        const source = audioCtx.createMediaElementSource(audio)
        const dest = audioCtx.createMediaStreamDestination()
        source.connect(dest)

        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ])

        startPlay = async () => {
          await audio.play()
        }
        onAudioEnd = (cb) => {
          audio.onended = cb
        }
      }

      // 5. Select compatible MIME type
      const mimeCandidates = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4;codecs=avc1,mp4a.40.2",
        "video/mp4",
      ]
      const supportedMime =
        typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function"
          ? mimeCandidates.find((type) => MediaRecorder.isTypeSupported(type)) || ""
          : ""

      const recorderOptions: MediaRecorderOptions = supportedMime ? { mimeType: supportedMime } : {}
      const recorder = new MediaRecorder(combinedStream, recorderOptions)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          if (animId) cancelAnimationFrame(animId)
          const actualType = supportedMime || recorder.mimeType || "video/webm"
          resolve(new Blob(chunks, { type: actualType }))
        }
        recorder.onerror = (err) => {
          if (animId) cancelAnimationFrame(animId)
          reject(err)
        }
      })

      recorder.start(100)
      await startPlay()

      onAudioEnd(() => {
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop()
          }
        }, 300)
      })

      // Safety timeout after audio ends
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop()
        }
      }, Math.max((durationSec + 2) * 1000, 6000))

      const videoBlob = await recordPromise
      const ext = (supportedMime || recorder.mimeType || "").includes("mp4") ? "mp4" : "webm"
      const videoUrl = URL.createObjectURL(videoBlob)
      downloadDataUrl(videoUrl, ext)
    } catch (err: unknown) {
      console.error("Video export error:", err)
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Video export error: ${msg}. Please try again or download PNG.`)
    } finally {
      if (animId) cancelAnimationFrame(animId)
      wordRefs.current.forEach((el) => setWordHighlighted(el, false, colors.accent))
      if (audioCtx) {
        void audioCtx.close().catch(() => {})
      }
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

      {/* Off-screen render target for video export: full-bleed background (no
          card chrome) with per-word spans so exportVideo can highlight the
          currently-recited word, matching the reader's listen-mode look. */}
      {card && (
        <div
          ref={videoFrameRef}
          aria-hidden
          className="pointer-events-none fixed left-[-9999px] top-0 flex h-[630px] w-[1200px] flex-col justify-between p-[5cqw] @container"
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
              {flatWords.map((w, i) => (
                <span key={i}>
                  <span
                    ref={(el) => {
                      wordRefs.current[i] = el
                    }}
                    data-word-idx={i}
                    style={{ borderRadius: "0.2em", transition: "background-color 120ms ease, color 120ms ease" }}
                  >
                    {w.text}
                  </span>{" "}
                </span>
              ))}
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
              <p className="font-serif text-[1.9cqw]" style={{ color: colors.accent }}>
                {card.surahName}
              </p>
              <p className="text-[1.55cqw]" style={{ color: colors.muted }}>
                Ayah {card.verseKey}
              </p>
            </div>
            <div className="flex items-center gap-[0.7cqw]">
              <span className="size-[1.1cqw] rounded-full" style={{ backgroundColor: colors.accent }} />
              <p className="font-serif text-[1.55cqw]" style={{ color: colors.muted }}>
                Remember Quran
              </p>
            </div>
          </div>
        </div>
      )}

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
