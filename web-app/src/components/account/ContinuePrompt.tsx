"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowRight, BookOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChapterMeta } from "@/context/ChaptersContext"
import { CONTINUE_DISMISS_KEY } from "@/lib/progress/date"
import { cn } from "@/lib/utils"

export interface LastPositionDto {
  verseKey: string
  surahId: number
  ayahId: number
  updatedAt: string
  surahName?: string
}

interface ContinuePromptProps {
  className?: string
  /** Optional server-provided position (skips fetch) */
  initialPosition?: LastPositionDto | null
  /** Optional surah name map for labels */
  surahName?: string
}

function dismissKey(pos: LastPositionDto) {
  return `${pos.verseKey}|${pos.updatedAt}`
}

function isDismissed(pos: LastPositionDto) {
  try {
    return sessionStorage.getItem(CONTINUE_DISMISS_KEY) === dismissKey(pos)
  } catch {
    return false
  }
}

function setDismissed(pos: LastPositionDto) {
  try {
    sessionStorage.setItem(CONTINUE_DISMISS_KEY, dismissKey(pos))
  } catch {
    // ignore
  }
}

function relativeReadLabel(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return "Continue your reading"
  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 14) return `${days} days ago`
  return "Continue your reading"
}

/**
 * Dismissible resume card for signed-in users.
 * Hidden when there is no position, dismissed this session, or already on that ayah.
 */
export function ContinuePrompt({
  className,
  initialPosition,
  surahName,
}: ContinuePromptProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [position, setPosition] = useState<LastPositionDto | null>(
    initialPosition ?? null,
  )
  const [hidden, setHidden] = useState(false)
  const [loaded, setLoaded] = useState(initialPosition !== undefined)
  const chapter = useChapterMeta(position?.surahId)

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      queueMicrotask(() => {
        setPosition(null)
        setLoaded(true)
      })
      return
    }
    if (initialPosition !== undefined) {
      queueMicrotask(() => setLoaded(true))
      return
    }

    let cancelled = false
    fetch("/api/account/progress")
      .then(async (res) => {
        if (!res.ok) return null
        const data = (await res.json()) as {
          lastPosition?: LastPositionDto | null
        }
        return data.lastPosition ?? null
      })
      .then((pos) => {
        if (cancelled) return
        setPosition(pos)
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user, status, initialPosition])

  if (!loaded || !position || hidden) return null
  if (isDismissed(position)) return null

  const href = `/${position.surahId}/${position.ayahId}`
  if (pathname === href) return null

  const label =
    surahName ||
    position.surahName ||
    chapter?.name_simple ||
    `Surah ${position.surahId}`

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
      role="status"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary"
      />
      <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <BookOpen className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
            Continue reading
          </p>
          <p className="mt-1 truncate font-serif text-lg font-medium tracking-tight">
            {label} · Ayah {position.ayahId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {relativeReadLabel(position.updatedAt)} · {position.verseKey}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            nativeButton={false}
            render={<Link href={href} />}
            size="sm"
          >
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
          <button
            type="button"
            title="Dismiss"
            aria-label="Dismiss continue prompt"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              setDismissed(position)
              setHidden(true)
            }}
          >
            <X className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  )
}
