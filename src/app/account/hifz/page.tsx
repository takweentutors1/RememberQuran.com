import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { HifzView, type HifzAyahDto } from "@/components/account/HifzView"
import { getChapters } from "@/lib/quranApi"
import { listMemorisedAyahs } from "@/lib/firestore/hifz"

export const metadata: Metadata = {
  title: "Hifz",
}

export const dynamic = "force-dynamic"

export default async function HifzPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/hifz")
  }
  const userId = session.user.id

  const [rows, chapters] = await Promise.all([
    listMemorisedAyahs(userId),
    getChapters(),
  ])

  const chapterById = new Map(chapters.map((c) => [c.id, c]))

  const ayahs: HifzAyahDto[] = rows.map((r) => {
    const chapter = chapterById.get(r.surahId)
    return {
      verseKey: r.verseKey,
      surahId: r.surahId,
      ayahId: r.ayahId,
      surahName: chapter?.name_simple ?? `Surah ${r.surahId}`,
      surahArabic: chapter?.name_arabic ?? "",
      memorisedAt: r.memorisedAt.toISOString(),
    }
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Your account
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Hifz
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track ayahs you have memorised. Progress by surah and by juz — mark
          or unmark anytime from the reader.
        </p>
      </div>

      <HifzView initialAyahs={ayahs} />
    </div>
  )
}
