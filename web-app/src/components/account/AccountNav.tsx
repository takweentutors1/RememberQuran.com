"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bookmark,
  Brain,
  LayoutGrid,
  Menu,
  NotebookPen,
  Settings2,
  Target,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const links = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/account/notes", label: "Notes", icon: NotebookPen },
  { href: "/account/hifz", label: "Hifz", icon: Brain },
  { href: "/account/progress", label: "Progress", icon: TrendingUp },
  { href: "/account/goals", label: "Goals", icon: Target },
  { href: "/account/settings", label: "Settings", icon: Settings2 },
]

export function AccountNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navLinks = (
    <nav aria-label="Account" className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/account" ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active &&
                "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const activeLabel =
    links.find(({ href }) =>
      href === "/account" ? pathname === href : pathname.startsWith(href),
    )?.label ?? "Account"

  return (
    <>
      <aside className="hidden w-52 shrink-0 md:block">
        <div className="sticky top-20 rounded-xl border border-sidebar-border bg-sidebar p-3">
          <p className="px-3 pb-3 pt-1 font-serif text-sm font-medium">
            Your account
          </p>
          {navLinks}
        </div>
      </aside>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 md:hidden">
        <span className="text-sm font-medium">{activeLabel}</span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="sm" />}
          >
            <Menu data-icon="inline-start" />
            Sections
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetHeader className="border-b border-sidebar-border px-5 py-5">
              <SheetTitle className="font-serif text-lg">Your account</SheetTitle>
              <SheetDescription>
                Saved Quran tools and account settings.
              </SheetDescription>
            </SheetHeader>
            <div className="p-3">{navLinks}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
