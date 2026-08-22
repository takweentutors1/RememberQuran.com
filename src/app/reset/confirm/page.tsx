import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/AuthShell"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

export const metadata: Metadata = {
  title: "Choose a new password",
}

export default async function ResetPasswordConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ oobCode?: string }>
}) {
  const { oobCode } = await searchParams

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Use a password you don’t use elsewhere. This reset link works once."
      footer={
        <Link
          href="/login?next=/account"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Return to sign in
        </Link>
      }
    >
      <ResetPasswordForm oobCode={oobCode ?? null} />
    </AuthShell>
  )
}
