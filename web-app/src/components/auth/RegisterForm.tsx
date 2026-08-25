"use client"

import { useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateCredentials } from "@/lib/auth/credentials"
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth"
import { safeNextPath } from "@/lib/auth/safe-next"
import { cn } from "@/lib/utils"

const fieldLabel =
  "mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Prefer the intended page; default new accounts to their personal hub
  const next = safeNextPath(searchParams.get("next"), "/account")

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = validateCredentials(email, password)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }

    if (displayName.trim().length > 80) {
      setError("Display name must be at most 80 characters.")
      return
    }

    setPending(true)
    try {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 25_000)

      let res: Response
      try {
        res = await fetch("/api/account/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: parsed.data.email,
            password: parsed.data.password,
            displayName: displayName.trim(),
          }),
          signal: controller.signal,
        })
      } finally {
        window.clearTimeout(timeoutId)
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        // Re-enable the form so the user can correct the input and retry.
        setError(data.error ?? "Could not create your account.")
        setPassword("")
        setPending(false)
        return
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl: next,
      })

      if (!result || result.error) {
        setError("Account created — please sign in.")
        router.push(`/login?next=${encodeURIComponent(next)}`)
        setPending(false)
        return
      }

      // Soft App Router nav — keeps providers mounted; refresh picks up session.
      await navigateAfterAuth(router, next)
    } catch (err) {
      const aborted =
        err instanceof DOMException && err.name === "AbortError"
      setError(
        aborted
          ? "Creating your account is taking too long. Please try again."
          : "Something went wrong. Please try again.",
      )
      setPassword("")
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="register-name" className={fieldLabel}>
          Display name <span className="font-normal">(optional)</span>
        </label>
        <Input
          id="register-name"
          name="displayName"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
      </div>

      <div>
        <label htmlFor="register-email" className={fieldLabel}>
          Email
        </label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
      </div>

      <div>
        <label htmlFor="register-password" className={fieldLabel}>
          Password
        </label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          At least 8 characters.
        </p>
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
        className={cn("h-11 w-full text-sm")}
        disabled={pending}
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}
