import Link from "next/link"
import { LogoWordmark } from "@/components/layout/Logo"
import { FooterAccountLinks } from "@/components/layout/FooterAccountLinks"

const YEAR = new Date().getFullYear()

const LINK_CLASS =
  "rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const FOOTER_COLUMNS = [
  {
    heading: "Quran",
    links: [
      { label: "Al-Fatihah", href: "/1" },
      { label: "Al-Baqarah", href: "/2" },
      { label: "Yasin", href: "/36" },
      { label: "Al-Mulk", href: "/67" },
      { label: "Al-Kahf", href: "/18" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "All Surahs", href: "/" },
      { label: "Search", href: "/search" },
      { label: "Listen", href: "/radio" },
      { label: "Create", href: "/media-maker" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
] as const

function FooterLinkColumn({
  heading,
  links,
}: {
  heading: string
  links: readonly { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {heading}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className={LINK_CLASS}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-border bg-muted/30">
      {/* Gold hairline — a thread of manuscript gilding across the top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_oklch,var(--brand-gold)_55%,transparent),transparent)]"
      />
      <div className="site-shell px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="RememberQuran — home"
              className="inline-flex items-center gap-2 rounded-sm text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <LogoWordmark size="md" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Read, listen, and understand the Quran. Free for everyone,
              forever.
            </p>
            <p
              className="mt-4 font-uthmani text-xl leading-loose text-[var(--brand-gold)]"
              dir="rtl"
              lang="ar"
            >
              ٱقْرَأْ بِٱسْمِ رَبِّكَ
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Read in the name of your Lord — 96:1
            </p>
          </div>

          <FooterLinkColumn {...FOOTER_COLUMNS[0]} />
          <FooterLinkColumn {...FOOTER_COLUMNS[1]} />

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </h3>
            <FooterAccountLinks />
          </div>

          <FooterLinkColumn {...FOOTER_COLUMNS[2]} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {YEAR} Remember Quran · Public-benefit, ad-free
            {" · "}
            <Link
              href="/privacy"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Privacy
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Terms
            </Link>
          </p>
          <p className="max-w-md text-xs text-muted-foreground/55">
            Quran text: King Fahd Complex (Hafs). Translations © respective
            translators.
          </p>
        </div>
      </div>
    </footer>
  )
}
