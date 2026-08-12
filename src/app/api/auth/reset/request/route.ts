import { createHash, randomBytes } from "node:crypto"
import { Resend } from "resend"
import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { getUserByEmail, setPasswordResetToken, clearPasswordResetToken } from "@/lib/firestore/users"

export const runtime = "nodejs"

const RESET_TTL_MS = 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent."

export async function POST(request: Request) {
  let body: { email?: unknown }
  try {
    body = (await request.json()) as { email?: unknown }
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const parsed = validateEmail(body.email)
  if (!parsed.success) {
    // Same outward result avoids turning this route into an account lookup.
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const isProduction = process.env.NODE_ENV === "production"
  const resendKey = process.env.RESEND_API_KEY?.trim()
  const emailFrom = process.env.EMAIL_FROM?.trim()

  if (isProduction && (!resendKey || !emailFrom)) {
    return privateJson(
      { error: "Password reset email is temporarily unavailable." },
      503,
    )
  }

  const user = await getUserByEmail(parsed.email)
  if (!user) {
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const now = Date.now()
  const lastRequest = user.passwordResetRequestedAt?.getTime() ?? 0
  if (now - lastRequest < RESEND_COOLDOWN_MS) {
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

  const baseUrl = process.env.AUTH_URL?.trim() || "http://localhost:3000"
  const resetUrl = new URL(`/reset/${rawToken}`, baseUrl).toString()

  if (resendKey && emailFrom) {
    const resend = new Resend(resendKey)
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: user.email,
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
    })

    if (error) {
      console.error("Reset email failed", error)
      await clearPasswordResetToken(user.id)
      return privateJson(
        { error: "Could not send the reset email. Please try again." },
        502,
      )
    }
  }

  return privateJson({
    ok: true,
    message: GENERIC_MESSAGE,
    // Local-only escape hatch so the flow is testable before Resend DNS is set.
    ...(isProduction ? {} : { devResetUrl: resetUrl }),
  })
}
