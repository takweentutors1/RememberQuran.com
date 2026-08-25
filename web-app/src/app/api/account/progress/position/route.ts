import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { updateLastPosition } from "@/lib/firestore/users"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const verse = parseVerseKey(body.verseKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)

  const verseKey = `${verse.surahId}:${verse.ayahId}`
  const updatedAt = new Date()

  await updateLastPosition(userId, {
    verseKey,
    surahId: verse.surahId,
    ayahId: verse.ayahId,
  })

  return privateJson({
    lastPosition: {
      verseKey,
      surahId: verse.surahId,
      ayahId: verse.ayahId,
      updatedAt,
    },
  })
}
