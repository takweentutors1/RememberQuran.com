"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { BookOpenText, Headphones, ImagePlus, Search, Star } from "lucide-react"
import { ArabesquePattern } from "@/components/layout/ArabesquePattern"
import { AuthNav } from "@/components/auth/AuthNav"
import { LogoWordmark } from "@/components/layout/Logo"
import { LayoutSwitcher } from "@/components/layout/LayoutSwitcher"
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher"
import { useUI } from "@/context/UIContext"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
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

function NavLinks({ pathname, isSinglePageMode, isChildMode, isFlowMode }: { pathname: string, isSinglePageMode: boolean, isChildMode: boolean, isFlowMode: boolean }) {
  return (
    <nav className="flex items-center gap-0.5">
      {isChildMode && (
        <div className="flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-[#fef08a] dark:bg-[#b45309] rounded-full shadow-inner border-2 border-[#fcd34d]">
          <Star className="size-4 text-[#d97706] dark:text-[#fef08a]" fill="currentColor" />
          <span className="text-sm font-black text-[#d97706] dark:text-[#fef08a]">12</span>
        </div>
      )}
      {NAV.map(({ href, label, icon: Icon, match, hideLabel }) => {
        // Rewrite links for single-page, child, and flow modes
        let finalHref = href;
        if (isSinglePageMode && href !== "/") finalHref = `/single-page${href}`;
        if (isChildMode && href !== "/") finalHref = `/child${href}`;
        if (isFlowMode && href !== "/") finalHref = `/flow${href}`;
        
        let finalMatch = match;
        if (isSinglePageMode) finalMatch = (p: string) => p.startsWith(`/single-page${href}`);
        if (isChildMode) finalMatch = (p: string) => p.startsWith(`/child${href}`);
        if (isFlowMode) finalMatch = (p: string) => p.startsWith(`/flow${href}`);
        
        const active = finalMatch(pathname)
        return (
          <Link
            key={href}
            href={finalHref}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs",
              "transition-colors duration-(--dur-base) ease-(--ease-out)",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
              !active && "underline-grow",
              FOCUS,
            )}
          >
            {active && (
              <motion.span
                layoutId="navbar-active-pill"
                className={cn("absolute inset-0 -z-10 rounded-lg", 
                  isSinglePageMode ? "bg-[#8c6b3e]/10 dark:bg-[#8c6b3e]/20" : 
                  isChildMode ? "bg-[#bae6fd] dark:bg-[#1e3a8a]" :
                  isFlowMode ? "bg-white/10" :
                  "bg-accent")}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="size-3.5" strokeWidth={1.75} />
            {hideLabel ? (
              <span className="sr-only">{label}</span>
            ) : (
              <span className="hidden sm:inline">{label}</span>
            )}
          </Link>
        )
      })}
      <LayoutSwitcher />
      {/* Hide theme switcher in aesthetic-fixed modes */}
      {!isSinglePageMode && !isChildMode && !isFlowMode && <ThemeSwitcher />}
      <AuthNav />
    </nav>
  )
}

function LogoLink({ className, isSinglePageMode, isChildMode, isFlowMode }: { className?: string, isSinglePageMode?: boolean, isChildMode?: boolean, isFlowMode?: boolean }) {
  return (
    <Link
      href={isSinglePageMode ? "/single-page" : isChildMode ? "/child" : isFlowMode ? "/flow" : "/"}
      aria-label="RememberQuran — home"
      className={cn("rounded-sm", FOCUS, className)}
    >
      <motion.span
        className="inline-flex"
        whileHover={{ scale: 1.035, rotate: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        <LogoWordmark size="md" />
      </motion.span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { sidebarOpen, focusMode } = useUI()
  const { layoutMode } = useReaderSettings()
  const [scrolled, setScrolled] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up")
  const prefersReducedMotion = useSafeReducedMotion()
  const isSurahRoute = /^\/\d+/.test(pathname)
  // single-page/child/flow force the sidebar collapsed (see SidebarContainer)
  const sidebarEffectivelyOpen = sidebarOpen && layoutMode === "classic"

  useEffect(() => {
    let lastScrollY = window.scrollY
    const onScroll = () => {
      setScrolled(window.scrollY > 4)
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setScrollDirection("down")
      } else if (window.scrollY < lastScrollY) {
        setScrollDirection("up")
      }
      lastScrollY = window.scrollY
    }
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
  const isSinglePageMode = layoutMode === "single-page"
  const isChildMode = layoutMode === "child"
  const isFlowMode = layoutMode === "flow"
  const floating = !isSurahRoute && !isSinglePageMode && !isChildMode && !isFlowMode

  // Flow mode auto-hides when scrolling down
  const hideNavbar = isFlowMode && scrollDirection === "down"

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        floating && "px-3 pt-3 sm:px-4",
        "transition-transform duration-300 ease-in-out",
        hideNavbar ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { scale: scrolled ? 0.96 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{ transformOrigin: "top center" }}
        className={cn(
          "relative overflow-hidden backdrop-blur-xl",
          "transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-out",
          scrolled ? "backdrop-blur-2xl" : "",
          isFlowMode 
            ? scrolled ? "bg-[#050505]/60 backdrop-blur-3xl shadow-sm font-sans text-white border-b border-white/5" : "bg-transparent font-sans text-white"
            : isSinglePageMode 
            ? scrolled ? "bg-[#fcf9f2]/90 dark:bg-[#121110]/90 shadow-sm border-b border-[#e6dec8] dark:border-[#2a2825] font-serif" : "bg-[#fcf9f2]/60 dark:bg-[#121110]/60 border-b border-transparent font-serif"
            : isChildMode
            ? scrolled ? "bg-[#f0f9ff]/90 dark:bg-[#0f172a]/90 shadow-sm border-b-4 border-[#bae6fd] dark:border-[#334155]" : "bg-[#f0f9ff]/60 dark:bg-[#0f172a]/60 border-b-4 border-transparent"
            : scrolled ? "bg-background/90" : "bg-background/60",
          floating
            ? cn(
                "mx-auto max-w-6xl rounded-2xl border",
                scrolled
                  ? "border-border shadow-lg"
                  : "border-border/40 shadow-sm",
              )
            : !isSinglePageMode && !isChildMode && !isFlowMode && cn(
                "border-b",
                scrolled
                  ? "border-border shadow-[0_1px_0_0_color-mix(in_srgb,var(--brand-gold)_28%,transparent)]"
                  : "border-border/40",
              ),
        )}
      >
        {floating && (
          <ArabesquePattern
            id="navbar"
            className="text-gold-leaf/[0.05] [animation-duration:120s]"
          />
        )}
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
                sidebarEffectivelyOpen && "md:w-72",
              )}
            >
              <LogoLink isSinglePageMode={isSinglePageMode} isChildMode={isChildMode} isFlowMode={isFlowMode} />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end px-3 sm:px-4">
              <NavLinks pathname={pathname} isSinglePageMode={isSinglePageMode} isChildMode={isChildMode} isFlowMode={isFlowMode} />
            </div>
          </div>
        ) : (
          <div className="site-shell flex h-14 items-center gap-2 px-3 sm:px-4">
            <LogoLink className="mr-auto" isSinglePageMode={isSinglePageMode} isChildMode={isChildMode} isFlowMode={isFlowMode} />
            <NavLinks pathname={pathname} isSinglePageMode={isSinglePageMode} isChildMode={isChildMode} isFlowMode={isFlowMode} />
          </div>
        )}
      </motion.div>
    </header>
  )
}
