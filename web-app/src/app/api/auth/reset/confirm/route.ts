import { privateJson } from "@/lib/auth/api-response"
import { confirmPasswordReset, resolveFirebaseUid } from "@/lib/auth/firebase-credentials"
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
    // confirmPasswordReset() above already changed the *real* Firebase Auth
    // password via the oobCode, unconditionally — that part needs no branch.
    // Only a genuinely still-legacy account (never linked to Firebase Auth
    // at all — see resolveFirebaseUid) also needs its bcrypt hash updated,
    // since that hash is still what its login flow checks. Writing a bcrypt
    // hash for a Firebase/mobile-backed account here was actively harmful:
    // it would make resolveFirebaseUid start misclassifying that account as
    // legacy on every subsequent request, since its heuristic for "created
    // by the mobile app" is precisely the absence of a passwordHash.
    if (!resolveFirebaseUid(user)) {
      const { hash } = await import("bcryptjs")
      const { updatePasswordHash } = await import("@/lib/firestore/users")
      const passwordHash = await hash(body.password as string, 12)
      await updatePasswordHash(user.id, passwordHash)
    } else {
      await touchPasswordChangedAt(user.id)
    }
  }

  return privateJson({ ok: true })
}
