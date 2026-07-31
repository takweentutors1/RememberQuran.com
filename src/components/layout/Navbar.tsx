"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { BookOpenText, Headphones, ImagePlus, Search } from "lucide-react"
import { AuthNav } from "@/components/auth/AuthNav"
import { LogoWordmark } from "@/components/layout/Logo"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { useUI } from "@/context/UIContext"
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
              "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors duration-150",
              active
                ? "bg-accent text-primary"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
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
      <ThemeToggle />
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
  const { sidebarOpen } = useUI()
  const [scrolled, setScrolled] = useState(false)
  const isSurahRoute = /^\/\d+/.test(pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md",
        "border-b transition-[border-color,box-shadow] duration-200 ease-out",
        scrolled
          ? "border-border shadow-[0_1px_0_0_color-mix(in_oklch,var(--brand-gold)_32%,transparent)]"
          : "border-border/40",
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
    </header>
  )
}
