"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Footer "back to top" control.
 *
 * Only renders once the user is past 60% scroll depth — before that the
 * footer is barely on screen and the button is noise. The scroll listener is
 * passive and rAF-throttled so it never contends with the reader's word-sync
 * work on the main thread.
 */
export function BackToTop({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) {
        setVisible(false)
        return
      }
      setVisible(window.scrollY / scrollable > 0.6)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }, [])

  return (
    <button
      type="button"
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5",
        "text-xs text-muted-foreground",
        "transition-[opacity,transform,color,background-color,border-color]",
        "duration-(--dur-base) ease-(--ease-out)",
        "hover:border-strong hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none translate-y-1 opacity-0",
        className,
      )}
    >
      <ArrowUp
        className="size-3.5 transition-transform duration-(--dur-slow) ease-(--ease-overshoot) group-hover:-translate-y-0.5"
        strokeWidth={2}
        aria-hidden
      />
      Back to top
    </button>
  )
}
