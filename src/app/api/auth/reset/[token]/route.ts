import { createHash } from "node:crypto"
import { hash } from "bcryptjs"
import { privateJson } from "@/lib/auth/api-response"
import { validatePassword } from "@/lib/auth/credentials"
import { getUserByResetToken, updatePasswordHash } from "@/lib/firestore/users"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    return privateJson({ error: "This reset link is invalid or expired." }, 400)
  }

  let body: { password?: unknown; confirmPassword?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const password = validatePassword(body.password)
  if (!password.success) {
    return privateJson({ error: password.error }, 400)
  }
  if (
    typeof body.confirmPassword !== "string" ||
    body.confirmPassword !== password.password
  ) {
    return privateJson({ error: "Passwords do not match." }, 400)
  }

  const tokenHash = createHash("sha256").update(token).digest("hex")

  const user = await getUserByResetToken(tokenHash)
  if (!user) {
    return privateJson({ error: "This reset link is invalid or expired." }, 400)
  }

  const passwordHash = await hash(password.password, 12)
  await updatePasswordHash(user.id, passwordHash)

  return privateJson({ ok: true })
}
