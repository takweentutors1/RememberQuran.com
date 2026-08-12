"use client"

import { useEffect } from "react"
import Link from "next/link"
import { BookOpen, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-arabic text-6xl leading-none text-foreground/15" dir="rtl" lang="ar">
        خطأ
      </p>
      <div>
        <h1 className="text-lg font-medium text-foreground">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Please try again, or head back to the surah list.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 text-sm text-primary transition-colors duration-[120ms] hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <RotateCcw className="size-4" strokeWidth={1.75} />
          Try again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-primary transition-colors duration-[120ms] hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <BookOpen className="size-4" strokeWidth={1.75} />
          Browse all surahs
        </Link>
      </div>
    </div>
  )
}
