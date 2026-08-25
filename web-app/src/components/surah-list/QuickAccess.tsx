"use client"

import Link from "next/link"
import { Bookmark, ImagePlus, Radio, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useSoftGate } from "@/context/SoftGateContext"
import type { SoftGateReason } from "@/lib/auth/safe-next"

interface Tile {
  href: string
  label: string
  hint: string
  icon: typeof Bookmark
  authReason?: SoftGateReason
}

const TILES: Tile[] = [
  {
    href: "/account/bookmarks",
    label: "Bookmarks",
    hint: "Saved ayahs",
    icon: Bookmark,
    authReason: "bookmark",
  },
  {
    href: "/radio",
    label: "Radio",
    hint: "Live recitation",
    icon: Radio,
  },
  {
    href: "/media-maker",
    label: "Media Maker",
    hint: "Design ayah cards",
    icon: ImagePlus,
  },
  {
    href: "/account/goals",
    label: "Goals",
    hint: "Track your reading",
    icon: Target,
    authReason: "goal",
  },
]

/** Four shortcut tiles surfacing the app's key features from the home page. */
export function QuickAccess({ className }: { className?: string }) {
  const { status } = useSession()
  const { requireAuth } = useSoftGate()

  return (
    <section
      aria-label="Quick access"
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 lg:grid-rows-2",
        className,
      )}
    >
      {TILES.map(({ href, label, hint, icon: Icon, authReason }) => (
        <Link
          key={href}
          href={href}
          onClick={(e: React.MouseEvent) => {
            if (authReason && status === "unauthenticated") {
              e.preventDefault()
              requireAuth(authReason, href)
            }
          }}
          className={cn(
            "group mihrab-shadow flex h-full flex-col items-start justify-between gap-2.5 rounded-[14px] bg-card border border-border px-4 py-4",
            "transition-[transform,background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-out)",
            "hover:-translate-y-px hover:shadow-sm active:translate-y-0 active:scale-[.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-primary",
              "transition-transform duration-(--dur-base) ease-(--ease-out)",
              "group-hover:-rotate-6",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block text-sm font-medium text-foreground">
              {label}
            </span>
            <span className="mt-0.5 block text-xs text-subtle">{hint}</span>
          </span>
        </Link>
      ))}
    </section>
  )
}
