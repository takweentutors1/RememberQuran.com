"use client"

import type { ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

interface HideableArabicProps {
  verseKey: string
  children: ReactNode
  className?: string
  /** Inline mushaf flow — blur only, no block hint under the ayah */
  compact?: boolean
}

/**
 * Wraps Arabic text for memorisation hide mode.
 * When enabled and in hide scope and not revealed: blur + block word tooltips; tap toggles reveal.
 * When revealed: Arabic is interactive again; a small control re-hides.
 * Ayahs outside the selected range render normally (no blur wrapper).
 */
export function HideableArabic({
  verseKey,
  children,
  className,
  compact = false,
}: HideableArabicProps) {
  const {
    hideArabic,
    isVerseRevealed,
    isVerseInHideScope,
    toggleVerseReveal,
  } = useReaderSettings()
  const inScope = isVerseInHideScope(verseKey)
  const revealed = isVerseRevealed(verseKey)
  const active = hideArabic && inScope
  const masked = active && !revealed

  if (!active) {
    // Keep mushaf flow inline when hide is on but this ayah is outside the range
    if (compact && hideArabic) {
      return <span className={className}>{children}</span>
    }
    return <div className={className}>{children}</div>
  }

  if (compact) {
    if (masked) {
      return (
        <button
          type="button"
          onClick={() => toggleVerseReveal(verseKey)}
          aria-pressed={false}
          aria-label={`Reveal Arabic for ${verseKey}`}
          title="Tap to reveal"
          className={cn(
            "inline rounded-sm text-start align-baseline",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <span
            className="pointer-events-none select-none blur-[5px] opacity-65 saturate-50"
            aria-hidden
          >
            {children}
          </span>
        </button>
      )
    }

    return (
      <span className={cn("relative inline", className)}>
        {children}
        <button
          type="button"
          onClick={() => toggleVerseReveal(verseKey)}
          title="Hide Arabic again"
          aria-label={`Hide Arabic for ${verseKey}`}
          className={cn(
            "ms-1 inline-flex size-5 translate-y-[-0.15em] items-center justify-center rounded-sm align-middle",
            "text-muted-foreground/45 transition-colors duration-[120ms]",
            "hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Eye className="size-3" strokeWidth={1.75} />
        </button>
      </span>
    )
  }

  if (masked) {
    return (
      <div className={cn("relative", className)}>
        <button
          type="button"
          onClick={() => toggleVerseReveal(verseKey)}
          aria-pressed={false}
          aria-label={`Reveal Arabic for ${verseKey}`}
          className={cn(
            "w-full cursor-pointer rounded-md text-start",
            "transition-colors duration-[120ms]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <div
            className="pointer-events-none select-none blur-[6px] opacity-70 saturate-50"
            aria-hidden
          >
            {children}
          </div>
          <span className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <EyeOff className="size-3" strokeWidth={1.75} />
            Tap to reveal
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {children}
      <button
        type="button"
        onClick={() => toggleVerseReveal(verseKey)}
        title="Hide Arabic again"
        aria-label={`Hide Arabic for ${verseKey}`}
        className={cn(
          "absolute end-0 top-0 flex size-7 items-center justify-center rounded-md",
          "text-muted-foreground/50 transition-colors duration-[120ms]",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <Eye className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}
