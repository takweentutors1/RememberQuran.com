import { createHash, randomBytes } from "node:crypto"
import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { getDb } from "@/lib/firestore/admin"
import { getUserByEmail, setPasswordResetToken, clearPasswordResetToken } from "@/lib/firestore/users"
import { checkRateLimit, getClientIp } from "@/lib/rateLimit"

export const runtime = "nodejs"

const RESET_TTL_MS = 60 * 60 * 1000
const EMAIL_COOLDOWN_MS = 60 * 1000
const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent."

// The existing per-user 60s cooldown below only kicks in once an account is
// found — it does nothing to stop someone spraying this endpoint with many
// different emails (enumeration / mail-bombing an inbox). This IP limit
// covers that: checked before any account lookup, so it applies regardless
// of whether the target email exists.
const RESET_IP_WINDOW_MS = 15 * 60 * 1000
const RESET_IP_LIMIT = 5

// A valid reset request incurs a bcrypt hash, a Firestore write,
// and a Firebase Trigger Email call before responding, while the "invalid email" /
// "cooldown" early-returns are very fast. A malicious actor could use
// response timing to enumerate which emails exist. Even though every 
// branch's response body is identical, that timing gap is
// itself an enumeration side-channel — pad every enumeration-sensitive
// branch out to the same floor so response time stops leaking whether the
// email exists.
const MIN_RESPONSE_MS = 500

async function enforceMinDelay(startedAt: number) {
  const elapsed = Date.now() - startedAt
  if (elapsed < MIN_RESPONSE_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_MS - elapsed))
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const ipCheck = await checkRateLimit(
    `reset-request:ip:${ip}`,
    RESET_IP_LIMIT,
    RESET_IP_WINDOW_MS,
  )
  if (!ipCheck.allowed) {
    return privateJson(
      { error: "Too many requests. Please try again later." },
      429,
      { "Retry-After": String(ipCheck.retryAfterSeconds) },
    )
  }

  const startedAt = Date.now()

  let body: { email?: unknown }
  try {
    body = (await request.json()) as { email?: unknown }
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const parsed = validateEmail(body.email)
  if (!parsed.success) {
    // Same outward result avoids turning this route into an account lookup.
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const isProduction = process.env.NODE_ENV === "production"
  const emailFrom = process.env.EMAIL_FROM?.trim() || "noreply@rememberquran.com"

  const user = await getUserByEmail(parsed.email)
  if (!user) {
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const now = Date.now()
  const lastRequest = user.passwordResetRequestedAt?.getTime() ?? 0
  if (now - lastRequest < EMAIL_COOLDOWN_MS) {
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const rawToken = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(rawToken).digest("hex")
  const expires = new Date(now + RESET_TTL_MS)

  await setPasswordResetToken(user.id, {
    tokenHash,
    expires,
    requestedAt: new Date(now),
  })

  const baseUrl = process.env.AUTH_URL?.trim() || "https://rememberquran.com"
  const resetUrl = new URL(`/reset/${rawToken}`, baseUrl).toString()

  try {
    await getDb().collection("mail").add({
      to: user.email,
      message: {
        subject: "Reset your RememberQuran password",
        text: `Reset your RememberQuran password: ${resetUrl}\n\nThis link expires in one hour. If you did not request it, you can ignore this email.`,
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#25231f">
            <p style="color:#237c68;font-size:14px">RememberQuran</p>
            <h1 style="font-size:24px;font-weight:500">Reset your password</h1>
            <p style="font-family:Arial,sans-serif;line-height:1.6">
              Use the link below to choose a new password. It expires in one hour.
            </p>
            <p style="margin:28px 0">
              <a href="${resetUrl}" style="background:#237c68;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif">
                Reset password
              </a>
            </p>
            <p style="font-family:Arial,sans-serif;color:#6b6963;font-size:13px">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        `,
      },
    })
  } catch (error) {
    console.error("Firebase mail trigger failed", error)
    await clearPasswordResetToken(user.id)
    await enforceMinDelay(startedAt)
    return privateJson(
      { error: "Could not queue the reset email. Please try again." },
      502,
    )
  }

  await enforceMinDelay(startedAt)
  return privateJson({
    ok: true,
    message: GENERIC_MESSAGE,    // Local-only escape hatch so the flow is testable before Firebase Email is setup.
    ...(isProduction ? {} : { devResetUrl: resetUrl }),
  })
}
