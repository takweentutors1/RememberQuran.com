import type { NextRequest } from "next/server"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { parseVerseKey } from "@/lib/quran/verse-key"
import { listMemorisedAyahs, markMemorised, unmarkMemorised } from "@/lib/firestore/hifz"

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

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const surahIdParam = request.nextUrl.searchParams.get("surahId")
  let surahId: number | undefined

  if (surahIdParam !== null) {
    const n = Number(surahIdParam)
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      return privateJson({ error: "Invalid surah." }, 400)
    }
    surahId = n
  }

  const rows = await listMemorisedAyahs(userId, surahId)

  return privateJson({
    ayahs: rows.map((r) => ({
      verseKey: r.verseKey,
      surahId: r.surahId,
      ayahId: r.ayahId,
      memorisedAt: r.memorisedAt,
    })),
  })
}

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const verse = parseVerseKey(body.verseKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
  const verseKey = `${verse.surahId}:${verse.ayahId}`

  const result = await markMemorised(userId, verseKey, verse.surahId, verse.ayahId)
  if (!result.ok) {
    return privateJson({ error: "You can mark at most 6236 ayahs." }, 400)
  }

  return privateJson(
    {
      ayah: {
        verseKey: result.ayah.verseKey,
        surahId: result.ayah.surahId,
        ayahId: result.ayah.ayahId,
        memorisedAt: result.ayah.memorisedAt,
      },
    },
    result.created ? 201 : 200,
  )
}

export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  const rawKey = body?.verseKey ?? request.nextUrl.searchParams.get("verseKey")
  const verse = parseVerseKey(rawKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)

  const removed = await unmarkMemorised(userId, `${verse.surahId}:${verse.ayahId}`)

  return privateJson({ ok: true, removed })
}
