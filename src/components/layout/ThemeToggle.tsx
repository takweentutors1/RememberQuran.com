"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

function nextTheme(current: string | undefined): "light" | "dark" | "system" {
  if (current === "dark") return "system"
  if (current === "system") return "light"
  return "dark"
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [pendingMode, setPendingMode] = useState<
    "light" | "dark" | "system" | null
  >(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setPendingMode(null)
  }, [theme])

  if (!mounted) {
    return <div className="size-9" aria-hidden />
  }

  const mode = pendingMode ?? theme ?? "system"
  const isSystem = mode === "system"
  const isDark = isSystem ? resolvedTheme === "dark" : mode === "dark"

  const label =
    mode === "light"
      ? "Theme: light. Switch to dark"
      : mode === "dark"
        ? "Theme: dark. Switch to system"
        : "Theme: system. Switch to light"

  function handleClick() {
    const next = nextTheme(mode)
    setPendingMode(next)
    setTheme(next)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={
        mode === "light"
          ? "Light"
          : mode === "dark"
            ? "Dark"
            : "System"
      }
      onClick={handleClick}
      className="relative size-9 text-muted-foreground hover:text-foreground"
    >
      {isSystem ? (
        <Monitor className="size-4" strokeWidth={1.75} />
      ) : (
        <>
          <Sun
            className="absolute size-4"
            style={{
              opacity: isDark ? 0 : 1,
              transform: isDark
                ? "rotate(90deg) scale(0.8)"
                : "rotate(0deg) scale(1)",
            }}
          />
          <Moon
            className="absolute size-4"
            style={{
              opacity: isDark ? 1 : 0,
              transform: isDark
                ? "rotate(0deg) scale(1)"
                : "rotate(-90deg) scale(0.8)",
            }}
          />
        </>
      )}
    </Button>
  )
}
