"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { BookOpenText, Headphones, ImagePlus, Search } from "lucide-react"
import { AuthNav } from "@/components/auth/AuthNav"
import { LogoWordmark } from "@/components/layout/Logo"
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher"
import { useUI } from "@/context/UIContext"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const NAV: {
  href: string
  label: string
  icon: LucideIcon
  match: (p: string) => boolean
  hideLabel?: boolean
}[] = [
  {
    href: "/",
    label: "Quran",
    icon: BookOpenText,
    match: (p: string) => p === "/" || /^\/\d+/.test(p),
  },
  {
    href: "/radio",
    label: "Listen",
    icon: Headphones,
    match: (p: string) => p === "/radio",
  },
  {
    href: "/media-maker",
    label: "Create",
    icon: ImagePlus,
    match: (p: string) => p === "/media-maker",
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    match: (p: string) => p === "/search",
    hideLabel: true,
  },
]

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex items-center gap-0.5">
      {NAV.map(({ href, label, icon: Icon, match, hideLabel }) => {
        const active = match(pathname)
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "underline-grow flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs",
              "transition-colors duration-(--dur-base) ease-(--ease-out)",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
              FOCUS,
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
            {hideLabel ? (
              <span className="sr-only">{label}</span>
            ) : (
              <span className="hidden sm:inline">{label}</span>
            )}
          </Link>
        )
      })}
      <ThemeSwitcher />
      <AuthNav />
    </nav>
  )
}

function LogoLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="RememberQuran — home"
      className={cn(
        "rounded-sm transition-opacity duration-150 hover:opacity-80",
        FOCUS,
        className,
      )}
    >
      <LogoWordmark size="md" />
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { sidebarOpen, focusMode } = useUI()
  const [scrolled, setScrolled] = useState(false)
  const prefersReducedMotion = useSafeReducedMotion()
  const isSurahRoute = /^\/\d+/.test(pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Focus mode (toggled from ReaderControls) only makes sense on the reader
  // itself — gating on isSurahRoute too means a stale `focusMode=true` left
  // over from a previous reader visit can never hide the navbar anywhere
  // else.
  if (focusMode && isSurahRoute) return null

  // The reader route's bar stays flush and full-width — its logo column
  // lines up with the reader sidebar below it (see the comment further
  // down), and insetting it into a floating pill would break that corner
  // alignment. It still gets the same scroll-based shrink + blur, since
  // `scale` is a transform and doesn't touch layout.
  const floating = !isSurahRoute

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        floating && "px-3 pt-3 sm:px-4",
      )}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { scale: scrolled ? 0.96 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{ transformOrigin: "top center" }}
        className={cn(
          "backdrop-blur-xl",
          "transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-out",
          scrolled ? "bg-background/90 backdrop-blur-2xl" : "bg-background/60",
          floating
            ? cn(
                "mx-auto max-w-6xl rounded-2xl border",
                scrolled
                  ? "border-border shadow-lg"
                  : "border-border/40 shadow-sm",
              )
            : cn(
                "border-b",
                scrolled
                  ? "border-border shadow-[0_1px_0_0_color-mix(in_srgb,var(--brand-gold)_28%,transparent)]"
                  : "border-border/40",
              ),
        )}
      >
        {isSurahRoute ? (
          /* Reader: logo sits in w-72 above the sidebar — no border-r so the
             sidebar divider starts below the navbar (clean corner, no line
             cutting through the header). */
          <div className="flex h-14 w-full items-center">
            <div
              className={cn(
                "flex h-full shrink-0 items-center px-3",
                "transition-[width] duration-200 ease-out",
                "w-auto",
                sidebarOpen && "md:w-72",
              )}
            >
              <LogoLink />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end px-3 sm:px-4">
              <NavLinks pathname={pathname} />
            </div>
          </div>
        ) : (
          <div className="site-shell flex h-14 items-center gap-2 px-3 sm:px-4">
            <LogoLink className="mr-auto" />
            <NavLinks pathname={pathname} />
          </div>
        )}
      </motion.div>
    </header>
  )
}
