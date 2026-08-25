"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validatePassword } from "@/lib/auth/credentials"

export function ResetPasswordForm({ oobCode }: { oobCode: string | null }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(
    oobCode ? null : "This reset link is invalid or expired.",
  )
  const [complete, setComplete] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!oobCode) {
      setError("This reset link is invalid or expired.")
      return
    }

    const parsed = validatePassword(password)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }
    if (confirmPassword !== parsed.password) {
      setError("Passwords do not match.")
      return
    }

    setPending(true)
    try {
      const res = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oobCode,
          password: parsed.password,
          confirmPassword,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Could not reset password.")
        return
      }
      setComplete(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (complete) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
        <p className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          Your password has been changed.
        </p>
        <Link
          href="/login?next=/account"
          className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="reset-new-password"
          className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"
        >
          New password
        </label>
        <Input
          id="reset-new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          className="h-11 bg-card/60 px-3"
          required
          disabled={pending || !oobCode}
        />
      </div>
      <div>
        <label
          htmlFor="reset-confirm-password"
          className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"
        >
          Confirm new password
        </label>
        <Input
          id="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          className="h-11 bg-card/60 px-3"
          required
          disabled={pending || !oobCode}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full"
        disabled={pending || !oobCode}
      >
        {pending ? "Changing…" : "Set new password"}
      </Button>
    </form>
  )
}
