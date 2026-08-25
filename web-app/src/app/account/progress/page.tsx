import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ProgressView } from "@/components/account/ProgressView"
import { getChapters } from "@/lib/quranApi"
import { getUserById } from "@/lib/firestore/users"
import { TOTAL_SURAHS } from "@/lib/progress/date"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const metadata: Metadata = {
  title: "Progress",
}

export const dynamic = "force-dynamic"

export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/progress")
  }
  const userId = session.user.id

  const [user, chapters] = await Promise.all([
    getUserById(userId),
    getChapters(),
  ])

  const raw = user?.lastPosition ?? null
  let lastPosition = null as null | {
    verseKey: string
    surahId: number
    ayahId: number
    updatedAt: string
  }

  if (raw?.verseKey) {
    const parsed = parseVerseKey(raw.verseKey)
    if (parsed) {
      lastPosition = {
        verseKey: `${parsed.surahId}:${parsed.ayahId}`,
        surahId: parsed.surahId,
        ayahId: parsed.ayahId,
        updatedAt: raw.updatedAt.toISOString(),
      }
    }
  }

  const viewedSurahIds = (user?.viewedSurahs ?? [])
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_SURAHS)
    .sort((a, b) => a - b)

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Your account
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Progress
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Continue where you left off and see which surahs you have viewed.
        </p>
      </div>

      <ProgressView
        viewedSurahIds={viewedSurahIds}
        lastPosition={lastPosition}
        chapters={chapters.map((c) => ({
          id: c.id,
          name_simple: c.name_simple,
        }))}
      />
    </div>
  )
}
