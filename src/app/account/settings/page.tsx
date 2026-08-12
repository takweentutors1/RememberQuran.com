import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SettingsForms } from "@/components/account/SettingsForms"
import { getUserById } from "@/lib/firestore/users"

export const metadata: Metadata = {
  title: "Account settings",
}

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/settings")
  }

  const user = await getUserById(session.user.id)

  if (!user) redirect("/login?next=/account/settings")

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Your account
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile and sign-in details.
        </p>
      </div>

      <SettingsForms
        initialDisplayName={user.profile.displayName}
        initialEmail={user.email}
      />
    </div>
  )
}
