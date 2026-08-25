"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateEmail } from "@/lib/auth/credentials"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setDevResetUrl(null)

    const parsed = validateEmail(email)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }

    setPending(true)
    try {
      const res = await fetch("/api/auth/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.email }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        message?: string
        devResetUrl?: string
      }
      if (!res.ok) {
        setError(data.error ?? "Could not send a reset email.")
        return
      }
      setMessage(
        data.message ??
          "If an account exists for that email, a reset link has been sent.",
      )
      setDevResetUrl(data.devResetUrl ?? null)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="reset-email"
          className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"
        >
          Email
        </label>
        <Input
          id="reset-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 bg-background px-3 shadow-sm"
          required
          disabled={pending}
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

      {message && (
        <div
          role="status"
          className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-3 text-sm"
        >
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            {message}
          </p>
          {devResetUrl && (
            <Link
              href={devResetUrl}
              className="mt-3 block font-medium text-primary underline underline-offset-4"
            >
              Open local reset link
            </Link>
          )}
        </div>
      )}

      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  )
}
