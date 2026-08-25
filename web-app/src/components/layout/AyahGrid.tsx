"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AyahGridProps {
  surahId: number
  versesCount: number
  onNavigate?: () => void
  className?: string
}

export function AyahGrid({ surahId, versesCount, onNavigate, className }: AyahGridProps) {
  const router = useRouter()
  const params = useParams<{ ayahId?: string }>()
  const [query, setQuery] = useState("")

  const parsed = Number(params.ayahId)
  const currentAyah =
    !isNaN(parsed) && parsed >= 1 && parsed <= versesCount ? parsed : null

  function goTo(ayah: number) {
    setQuery("")
    router.push(`/${surahId}/${ayah}`, { scroll: false })
    onNavigate?.()
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(query.trim())
    if (isNaN(n) || n < 1 || n > versesCount) return
    goTo(n)
  }

  const ayahs = Array.from({ length: versesCount }, (_, i) => i + 1)

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <form onSubmit={onSubmit} className="shrink-0 border-b border-border/60 px-2 py-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputMode="numeric"
          placeholder={`Ayah 1–${versesCount}`}
          aria-label={`Go to ayah, 1 to ${versesCount}`}
          className="h-8 border-border/60 bg-background text-xs"
        />
      </form>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
        role="listbox"
        aria-label="Ayahs"
      >
        <div className="grid grid-cols-5 gap-1">
          {ayahs.map((n) => {
            const active = n === currentAyah
            return (
              <button
                key={n}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => goTo(n)}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md text-xs tabular-nums",
                  "transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground",
                )}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
