import { privateJson } from "@/lib/auth/api-response"
import { confirmPasswordReset } from "@/lib/auth/firebase-credentials"
import { getUserByEmail, touchPasswordChangedAt } from "@/lib/firestore/users"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let body: { oobCode?: unknown; password?: unknown; confirmPassword?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  if (typeof body.oobCode !== "string" || body.oobCode.length === 0) {
    return privateJson({ error: "This reset link is invalid or expired." }, 400)
  }
  if (typeof body.password !== "string") {
    return privateJson({ error: "Password is required." }, 400)
  }
  if (
    typeof body.confirmPassword !== "string" ||
    body.confirmPassword !== body.password
  ) {
    return privateJson({ error: "Passwords do not match." }, 400)
  }

  const result = await confirmPasswordReset(body.oobCode, body.password)
  if (!result.ok) {
    return privateJson({ error: result.error }, 400)
  }

  // Firebase already stored the new password — this just invalidates any
  // live NextAuth JWT session for the account (see the `passwordChangedAt`
  // revalidation in src/auth.ts).
  const user = await getUserByEmail(result.email)
  if (user) {
    await touchPasswordChangedAt(user.id)
  }

  return privateJson({ ok: true })
}
