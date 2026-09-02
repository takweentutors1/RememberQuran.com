import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getChapters } from "@/lib/quranApi"
import { listMemorisedAyahs } from "@/lib/firestore/hifz"
import { HifzReviewSession } from "@/components/account/HifzReviewSession"
import type { HifzAyahDto } from "@/components/account/HifzView"

export const metadata: Metadata = {
  title: "Hifz Review",
}

export const dynamic = "force-dynamic"

export default async function HifzReviewPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/hifz/review")
  }
  const userId = session.user.id

  const [rows, chapters] = await Promise.all([
    listMemorisedAyahs(userId),
    getChapters(),
  ])

  const chapterById = new Map(chapters.map((c) => [c.id, c]))

  const now = new Date().getTime()

  // Find ayahs that are due or haven't been reviewed yet
  const dueRows = rows.filter((r) => {
    if (!r.nextReviewAt) return true
    return r.nextReviewAt.getTime() <= now
  })

  // Fallback to all memorised rows if none are strictly due, so user can practice anytime
  const activeRows = dueRows.length > 0 ? dueRows : rows

  const ayahs: HifzAyahDto[] = activeRows.map((r) => {
    const chapter = chapterById.get(r.surahId)
    return {
      verseKey: r.verseKey,
      surahId: r.surahId,
      ayahId: r.ayahId,
      surahName: chapter?.name_simple ?? `Surah ${r.surahId}`,
      surahArabic: chapter?.name_arabic ?? "",
      memorisedAt: r.memorisedAt.toISOString(),
      repetitions: r.repetitions ?? 0,
      intervalDays: r.intervalDays ?? 1,
      easeFactor: r.easeFactor ?? 2.5,
      nextReviewAt: r.nextReviewAt ? r.nextReviewAt.toISOString() : null,
      lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
    }
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Spaced Repetition
        </p>
        <h1 className="mt-1.5 font-serif text-3xl font-medium tracking-tight">
          Hifz Review
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Self-paced recall test using the SM-2 algorithm to reinforce long-term Quran retention.
        </p>
      </div>

      <HifzReviewSession initialDueAyahs={ayahs} />
    </div>
  )
}
