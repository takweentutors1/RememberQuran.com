import { auth } from "@/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { verifyPassword } from "@/lib/auth/firebase-credentials"
import { getAdminAuth } from "@/lib/firestore/admin"
import { getUserById, changeEmail } from "@/lib/firestore/users"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return privateJson({ error: "Unauthorized." }, 401)
  }

  let body: { email?: unknown; currentPassword?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const email = validateEmail(body.email)
  if (!email.success) return privateJson({ error: email.error }, 400)

  if (typeof body.currentPassword !== "string") {
    return privateJson({ error: "Current password is required." }, 400)
  }

  const user = await getUserById(session.user.id)
  if (!user) return privateJson({ error: "Account not found." }, 404)

  const correctPassword = await verifyPassword(user, body.currentPassword)
  if (!correctPassword) {
    return privateJson({ error: "Current password is incorrect." }, 400)
  }

  if (user.email === email.email) {
    return privateJson({ ok: true, email: user.email })
  }

  // Firebase Auth is updated first when this user has a linked account —
  // it's the source of truth `authorize()` checks against, so Firestore and
  // Firebase disagreeing on the email would silently break their next
  // login. If the Firestore transaction below fails, the Firebase email is
  // rolled back in the catch block.
  if (user.firebaseUid) {
    try {
      await getAdminAuth().updateUser(user.firebaseUid, { email: email.email })
    } catch (error) {
      if (isFirebaseCode(error, "auth/email-already-exists")) {
        return privateJson(
          { error: "An account with this email already exists." },
          409,
        )
      }
      console.error("Firebase Auth email update failed", error)
      return privateJson({ error: "Could not change email. Please try again." }, 500)
    }
  }

  try {
    const result = await changeEmail(session.user.id, email.email)
    if (!result.ok) {
      await rollbackFirebaseEmail(user.firebaseUid, user.email)
      return privateJson(
        { error: "An account with this email already exists." },
        409,
      )
    }
  } catch (error) {
    console.error("Change email failed", error)
    await rollbackFirebaseEmail(user.firebaseUid, user.email)
    return privateJson({ error: "Could not change email. Please try again." }, 500)
  }

  return privateJson({
    ok: true,
    email: email.email,
    reauthenticate: true,
  })
}

function isFirebaseCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === code
  )
}

/**
 * Compensating rollback: Firebase's email was already updated but the
 * Firestore transaction failed — isolated from the caller's catch block so
 * a failure here can't swallow the original error.
 */
async function rollbackFirebaseEmail(
  firebaseUid: string | null,
  oldEmail: string,
): Promise<void> {
  if (!firebaseUid) return
  try {
    await getAdminAuth().updateUser(firebaseUid, { email: oldEmail })
  } catch (cleanupError) {
    console.error(
      "CRITICAL: Firebase Auth email out of sync with Firestore, needs manual cleanup",
      { firebaseUid, oldEmail, cleanupError },
    )
  }
}
