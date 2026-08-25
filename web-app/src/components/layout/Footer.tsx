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
}: {
  heading: string
  links: readonly FooterLink[]
}) {
  return (
    <div>
      <FooterHeading>{heading}</FooterHeading>
      <ul className="flex flex-col gap-0.5">
        {links.map(({ label, href, badge }) => (
            <li key={href}>
              <Link href={href} className={FOOTER_LINK_CLASS}>
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
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-gold-leaf/20 bg-gold-soft text-foreground/80">
      <div aria-hidden className="gold-shimmer-line absolute inset-x-0 top-0 h-px" />

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
                href="/"
                aria-label="RememberQuran — home"
                className="inline-flex rounded-sm transition-opacity duration-(--dur-base) hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <LogoWordmark size="md" />
              </Link>

              <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-subtle">
                A quiet place to read, listen to, and memorise the Quran. Built with care, kept free, no advertising.
              </p>

              <p className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium bg-gold-soft text-gold-strong">
                <Heart className="size-3.5" strokeWidth={1.8} aria-hidden />
                Free forever · no ads · no tracking
              </p>
            </div>

            <FooterLinkColumn heading={COLUMNS[0].heading} links={COLUMNS[0].links} />
            <FooterLinkColumn heading={COLUMNS[1].heading} links={COLUMNS[1].links} />

            <div>
              <FooterHeading>Your account</FooterHeading>
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
      <div className="border-t border-gold-leaf/20">
        <div className="site-shell flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="text-xs text-subtle">
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
