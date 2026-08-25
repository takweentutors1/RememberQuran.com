"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { safeNextPath } from "@/lib/auth/safe-next"

export function AuthSwitchLink({
  mode,
}: {
  mode: "to-register" | "to-login"
}) {
  const searchParams = useSearchParams()
  const safe = safeNextPath(searchParams.get("next"), "/account")
  const qs = `?next=${encodeURIComponent(safe)}`

  if (mode === "to-register") {
    return (
      <>
        New here?{" "}
        <Link
          href={`/register${qs}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </>
    )
  }

  return (
    <>
      Already have an account?{" "}
      <Link
        href={`/login${qs}`}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Sign in
      </Link>
    </>
  )
}
