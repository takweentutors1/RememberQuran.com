import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthSwitchLink } from "@/components/auth/AuthSwitchLink"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { safeNextPath } from "@/lib/auth/safe-next"

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a free RememberQuran account to save bookmarks, notes, and reading progress.",
}

interface RegisterPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth()
  const params = await searchParams
  const next = safeNextPath(params.next, "/account")

  if (session?.user?.id) {
    redirect(next)
  }

  return (
    <AuthShell
      title="Begin your journey"
      subtitle="Create a free account for personal features. Surahs, audio, and study tools stay open without signing in."
      footer={
        <Suspense fallback={null}>
          <AuthSwitchLink mode="to-login" />
        </Suspense>
      }
    >
      <Suspense fallback={<div className="h-52 animate-pulse rounded-lg bg-muted/40" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  )
}
