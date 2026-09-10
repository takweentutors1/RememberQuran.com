"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { BookOpen, ArrowRight } from "lucide-react"
import { useChapterMeta } from "@/context/ChaptersContext"
import type { LastPositionDto } from "@/components/account/ContinuePrompt"
import { cn } from "@/lib/utils"

export function NavbarResumeButton() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [position, setPosition] = useState<LastPositionDto | null>(null)
  const [loaded, setLoaded] = useState(false)
  const chapter = useChapterMeta(position?.surahId)

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      queueMicrotask(() => {
        setPosition(null)
        setLoaded(true)
      })
      return
    }

    let cancelled = false
    fetch("/api/account/progress")
      .then(async (res) => {
        if (!res.ok) return null
        const data = (await res.json()) as {
          lastPosition?: LastPositionDto | null
        }
        return data.lastPosition ?? null
      })
      .then((pos) => {
        if (!cancelled) {
          setPosition(pos)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user, status])

  if (!loaded || !position) return null

  const targetHref = `/${position.surahId}/${position.ayahId}`
  // If the user is already on the exact ayah, hide the resume button in the navbar
  if (pathname === targetHref) return null

  const surahLabel =
    position.surahName || chapter?.name_simple || `Surah ${position.surahId}`

  return (
    <Link
      href={targetHref}
      title={`Resume reading: ${surahLabel} Ayah ${position.ayahId}`}
      className={cn(
        "group relative flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 sm:px-3 text-xs font-medium text-primary",
        "transition-all duration-200 ease-out hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-xs",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
      )}
    >
      <BookOpen className="size-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={2} />
      <span className="hidden sm:inline font-semibold">Resume:</span>
      <span className="hidden xs:inline max-w-[100px] truncate sm:max-w-[140px]">
        {surahLabel} {position.ayahId}
      </span>
      <ArrowRight className="hidden sm:inline size-3 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={2} />
    </Link>
  )
}
