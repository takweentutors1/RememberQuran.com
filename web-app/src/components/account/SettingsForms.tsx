"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const labelClass =
  "mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"

interface FormStatus {
  error?: string
  success?: string
}

function Status({ status }: { status: FormStatus }) {
  if (status.error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {status.error}
      </p>
    )
  }
  if (status.success) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-foreground"
      >
        <CheckCircle2 className="size-4 text-primary" />
        {status.success}
      </p>
    )
  }
  return null
}

async function patch(
  endpoint: string,
  body: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  return { ok: res.ok, error: data.error }
}

export function SettingsForms({
  initialDisplayName,
  initialEmail,
}: {
  initialDisplayName: string
  initialEmail: string
}) {
  const router = useRouter()
  const { update } = useSession()

  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [profileStatus, setProfileStatus] = useState<FormStatus>({})
  const [profilePending, setProfilePending] = useState(false)

  const [email, setEmail] = useState(initialEmail)
  const [emailPassword, setEmailPassword] = useState("")
  const [emailStatus, setEmailStatus] = useState<FormStatus>({})
  const [emailPending, setEmailPending] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<FormStatus>({})
  const [passwordPending, setPasswordPending] = useState(false)

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setProfilePending(true)
    setProfileStatus({})
    const result = await patch("/api/account/settings/profile", { displayName })
    if (!result.ok) {
      setProfileStatus({ error: result.error ?? "Could not save profile." })
      setProfilePending(false)
      return
    }
    await update({ name: displayName.trim() })
    router.refresh()
    setProfileStatus({ success: "Profile updated." })
    setProfilePending(false)
  }

  async function changeEmail(event: FormEvent) {
    event.preventDefault()
    setEmailPending(true)
    setEmailStatus({})
    const result = await patch("/api/account/settings/email", {
      email,
      currentPassword: emailPassword,
    })
    if (!result.ok) {
      setEmailStatus({ error: result.error ?? "Could not change email." })
      setEmailPassword("")
      setEmailPending(false)
      return
    }
    await signOut({ callbackUrl: "/login?next=/account/settings" })
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordPending(true)
    setPasswordStatus({})
    const result = await patch("/api/account/settings/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    })
    if (!result.ok) {
      setPasswordStatus({
        error: result.error ?? "Could not change password.",
      })
      setCurrentPassword("")
      setPasswordPending(false)
      return
    }
    await signOut({ callbackUrl: "/login?next=/account/settings" })
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      <section className="grid gap-5 py-7 sm:grid-cols-[11rem_1fr]">
        <div>
          <h2 className="font-serif text-lg font-medium">Profile</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The name shown in your private account area.
          </p>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label htmlFor="settings-name" className={labelClass}>
              Display name
            </label>
            <Input
              id="settings-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={80}
              autoComplete="name"
              className="h-10"
              disabled={profilePending}
            />
          </div>
          <Status status={profileStatus} />
          <Button type="submit" disabled={profilePending}>
            {profilePending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </section>

      <section className="grid gap-5 py-7 sm:grid-cols-[11rem_1fr]">
        <div>
          <h2 className="font-serif text-lg font-medium">Email</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Changing it signs you out for security.
          </p>
        </div>
        <form onSubmit={changeEmail} className="space-y-4">
          <div>
            <label htmlFor="settings-email" className={labelClass}>
              Email address
            </label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="h-10"
              required
              disabled={emailPending}
            />
          </div>
          <div>
            <label htmlFor="email-current-password" className={labelClass}>
              Current password
            </label>
            <Input
              id="email-current-password"
              type="password"
              value={emailPassword}
              onChange={(event) => setEmailPassword(event.target.value)}
              autoComplete="current-password"
              className="h-10"
              required
              disabled={emailPending}
            />
          </div>
          <Status status={emailStatus} />
          <Button type="submit" disabled={emailPending}>
            {emailPending ? "Changing…" : "Change email"}
          </Button>
        </form>
      </section>

      <section className="grid gap-5 py-7 sm:grid-cols-[11rem_1fr]">
        <div>
          <h2 className="font-serif text-lg font-medium">Password</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Use at least 8 characters. You’ll sign in again afterward.
          </p>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className={labelClass}>
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className="h-10"
              required
              disabled={passwordPending}
            />
          </div>
          <div>
            <label htmlFor="new-password" className={labelClass}>
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="h-10"
              required
              disabled={passwordPending}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className={labelClass}>
              Confirm new password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="h-10"
              required
              disabled={passwordPending}
            />
          </div>
          <Status status={passwordStatus} />
          <Button type="submit" disabled={passwordPending}>
            {passwordPending ? "Changing…" : "Change password"}
          </Button>
        </form>
      </section>
    </div>
  )
}
