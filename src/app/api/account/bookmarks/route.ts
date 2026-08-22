import type { NextRequest } from "next/server"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { parseVerseKey } from "@/lib/quran/verse-key"
import { listBookmarks, createBookmark, moveBookmark, deleteBookmark } from "@/lib/firestore/bookmarks"

export const runtime = "nodejs"

function parseId(input: unknown): string | null {
  return typeof input === "string" && input.trim().length > 0 ? input.trim() : null
}

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

  const params = request.nextUrl.searchParams
  const collectionIdParam = params.get("collectionId")
  const surahIdParam = params.get("surahId")

  const filter: { collectionId?: string; surahPrefix?: number } = {}

  if (collectionIdParam !== null) {
    const id = parseId(collectionIdParam)
    if (!id) return privateJson({ error: "Collection not found." }, 404)
    filter.collectionId = id
  }

  // Reader batch: one request per surah so every ayah icon renders without N+1
  if (surahIdParam !== null) {
    const n = Number(surahIdParam)
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      return privateJson({ error: "Invalid surah." }, 400)
    }
    filter.surahPrefix = n
  }

  const bookmarks = await listBookmarks(userId, filter)

  return privateJson({
    bookmarks: bookmarks.map((b) => ({
      verseKey: b.verseKey,
      collectionId: b.collectionId,
      createdAt: b.createdAt,
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

  const collectionId = parseId(body.collectionId)
  if (body.collectionId != null && !collectionId) {
    return privateJson({ error: "Collection not found." }, 404)
  }

  const result = await createBookmark(userId, verseKey, collectionId)
  if (!result.ok) {
    if (result.error === "collection-not-found") {
      return privateJson({ error: "Collection not found." }, 404)
    }
    return privateJson(
      { error: "You can save at most 2000 bookmarks." },
      400,
    )
  }

  return privateJson(
    {
      bookmark: {
        verseKey: result.bookmark.verseKey,
        collectionId: result.bookmark.collectionId,
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

  const collectionId = parseId(body.collectionId)
  if (body.collectionId != null && !collectionId) {
    return privateJson({ error: "Collection not found." }, 404)
  }

  const result = await moveBookmark(userId, verseKey, collectionId)
  if (!result.ok) {
    if (result.error === "not-found") {
      return privateJson({ error: "Bookmark not found." }, 404)
    }
    return privateJson({ error: "Collection not found." }, 404)
  }

  return privateJson({
    bookmark: {
      verseKey: result.bookmark.verseKey,
      collectionId: result.bookmark.collectionId,
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

  const removed = await deleteBookmark(userId, `${verse.surahId}:${verse.ayahId}`)

  return privateJson({ ok: true, removed })
}
