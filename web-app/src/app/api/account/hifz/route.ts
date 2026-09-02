import type { NextRequest } from "next/server"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { parseVerseKey } from "@/lib/quran/verse-key"
import {
  listMemorisedAyahs,
  markMemorised,
  unmarkMemorised,
  recordReviewSRS,
} from "@/lib/firestore/hifz"
import { calculateNextSRS, type SRSGrade } from "@/lib/hifz/srs"

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
      repetitions: r.repetitions ?? 0,
      intervalDays: r.intervalDays ?? 1,
      easeFactor: r.easeFactor ?? 2.5,
      nextReviewAt: r.nextReviewAt ? r.nextReviewAt.toISOString() : null,
      lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
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
        repetitions: result.ayah.repetitions ?? 0,
        intervalDays: result.ayah.intervalDays ?? 1,
        easeFactor: result.ayah.easeFactor ?? 2.5,
        nextReviewAt: result.ayah.nextReviewAt ? result.ayah.nextReviewAt.toISOString() : null,
        lastReviewedAt: result.ayah.lastReviewedAt ? result.ayah.lastReviewedAt.toISOString() : null,
      },
    },
    result.created ? 201 : 200,
  )
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const verse = parseVerseKey(body.verseKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
  const verseKey = `${verse.surahId}:${verse.ayahId}`

  const grade = body.grade as SRSGrade
  if (grade !== "again" && grade !== "hard" && grade !== "good" && grade !== "easy") {
    return privateJson({ error: "Grade must be again, hard, good, or easy." }, 400)
  }

  // Calculate next SRS schedule
  const srsUpdate = calculateNextSRS(
    {
      repetitions: typeof body.repetitions === "number" ? body.repetitions : undefined,
      intervalDays: typeof body.intervalDays === "number" ? body.intervalDays : undefined,
      easeFactor: typeof body.easeFactor === "number" ? body.easeFactor : undefined,
    },
    grade,
  )

  const updated = await recordReviewSRS(userId, verseKey, {
    repetitions: srsUpdate.repetitions,
    intervalDays: srsUpdate.intervalDays,
    easeFactor: srsUpdate.easeFactor,
    nextReviewAt: srsUpdate.nextReviewAt,
    lastReviewedAt: srsUpdate.lastReviewedAt ?? new Date(),
  })

  if (!updated) {
    return privateJson({ error: "Ayah not found in memorised list." }, 404)
  }

  return privateJson({
    ayah: {
      verseKey: updated.verseKey,
      surahId: updated.surahId,
      ayahId: updated.ayahId,
      memorisedAt: updated.memorisedAt,
      repetitions: updated.repetitions,
      intervalDays: updated.intervalDays,
      easeFactor: updated.easeFactor,
      nextReviewAt: updated.nextReviewAt ? updated.nextReviewAt.toISOString() : null,
      lastReviewedAt: updated.lastReviewedAt ? updated.lastReviewedAt.toISOString() : null,
    },
  })
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
