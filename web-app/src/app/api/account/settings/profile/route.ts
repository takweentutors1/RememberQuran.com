import { auth } from "@/auth"
import { privateJson } from "@/lib/auth/api-response"
import { updateDisplayName, getUserById } from "@/lib/firestore/users"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return privateJson({ error: "Unauthorized." }, 401)
  }

  let body: { displayName?: unknown }
  try {
    body = (await request.json()) as { displayName?: unknown }
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  if (typeof body.displayName !== "string") {
    return privateJson({ error: "Display name is required." }, 400)
  }

  const displayName = body.displayName.trim()
  if (displayName.length > 80) {
    return privateJson(
      { error: "Display name must be at most 80 characters." },
      400,
    )
  }

  const existing = await getUserById(session.user.id)
  if (!existing) return privateJson({ error: "Account not found." }, 404)

  await updateDisplayName(session.user.id, displayName)

  return privateJson({ ok: true, profile: { displayName } })
}
