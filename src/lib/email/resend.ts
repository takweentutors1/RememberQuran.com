import { Resend } from "resend"

/**
 * Sends a beautifully designed HTML password reset email to the user.
 */
export async function sendPasswordResetEmailAction(email: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Simulating email send:", resetUrl)
    return { ok: true }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { error } = await resend.emails.send({
      from: "Remember Quran <noreply@rememberquran.com>",
      to: email,
      subject: "Reset your Remember Quran password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f7f6f2; text-align: center; color: #2d3748;">
          <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h1 style="margin-top: 0; color: #1a202c; font-size: 24px;">Reset your password</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #4a5568; margin-bottom: 30px;">
              We received a request to reset the password for your Remember Quran account. Click the button below to choose a new password.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 16px; padding: 12px 24px; border-radius: 8px;">
              Reset Password
            </a>
            <p style="font-size: 14px; color: #a0aec0; margin-top: 30px;">
              If you didn't request a password reset, you can safely ignore this email. This link expires in 1 hour.
            </p>
          </div>
          <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Remember Quran
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend API error:", error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error("Failed to send reset email:", err)
    return { ok: false, error: "Failed to send email" }
  }
}
