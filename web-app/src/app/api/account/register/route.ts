import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { validateCredentials } from "@/lib/auth/credentials"
import { getAdminAuth } from "@/lib/firestore/admin"
import { createUser } from "@/lib/firestore/users"

export const runtime = "nodejs"
export const maxDuration = 30

const MAX_REQUEST_BYTES = 16_384
const DISPLAY_NAME_MAX_LENGTH = 80

interface RegisterBody {
  email?: unknown
  password?: unknown
  displayName?: unknown
}

function json(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: "Request is too large." }, 413)
  }

  let body: RegisterBody
  try {
    body = (await request.json()) as RegisterBody
  } catch {
    return json({ error: "Invalid JSON body." }, 400)
  }

  const parsed = validateCredentials(body.email, body.password)
  if (!parsed.success) {
    return json({ error: parsed.error }, 400)
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : ""

  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return json(
      {
        error: `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`,
      },
      400,
    )
  }

  // Firebase Auth is the authoritative uniqueness check — done first so an
  // email that already has a Firebase account (e.g. created by the mobile
  // app) correctly 409s here instead of silently creating a second,
  // Firestore-only identity for the same address.
  let firebaseUid: string
  try {
    const firebaseUser = await getAdminAuth().createUser({
      email: parsed.data.email,
      password: parsed.data.password,
    })
    firebaseUid = firebaseUser.uid
  } catch (error) {
    if (isFirebaseCode(error, "auth/email-already-exists")) {
      return json({ error: "An account with this email already exists." }, 409)
    }
    console.error("Firebase Auth account creation failed", error)
    return json(
      { error: "Could not create your account. Please try again." },
      500,
    )
  }

  try {
    // Still hashed and stored even though Firebase Auth owns verification
    // going forward — it's the rollback safety net (see passwordHash's
    // doc comment on UserRecord) and the fallback path if this account is
    // ever unlinked from Firebase.
    const passwordHash = await hash(parsed.data.password, 12)

    // Email reservation, user doc, and default "Favourites" collection are
    // created atomically in one Firestore transaction — see createUser().
    const result = await createUser({
      email: parsed.data.email,
      passwordHash,
      firebaseUid,
      displayName,
    })

    if (!result.ok) {
      await deleteOrphanedFirebaseUser(firebaseUid, parsed.data.email)
      return json({ error: "An account with this email already exists." }, 409)
    }

    return json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: displayName || null,
        },
      },
      201,
    )
  } catch (error) {
    console.error("Registration failed", error)
    await deleteOrphanedFirebaseUser(firebaseUid, parsed.data.email)
    return json(
      { error: "Could not create your account. Please try again." },
      500,
    )
  }
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
 * Compensating rollback: the Firebase Auth account was created successfully
 * but the Firestore side failed, leaving an orphan with no Firestore doc.
 * Isolated from the caller's catch block so a failure here can't swallow
 * the original error — logged loudly since an undeleted orphan permanently
 * blocks that email from registering again until cleaned up by hand.
 */
async function deleteOrphanedFirebaseUser(
  uid: string,
  email: string,
): Promise<void> {
  try {
    await getAdminAuth().deleteUser(uid)
  } catch (cleanupError) {
    console.error(
      "CRITICAL: orphaned Firebase Auth account, needs manual cleanup",
      { uid, email, cleanupError },
    )
  }
}
