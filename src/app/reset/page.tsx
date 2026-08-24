import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/AuthShell"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Reset password",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we’ll send a secure link. The link expires after one hour."
      footer={
        <Link
          href="/login?next=/account"
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Return to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
