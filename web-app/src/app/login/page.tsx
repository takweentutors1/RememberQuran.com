import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthSwitchLink } from "@/components/auth/AuthSwitchLink"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to RememberQuran to save bookmarks, notes, and reading progress.",
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to save bookmarks, notes, and continue where you left off. Reading the Quran stays free for everyone."
      footer={
        <Suspense fallback={null}>
          <AuthSwitchLink mode="to-register" />
        </Suspense>
      }
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/40" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
