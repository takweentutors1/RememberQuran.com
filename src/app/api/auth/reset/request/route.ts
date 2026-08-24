import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { sendPasswordResetEmail } from "@/lib/auth/firebase-credentials"
import { getUserByEmail } from "@/lib/firestore/users"
import { checkRateLimit, getClientIp } from "@/lib/rateLimit"

export const runtime = "nodejs"

const EMAIL_COOLDOWN_MS = 60 * 1000
const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent."

// The per-user cooldown below only kicks in once an account is found — it
// does nothing to stop someone spraying this endpoint with many different
// emails (enumeration / mail-bombing an inbox). This IP limit covers that:
// checked before any account lookup, so it applies regardless of whether
// the target email exists.
const RESET_IP_WINDOW_MS = 15 * 60 * 1000
const RESET_IP_LIMIT = 5

// A valid reset request incurs a Firestore read and an Identity Toolkit
// call before responding, while the "invalid email" / "cooldown" early
// returns are very fast. A malicious actor could use response timing to
// enumerate which emails exist. Even though every branch's response body is
// identical, that timing gap is itself an enumeration side-channel — pad
// every enumeration-sensitive branch out to the same floor so response time
// stops leaking whether the email exists.
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

  const user = await getUserByEmail(parsed.email)
  if (!user) {
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const cooldownCheck = await checkRateLimit(
    `reset-cooldown:${user.id}`,
    1,
    EMAIL_COOLDOWN_MS,
  )
  if (!cooldownCheck.allowed) {
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const result = await sendPasswordResetEmail(user.email)
  if (!result.ok) {
    // A real web account with no linked Firebase Auth identity yet — either
    // not migrated, or deliberately left unlinked due to a mobile-app email
    // collision (see the migration script). The HTTP response must stay
    // identical either way to preserve enumeration-safety; this is a known,
    // bounded population that needs manual reconciliation, not a second
    // delivery mechanism.
    console.warn("password-reset: no linked Firebase Auth account", {
      userId: user.id,
    })
  }

  await enforceMinDelay(startedAt)
  return privateJson({ ok: true, message: GENERIC_MESSAGE })
}
