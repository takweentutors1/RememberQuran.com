import Link from "next/link"
import { Bookmark, ImagePlus, Radio, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tile {
  href: string
  label: string
  hint: string
  icon: typeof Bookmark
  tone: "primary" | "gold"
}

const TILES: Tile[] = [
  {
    href: "/account/bookmarks",
    label: "Bookmarks",
    hint: "Saved ayahs",
    icon: Bookmark,
    tone: "primary",
  },
  {
    href: "/radio",
    label: "Radio",
    hint: "Live recitation",
    icon: Radio,
    tone: "gold",
  },
  {
    href: "/media-maker",
    label: "Media Maker",
    hint: "Design ayah cards",
    icon: ImagePlus,
    tone: "primary",
  },
  {
    href: "/account/goals",
    label: "Goals",
    hint: "Track your reading",
    icon: Target,
    tone: "gold",
  },
]

/** Four shortcut tiles surfacing the app's key features from the home page. */
export function QuickAccess() {
  return (
    <section aria-label="Quick access" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {TILES.map(({ href, label, hint, icon: Icon, tone }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group lift flex flex-col items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-4",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              "transition-[background-color,color,transform] duration-(--dur-base) ease-(--ease-out)",
              "group-hover:-rotate-6",
              tone === "gold"
                ? "bg-gold-soft text-gold"
                : "bg-accent text-foreground",
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
