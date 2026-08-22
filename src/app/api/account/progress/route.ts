import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { getUserById } from "@/lib/firestore/users"
import { TOTAL_SURAHS } from "@/lib/progress/date"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const user = await getUserById(userId)

  let lastPosition: {
    verseKey: string
    surahId: number
    ayahId: number
    updatedAt: string
  } | null = null

  const raw = user?.lastPosition ?? null
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

  // Denormalized on the user doc (see progress.ts) — avoids scanning every
  // progress event the user has ever created just to dedupe surah numbers.
  const viewedSurahIds = (user?.viewedSurahs ?? [])
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_SURAHS)
    .sort((a, b) => a - b)

  return privateJson({
    lastPosition,
    viewedSurahIds,
    viewedCount: viewedSurahIds.length,
    total: TOTAL_SURAHS,
  })
}
