import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  AudioLines,
  BookOpenText,
  Heart,
  Languages,
  ShieldCheck,
  Waypoints,
} from "lucide-react"
import { LogoWordmark } from "@/components/layout/Logo"
import { FooterAccountLinks } from "@/components/layout/FooterAccountLinks"
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

/** Text, audio, and data provenance. For a Quran app this is the product. */
const CREDITS: { title: string; detail: string; Icon: LucideIcon }[] = [
  {
    title: "KFGQPC Uthmanic Hafs",
    detail: "Madani mushaf script, via Quran Foundation",
    Icon: BookOpenText,
  },
  {
    title: "The Clear Quran",
    detail: "Translation by Dr. Mustafa Khattab",
    Icon: Languages,
  },
  {
    title: "Quran.com API",
    detail: "Verses, metadata, and audio timings",
    Icon: Waypoints,
  },
  {
    title: "Recitations",
    detail: "Alafasy, Sudais, and other reciters",
    Icon: AudioLines,
  },
  {
    title: "Quranic Arabic Corpus",
    detail: "Word-by-word grammar and roots",
    Icon: Waypoints,
  },
  {
    title: "Checked against print",
    detail: "Text verified against the Madani mushaf",
    Icon: ShieldCheck,
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
    <footer className="mt-16 border-t border-border bg-background">
      {/* ── Closing dua ──
          The page ends the way a study session should, not with a call to
          action. */}
      <section className="relative isolate overflow-hidden px-4 py-12 text-center sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(50%_100%_at_50%_0%,var(--brand-gold-soft)_0%,transparent_72%)]"
        />

        <div aria-hidden className="mb-5 flex items-center justify-center gap-3">
          <span className="block h-px w-12 bg-gradient-to-r from-transparent to-strong" />
          <span className="size-2 rotate-45 rounded-[2px] border border-gold" />
          <span className="block h-px w-12 bg-gradient-to-l from-transparent to-strong" />
        </div>

        <p
          className="font-uthmani text-3xl leading-[1.9] text-reader-ink sm:text-4xl"
          dir="rtl"
          lang="ar"
        >
          رَبِّ زِدْنِى عِلْمًا
        </p>
        <p className="mt-3 font-serif text-base font-light text-muted-foreground">
          &ldquo;My Lord, increase me in knowledge.&rdquo;
        </p>
        <p className="mt-1.5 text-xs tracking-wide text-subtle">Ta-Ha 20:114</p>
      </section>

      {/* ── Columns ── */}
      <div className="site-shell border-t border-border px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <Link
              href="/"
              aria-label="RememberQuran — home"
              className="inline-flex rounded-sm transition-opacity duration-(--dur-base) hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <LogoWordmark size="md" />
            </Link>

            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-subtle">
              A quiet place to read, listen to, and memorise the Quran. Built
              with care, kept free, no advertising.
            </p>

            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1.5 text-[11px] font-medium text-gold-strong">
              <Heart className="size-3.5" strokeWidth={1.8} aria-hidden />
              Free forever · no ads · no tracking
            </p>
          </div>

          <FooterLinkColumn {...COLUMNS[0]} />
          <FooterLinkColumn {...COLUMNS[1]} />

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
        </div>
      </div>

      {/* ── Attribution ──
          A first-class band, never fine print. Provenance is what makes the
          text trustworthy, and trust is the whole product. */}
      <div className="border-t border-border bg-muted/40">
        <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
          <h3 className="mb-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
            Text, audio, and data
            <span aria-hidden className="h-px flex-1 bg-border" />
          </h3>

          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CREDITS.map(({ title, detail, Icon }) => (
              <li
                key={title}
                className="group flex items-start gap-3 rounded-xl border border-border bg-background px-3.5 py-3 transition-[border-color,box-shadow] duration-(--dur-base) ease-(--ease-out) hover:border-strong hover:shadow-sm"
              >
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-subtle transition-[background-color,color,transform] duration-(--dur-base) ease-(--ease-out) group-hover:-rotate-6 group-hover:bg-gold-soft group-hover:text-gold"
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-foreground">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-subtle">
                    {detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] text-subtle">
            Found a mistake in the text?{" "}
            <a
              href="mailto:corrections@rememberquran.com?subject=Quran%20text%20correction"
              className="rounded-sm font-medium text-gold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Report it
            </a>{" "}
            — corrections are treated as urgent.
          </p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border">
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
