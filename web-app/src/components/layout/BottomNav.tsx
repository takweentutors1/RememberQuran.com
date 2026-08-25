"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Bookmark, BookOpenText, Radio, UserRound } from "lucide-react"
import { useSoftGate } from "@/context/SoftGateContext"
import { useUI } from "@/context/UIContext"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"
import type { SoftGateReason } from "@/lib/auth/safe-next"
import { cn } from "@/lib/utils"

const TABS: {
  href: string
  label: string
  icon: LucideIcon
  match: (p: string) => boolean
  authReason?: SoftGateReason
}[] = [
  {
    href: "/",
    label: "Read",
    icon: BookOpenText,
    match: (p) => p === "/" || /^\/\d+/.test(p),
  },
  {
    href: "/radio",
    label: "Radio",
    icon: Radio,
    match: (p) => p === "/radio",
  },
  {
    href: "/account/bookmarks",
    label: "Saved",
    icon: Bookmark,
    match: (p) => p === "/account/bookmarks",
    authReason: "bookmark",
  },
  {
    href: "/account",
    label: "You",
    icon: UserRound,
    match: (p) => p.startsWith("/account"),
  },
]

const HIDE_AFTER_PX = 80

/**
 * Floating, pill-shaped tab bar for small screens — the thumb-first
 * navigation called for in docs/DESIGN-ROLLOUT.md §3 (Read · Radio · Saved ·
 * You). Slides off-screen on scroll-down and back on scroll-up, mirroring
 * the rAF-throttled pattern already used by `BackToTop`.
 *
 * `MiniPlayer` floats as its own rounded card at `bottom-24` on small
 * screens (see its own className) specifically so it clears this bar
 * instead of overlapping it.
 */
export function BottomNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const { requireAuth } = useSoftGate()
  const { focusMode } = useUI()
  const prefersReducedMotion = useSafeReducedMotion()
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const frame = useRef(0)
  const isSurahRoute = /^\/\d+/.test(pathname)
  const forceHidden = hidden || (focusMode && isSurahRoute)

  useEffect(() => {
    // On the reader, `QuranReader` drives `focusMode` (and therefore
    // `forceHidden`) itself. Running this bar's own independent scroll
    // listener at the same time would just be two listeners racing to set
    // conflicting hidden states from the same scroll events.
    if (isSurahRoute) {
      queueMicrotask(() => setHidden(false))
      return
    }

    lastY.current = window.scrollY
    // Some routes (e.g. the reader restoring the last-read ayah) scroll the
    // page programmatically right after mount. Without a settle window that
    // single large jump reads as "user scrolled down fast" and hides the bar
    // before anyone has touched the page.
    const settleUntil = Date.now() + 600

    const measure = () => {
      frame.current = 0
      const y = window.scrollY
      const delta = y - lastY.current
      lastY.current = y

      if (Date.now() < settleUntil) return

      if (y < HIDE_AFTER_PX) {
        setHidden(false)
      } else if (delta > 4) {
        setHidden(true)
      } else if (delta < -4) {
        setHidden(false)
      }
    }

    const onScroll = () => {
      if (frame.current) return
      frame.current = window.requestAnimationFrame(measure)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current)
      window.removeEventListener("scroll", onScroll)
    }
  }, [isSurahRoute])

  return (
    <motion.nav
      aria-label="Primary"
      animate={
        prefersReducedMotion
          ? { opacity: forceHidden ? 0 : 1 }
          : { y: forceHidden ? 96 : 0, opacity: forceHidden ? 0 : 1 }
      }
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn(
        "glass-panel fixed inset-x-0 bottom-4 z-40 mx-auto flex h-[60px] w-fit items-center gap-1 rounded-full !border-gold-leaf/15 px-2 shadow-lg md:hidden",
        forceHidden && "pointer-events-none",
      )}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, icon: Icon, match, authReason }) => {
        const active = match(pathname)
        const gated = authReason && status === "unauthenticated"
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            tabIndex={forceHidden ? -1 : 0}
            onClick={(e) => {
              if (gated) {
                e.preventDefault()
                requireAuth(authReason, href)
              }
            }}
            className={cn(
              "flex h-full w-14 flex-col items-center justify-center gap-0.5",
              "transition-colors duration-(--dur-base) ease-(--ease-out)",
              active
                ? "text-primary border-t-2 border-primary pt-[calc(0.5rem-2px)]"
                : "text-muted-foreground hover:text-foreground pt-2",
            )}
          >
            <Icon className="size-6" strokeWidth={1.5} />
            <span className="text-[10px] font-medium leading-none">
              {label}
            </span>
          </Link>
        )
      })}
    </motion.nav>
  )
}
