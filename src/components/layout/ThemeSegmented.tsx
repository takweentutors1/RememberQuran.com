"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const

/**
 * Three-state theme control for the footer.
 *
 * The navbar keeps the compact cycling {@link ThemeToggle}; this is the
 * explicit version, placed where people look for it. Theme is the
 * most-changed setting on a reading app — it should not require opening
 * a settings page.
 *
 * Renders a fixed-size placeholder before mount so the footer never shifts
 * when `next-themes` resolves.
 */
export function ThemeSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const active = mounted ? (theme ?? "system") : null

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "flex gap-0.5 rounded-lg border border-border bg-muted p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = active === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-7 place-items-center rounded-md",
              "transition-[background-color,color,box-shadow] duration-(--dur-base) ease-(--ease-out)",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
