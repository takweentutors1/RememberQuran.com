"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowRight } from "lucide-react"

/**
 * Client account links so the root layout Footer does not call `auth()`.
 * Server `auth()` in Footer forced every page to `private, no-store` (no CDN cache).
 */
export function FooterAccountLinks() {
  const { data: session, status } = useSession()
  const signedIn = status === "authenticated" && Boolean(session?.user?.id)

  const links = signedIn
    ? [
        { label: "Overview", href: "/account" },
        { label: "Bookmarks", href: "/account/bookmarks" },
        { label: "Settings", href: "/account/settings" },
      ]
    : [
        { label: "Sign in", href: "/login" },
        { label: "Register", href: "/register" },
        { label: "Bookmarks", href: "/account/bookmarks" },
      ]

  return (
    <ul className="flex flex-col gap-0.5">
      {links.map(({ label, href }) => (
        <li key={href}>
          <Link
            href={href}
            className="link-reveal inline-flex items-center gap-1.5 rounded-sm py-1 text-sm text-muted-foreground transition-colors duration-(--dur-base) ease-(--ease-out) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
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
  )
}
