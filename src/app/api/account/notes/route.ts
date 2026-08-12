import type { NextRequest } from "next/server"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { normalizeNoteText } from "@/lib/notes/text"
import { parseVerseKey } from "@/lib/quran/verse-key"
import { getNote, listNotes, saveNote, deleteNote } from "@/lib/firestore/notes"

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

function serializeNote(note: { verseKey: string; text: string; createdAt: Date; updatedAt: Date }) {
  return {
    verseKey: note.verseKey,
    text: note.text,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const params = request.nextUrl.searchParams
  const verseKeyParam = params.get("verseKey")
  const surahIdParam = params.get("surahId")

  // Single note for the editor — missing is not an error
  if (verseKeyParam !== null) {
    const verse = parseVerseKey(verseKeyParam)
    if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
    const verseKey = `${verse.surahId}:${verse.ayahId}`
    const note = await getNote(userId, verseKey)
    return privateJson({ note: note ? serializeNote(note) : null })
  }

  let surahPrefix: number | undefined
  if (surahIdParam !== null) {
    const n = Number(surahIdParam)
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      return privateJson({ error: "Invalid surah." }, 400)
    }
    surahPrefix = n
  }

  const notes = await listNotes(userId, { surahPrefix })

  return privateJson({
    notes: notes.map(serializeNote),
  })
}

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const verse = parseVerseKey(body.verseKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
  const verseKey = `${verse.surahId}:${verse.ayahId}`

  const normalized = normalizeNoteText(body.text)
  if (!normalized.ok) return privateJson({ error: normalized.error }, 400)

  // Empty / whitespace → delete (idempotent)
  if (normalized.text.length === 0) {
    await deleteNote(userId, verseKey)
    return privateJson({ deleted: true })
  }

  const result = await saveNote(userId, verseKey, normalized.text)
  if (!result.ok) {
    return privateJson({ error: "You can save at most 2,000 notes." }, 400)
  }

  return privateJson({ note: serializeNote(result.note) })
}

export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  const rawKey = body?.verseKey ?? request.nextUrl.searchParams.get("verseKey")
  const verse = parseVerseKey(rawKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)

  await deleteNote(userId, `${verse.surahId}:${verse.ayahId}`)

  return privateJson({ deleted: true })
}
