import { compare, hash } from "bcryptjs"
import { getAdminAuth } from "@/lib/firestore/admin"
import {
  touchPasswordChangedAt,
  updatePasswordHash,
  type UserRecord,
} from "@/lib/firestore/users"
import { validatePassword } from "./credentials"

const BCRYPT_ROUNDS = 12

/**
 * Password verification/reset for `firebaseUid` users goes through the
 * public Identity Toolkit REST API, not the Admin SDK — the Admin SDK can
 * verify tokens but has no way to check a password, and its
 * `generatePasswordResetLink()` only generates a link, it never sends an
 * email. This REST API is the same one the Firebase client SDKs call under
 * the hood, and (unlike the Admin SDK) it does trigger Firebase's built-in
 * reset-email delivery.
 */
function identityToolkitBaseUrl(): string {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim()
  if (emulatorHost) {
    return `http://${emulatorHost}/identitytoolkit.googleapis.com/v1`
  }
  return "https://identitytoolkit.googleapis.com/v1"
}

function apiKey(): string {
  const key = process.env.FIREBASE_WEB_API_KEY?.trim()
  if (!key) {
    throw new Error(
      "Missing FIREBASE_WEB_API_KEY — required for Identity Toolkit REST calls (see .env.example).",
    )
  }
  return key
}

async function identityToolkitFetch(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false }> {
  // Against the emulator the key is unvalidated — any non-empty placeholder works.
  const key = process.env.FIREBASE_AUTH_EMULATOR_HOST ? "emulator" : apiKey()
  const res = await fetch(
    `${identityToolkitBaseUrl()}/${path}?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  )
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) return { ok: false }
  return { ok: true, data }
}

/**
 * Verifies a password against Firebase Auth (if this user has been
 * migrated/created there) or the legacy bcrypt hash otherwise. Any Firebase
 * error response — invalid password, unknown email, disabled account — is
 * treated uniformly as "invalid": Google's email-enumeration-protection
 * rollout can collapse distinct error codes into one generic code, so this
 * must not branch on the specific code.
 */
export async function verifyPassword(
  user: UserRecord,
  password: string,
): Promise<boolean> {
  if (!user.firebaseUid) {
    return compare(password, user.passwordHash)
  }

  const result = await identityToolkitFetch("accounts:signInWithPassword", {
    email: user.email,
    password,
    returnSecureToken: true,
  })
  return result.ok
}

/**
 * Sets a new password — Firebase Auth for migrated users (also bumps
 * `passwordChangedAt` directly, since Firebase now owns the password and
 * there's no hash to write), legacy bcrypt hash + `updatePasswordHash`
 * otherwise.
 */
export async function setPassword(
  user: UserRecord,
  newPassword: string,
): Promise<void> {
  if (user.firebaseUid) {
    await getAdminAuth().updateUser(user.firebaseUid, { password: newPassword })
    await touchPasswordChangedAt(user.id)
    return
  }

  const passwordHash = await hash(newPassword, BCRYPT_ROUNDS)
  await updatePasswordHash(user.id, passwordHash)
}

export type SendResetEmailResult =
  | { ok: true }
  | { ok: false; reason: "no-firebase-account" }

/**
 * Triggers Firebase's built-in password-reset email. Fails for any email
 * without a linked Firebase Auth account (not-yet-migrated users, or
 * accounts deliberately left unlinked because of a mobile-app email
 * collision — see the migration script). Callers must not let that failure
 * leak into an enumeration-distinguishable HTTP response.
 */
export async function sendPasswordResetEmail(
  email: string,
): Promise<SendResetEmailResult> {
  const result = await identityToolkitFetch("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  })
  return result.ok ? { ok: true } : { ok: false, reason: "no-firebase-account" }
}

export type ConfirmResetResult =
  | { ok: true; email: string }
  | { ok: false; error: string }

/**
 * Confirms a Firebase password-reset oobCode with a new password. Validates
 * against this app's password rules first — Firebase's own floor (6 chars)
 * is weaker than ours (8 chars/72 bytes) and must not become the effective
 * minimum for this path.
 */
export async function confirmPasswordReset(
  oobCode: string,
  newPassword: string,
): Promise<ConfirmResetResult> {
  const validated = validatePassword(newPassword)
  if (!validated.success) {
    return { ok: false, error: validated.error }
  }

  const result = await identityToolkitFetch("accounts:resetPassword", {
    oobCode,
    newPassword: validated.password,
  })
  if (!result.ok || typeof result.data.email !== "string") {
    return { ok: false, error: "This reset link is invalid or expired." }
  }
  return { ok: true, email: result.data.email }
}
