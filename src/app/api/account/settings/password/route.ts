import { auth } from "@/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validatePassword } from "@/lib/auth/credentials"
import { setPassword, verifyPassword } from "@/lib/auth/firebase-credentials"
import { getUserById } from "@/lib/firestore/users"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return privateJson({ error: "Unauthorized." }, 401)
  }

  let body: {
    currentPassword?: unknown
    newPassword?: unknown
    confirmPassword?: unknown
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  if (typeof body.currentPassword !== "string") {
    return privateJson({ error: "Current password is required." }, 400)
  }

  const newPassword = validatePassword(body.newPassword)
  if (!newPassword.success) {
    return privateJson({ error: newPassword.error }, 400)
  }

  if (
    typeof body.confirmPassword !== "string" ||
    body.confirmPassword !== newPassword.password
  ) {
    return privateJson({ error: "New passwords do not match." }, 400)
  }

  const user = await getUserById(session.user.id)
  if (!user) return privateJson({ error: "Account not found." }, 404)

  const correctPassword = await verifyPassword(user, body.currentPassword)
  if (!correctPassword) {
    return privateJson({ error: "Current password is incorrect." }, 400)
  }

  const unchanged = await verifyPassword(user, newPassword.password)
  if (unchanged) {
    return privateJson(
      { error: "Choose a password different from your current one." },
      400,
    )
  }

  await setPassword(user, newPassword.password)

  return privateJson({ ok: true, reauthenticate: true })
}
