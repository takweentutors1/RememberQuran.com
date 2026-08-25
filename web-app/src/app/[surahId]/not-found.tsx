import Link from "next/link"

export default function SurahNotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-arabic text-5xl leading-none text-foreground/15" dir="rtl" lang="ar">
        لا توجد
      </p>
      <div>
        <h1 className="text-lg font-medium text-foreground">Surah not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The Quran has 114 surahs — valid range is 1–114.
        </p>
      </div>
      <Link
        href="/"
        className="text-sm text-primary transition-colors duration-[120ms] hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        ← Back to surah list
      </Link>
    </div>
  )
}
