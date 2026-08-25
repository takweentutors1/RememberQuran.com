import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import {
  listCollections,
  getOrCreateFavourites,
  createCollection,
  renameCollection,
  deleteCollection,
} from "@/lib/firestore/bookmarkCollections"

export const runtime = "nodejs"

const NAME_MAX_LENGTH = 80

function parseName(input: unknown): { name: string } | { error: string } {
  if (typeof input !== "string") return { error: "Collection name is required." }
  const name = input.trim()
  if (!name) return { error: "Collection name cannot be empty." }
  if (name.length > NAME_MAX_LENGTH) {
    return {
      error: `Collection name must be at most ${NAME_MAX_LENGTH} characters.`,
    }
  }
  return { name }
}

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

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  await getOrCreateFavourites(userId)
  const collections = await listCollections(userId)

  return privateJson({
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      isDefault: c.isDefault,
      count: c.count,
    })),
  })
}

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const parsed = parseName(body.name)
  if ("error" in parsed) return privateJson({ error: parsed.error }, 400)

  const result = await createCollection(userId, parsed.name)
  if (!result.ok) {
    if (result.error === "duplicate-name") {
      return privateJson(
        { error: "You already have a collection with this name." },
        409,
      )
    }
    return privateJson(
      { error: "You can have at most 50 collections." },
      400,
    )
  }

  return privateJson({ collection: result.collection }, 201)
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const id = parseId(body.id)
  if (!id) return privateJson({ error: "Collection not found." }, 404)

  const parsed = parseName(body.name)
  if ("error" in parsed) return privateJson({ error: parsed.error }, 400)

  const result = await renameCollection(userId, id, parsed.name)
  if (!result.ok) {
    if (result.error === "not-found") {
      return privateJson({ error: "Collection not found." }, 404)
    }
    if (result.error === "is-default") {
      return privateJson({ error: "Favourites cannot be renamed." }, 403)
    }
    return privateJson(
      { error: "You already have a collection with this name." },
      409,
    )
  }

  return privateJson({ collection: result.collection })
}

export async function DELETE(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  const id = parseId(body?.id)
  if (!id) return privateJson({ error: "Collection not found." }, 404)

  const result = await deleteCollection(userId, id)
  if (!result.ok) {
    if (result.error === "not-found") {
      return privateJson({ error: "Collection not found." }, 404)
    }
    return privateJson({ error: "Favourites cannot be deleted." }, 403)
  }

  return privateJson({ ok: true, movedToFavourites: result.movedToFavourites })
}
