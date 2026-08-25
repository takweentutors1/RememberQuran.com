import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/AuthShell"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

export const metadata: Metadata = {
  title: "Authentication Action",
}

export default async function AuthActionPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; oobCode?: string }>
}) {
  const { mode, oobCode } = await searchParams

  if (mode === "resetPassword") {
    return (
      <AuthShell
        title="Choose a new password"
        subtitle="Use a password you don’t use elsewhere. This reset link works once."
        footer={
          <Link
            href="/login?next=/account"
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Return to sign in
          </Link>
        }
      >
        <ResetPasswordForm oobCode={oobCode ?? null} />
      </AuthShell>
    )
  }

  // Handle other modes (verifyEmail, recoverEmail) or invalid requests
  return (
    <AuthShell
      title="Invalid Request"
      subtitle="The link you followed is invalid, expired, or unsupported."
      footer={
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Return to sign in
        </Link>
      }
    >
      <div />
    </AuthShell>
  )
}
