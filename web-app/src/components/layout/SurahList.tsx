"use client"

import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useSurahContentOptional } from "@/context/SurahContentContext"

interface SurahListProps {
  chapters: Chapter[]
  onNavigate?: () => void
  showSearch?: boolean
}

const AYAH_KEY_RE = /^(\d{1,3}):(\d{1,3})$/

export function SurahList({
  chapters,
  onNavigate,
  showSearch = true,
}: SurahListProps) {
  const pathname = usePathname()
  const router = useRouter()
  const surahContent = useSurahContentOptional()
  const [query, setQuery] = useState("")
  const navRef = useRef<HTMLElement>(null)

  const pathSurahId = (() => {
    const match = pathname.match(/^\/(\d+)/)
    return match ? Number(match[1]) : null
  })()

  const activeSurahId = surahContent?.pendingSurahId ?? pathSurahId

  const ayahMatch = AYAH_KEY_RE.exec(query.trim())

  const filtered = useMemo(() => {
    if (ayahMatch) return []
    const q = query.trim().toLowerCase()
    if (!q) return chapters
    return chapters.filter(
      (c) =>
        String(c.id) === q ||
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(query.trim()) ||
        c.translated_name.name.toLowerCase().includes(q),
    )
  }, [chapters, query, ayahMatch])

  function jumpToAyah(surahId: number, ayahId: number) {
    const href = `/${surahId}/${ayahId}`
    if (surahContent) {
      surahContent.loadSurah(surahId)
    }
    router.push(href, { scroll: false })
    onNavigate?.()
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    const match = AYAH_KEY_RE.exec(query.trim())
    if (!match) return
    e.preventDefault()
    jumpToAyah(Number(match[1]), Number(match[2]))
  }

  function handleAyahSubmit(e: FormEvent) {
    e.preventDefault()
    if (!ayahMatch) return
    jumpToAyah(Number(ayahMatch[1]), Number(ayahMatch[2]))
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showSearch && (
        <div className="shrink-0 border-b border-border/60 bg-sidebar px-2 py-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Surah name, number, or 2:255"
              aria-label="Filter surahs or jump to ayah"
              className="h-8 border-border/60 bg-background pl-8 text-xs"
            />
          </div>
        </div>
      )}

      <nav
        ref={navRef}
        aria-label="Surahs"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {ayahMatch ? (
          <form onSubmit={handleAyahSubmit} className="px-2 py-3">
            <button
              type="submit"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                "bg-primary/5 text-primary transition-colors duration-[120ms]",
                "hover:bg-primary/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <span className="font-medium tabular-nums">{ayahMatch[0]}</span>
              <span className="text-xs text-muted-foreground">Jump to ayah</span>
            </button>
          </form>
        ) : (
          <ul className="space-y-0.5 px-2 py-2">
            {filtered.map((chapter) => {
              const isActive = activeSurahId === chapter.id
              return (
                <li key={chapter.id} className="relative">
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                  <Link
                    href={`/${chapter.id}`}
                    scroll={false}
                    prefetch
                    onMouseEnter={() => surahContent?.prefetchSurah(chapter.id)}
                    onClick={(event) => {
                      if (surahContent && !isActive) {
                        event.preventDefault()
                        surahContent.loadSurah(chapter.id)
                      }
                      onNavigate?.()
                    }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5",
                      "text-sm transition-colors duration-[120ms] ease-out",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "bg-primary/5 font-medium text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground active:bg-secondary",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {chapter.id}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{chapter.name_simple}</span>
                    <span
                      className="font-uthmani shrink-0 text-base leading-none text-foreground/50"
                      dir="rtl"
                      lang="ar"
                    >
                      {chapter.name_arabic}
                    </span>
                  </Link>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                No surahs match “{query}”
              </li>
            )}
          </ul>
        )}
      </nav>
    </div>
  )
}
