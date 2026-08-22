"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"
import { LogoWordmark } from "@/components/layout/Logo"
import { ArabesquePattern } from "@/components/layout/ArabesquePattern"
import { FooterAccountLinks } from "@/components/layout/FooterAccountLinks"
import { FooterReveal } from "@/components/layout/FooterReveal"
import { ThemeSegmented } from "@/components/layout/ThemeSegmented"
import { BackToTop } from "@/components/layout/BackToTop"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

const YEAR = new Date().getFullYear()

interface FooterLink {
  label: string
  href: string
  badge?: string
}

const COLUMNS: { heading: string; links: readonly FooterLink[] }[] = [
  {
    heading: "Read",
    links: [
      { label: "All 114 surahs", href: "/" },
      { label: "Search the Quran", href: "/search" },
      { label: "Quran radio", href: "/radio" },
      { label: "Media maker", href: "/media-maker", badge: "New" },
      { label: "Al-Kahf", href: "/18" },
      { label: "Al-Mulk", href: "/67" },
    ],
  },
  {
    heading: "Study",
    links: [
      { label: "Al-Fatihah", href: "/1" },
      { label: "Al-Baqarah", href: "/2" },
      { label: "Ayat al-Kursi", href: "/2/255" },
      { label: "Yasin", href: "/36" },
      { label: "Ar-Rahman", href: "/55" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

const FOOTER_LINK_CLASS = cn(
  "link-reveal inline-flex items-center gap-1.5 rounded-sm py-1 text-sm text-muted-foreground",
  "transition-colors duration-(--dur-base) ease-(--ease-out) hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
)

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
      {children}
    </h3>
  )
}

function FooterLinkColumn({
  heading,
  links,
  isSinglePageMode,
  isChildMode,
}: {
  heading: string
  links: readonly FooterLink[]
  isSinglePageMode?: boolean
  isChildMode?: boolean
}) {
  return (
    <div>
      <FooterHeading>{heading}</FooterHeading>
      <ul className="flex flex-col gap-0.5">
        {links.map(({ label, href, badge }) => {
          let finalHref = href;
          if (isSinglePageMode && href !== "/" && !href.match(/^\/\d+/)) finalHref = `/single-page${href}`;
          if (isChildMode && href !== "/" && !href.match(/^\/\d+/)) finalHref = `/child${href}`;
          
          return (
            <li key={href}>
              <Link href={finalHref} className={FOOTER_LINK_CLASS}>
                {label}
                {badge ? (
                  <span className="rounded-full bg-gold-soft px-1.5 py-px text-[10px] font-medium text-gold-strong">
                    {badge}
                  </span>
                ) : null}
                <ArrowRight
                  data-arrow
                  aria-hidden
                  className="size-3 shrink-0"
                  strokeWidth={2.2}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Footer() {
  const { layoutMode } = useReaderSettings()
  const isSinglePageMode = layoutMode === "single-page"
  const isChildMode = layoutMode === "child"
  const isFlowMode = layoutMode === "flow"

  if (isFlowMode) return null

  return (
    <footer className={cn(
      "relative mt-16 border-t",
      isSinglePageMode ? "bg-[#fcf9f2] dark:bg-[#121110] border-[#e6dec8] dark:border-[#2a2825] font-serif" :
      isChildMode ? "bg-[#f0f9ff] dark:bg-[#0f172a] border-t-4 border-[#bae6fd] dark:border-[#334155]" : 
      "border-border bg-background"
    )}>
      {!isSinglePageMode && !isChildMode && <div aria-hidden className="gold-shimmer-line absolute inset-x-0 top-0 h-px" />}

      {/* ── Columns ── */}
      <div className="relative overflow-hidden">
        <ArabesquePattern
          id="footer"
          className="text-gold-leaf/[0.05] [animation-duration:150s]"
        />
        <div className="site-shell px-4 py-10 sm:px-6 lg:px-8">
          <FooterReveal className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2">
              <Link
                href={isSinglePageMode ? "/single-page" : isChildMode ? "/child" : "/"}
                aria-label="RememberQuran — home"
                className="inline-flex rounded-sm transition-opacity duration-(--dur-base) hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <LogoWordmark size="md" />
              </Link>

              <p className={cn(
                "mt-4 max-w-[34ch] text-sm leading-relaxed",
                isChildMode ? "text-[#0ea5e9] dark:text-[#38bdf8] font-bold" : "text-subtle"
              )}>
                {isChildMode 
                  ? "A fun, safe place to explore the words of Allah. Built for kids, with love!" 
                  : "A quiet place to read, listen to, and memorise the Quran. Built with care, kept free, no advertising."}
              </p>

              <p className={cn(
                "mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium",
                isChildMode 
                  ? "bg-[#fef08a] text-[#b45309] dark:bg-[#b45309] dark:text-[#fef08a] border-2 border-[#fcd34d]"
                  : "bg-gold-soft text-gold-strong"
              )}>
                <Heart className="size-3.5" strokeWidth={1.8} aria-hidden />
                {isChildMode ? "100% Safe & Fun" : "Free forever · no ads · no tracking"}
              </p>
            </div>

            <FooterLinkColumn heading={COLUMNS[0].heading} links={COLUMNS[0].links} isSinglePageMode={isSinglePageMode} isChildMode={isChildMode} />
            <FooterLinkColumn heading={COLUMNS[1].heading} links={COLUMNS[1].links} isSinglePageMode={isSinglePageMode} isChildMode={isChildMode} />

            <div>
              <FooterHeading>{isChildMode ? "Your Profile" : "Your account"}</FooterHeading>
              <FooterAccountLinks />

              <div className="mt-6">
                <FooterHeading>{COLUMNS[2].heading}</FooterHeading>
                <ul className="flex flex-col gap-0.5">
                  {COLUMNS[2].links.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className={FOOTER_LINK_CLASS}>
                        {label}
                        <ArrowRight
                          data-arrow
                          aria-hidden
                          className="size-3 shrink-0"
                          strokeWidth={2.2}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FooterReveal>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={cn(
        "border-t",
        isSinglePageMode ? "border-[#e6dec8] dark:border-[#2a2825]" : 
        isChildMode ? "border-[#bae6fd] dark:border-[#334155]" : 
        "border-border"
      )}>
        <div className="site-shell flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className={cn("text-xs", isChildMode ? "text-[#0ea5e9] dark:text-[#38bdf8] font-bold" : "text-subtle")}>
            © {YEAR}{" "}
            <span className="text-muted-foreground">RememberQuran</span> ·
            Public-benefit, ad-free
          </p>
          <div className="flex items-center gap-2 sm:ml-auto">
            <ThemeSegmented />
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  )
}
