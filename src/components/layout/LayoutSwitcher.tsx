"use client"

import { useRouter, usePathname } from "next/navigation"
import { LayoutPanelLeft, BookOpen, Baby, Wind, Check } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useReaderSettings, type LayoutMode } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

const OPTIONS: {
  value: LayoutMode
  label: string
  description: string
  icon: typeof LayoutPanelLeft
}[] = [
  {
    value: "classic",
    label: "Classic",
    description: "Sidebar navigation with the full toolbar",
    icon: LayoutPanelLeft,
  },
  {
    value: "single-page",
    label: "Single page",
    description: "Immersive mushaf-style page, chrome tucked away",
    icon: BookOpen,
  },
  {
    value: "child",
    label: "Child",
    description: "Bigger text, simpler controls for young readers",
    icon: Baby,
  },
  {
    value: "flow",
    label: "Flow",
    description: "Distraction-free, audio-first reading",
    icon: Wind,
  },
]

export function LayoutSwitcher() {
  const { layoutMode, setLayoutMode } = useReaderSettings()
  const router = useRouter()
  const pathname = usePathname()
  const isSurahRoute = /^\/\d+/.test(pathname)
  const ActiveIcon =
    OPTIONS.find((o) => o.value === layoutMode)?.icon ?? LayoutPanelLeft

  function selectLayout(value: LayoutMode) {
    setLayoutMode(value)
    // These are reader-chrome layouts — nothing on this page would visibly
    // change if we're not already in the reader, so hop to Al-Fatihah
    // (same default the homepage's own "Start reading" CTA uses) to show it.
    if (!isSurahRoute) router.push("/1")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({
          variant: "ghost",
          size: "icon",
          className: "h-9 w-9 cursor-pointer",
        })}
      >
        <ActiveIcon className="h-[1.2rem] w-[1.2rem] text-muted-foreground transition-colors hover:text-foreground" />
        <span className="sr-only">Change layout</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {OPTIONS.map(({ value, label, description, icon: Icon }) => {
          const active = layoutMode === value
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => selectLayout(value)}
              className="items-start gap-2.5 py-2"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  {description}
                </span>
              </span>
              {active && (
                <Check className={cn("mt-0.5 size-4 shrink-0 text-primary")} strokeWidth={2} />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
