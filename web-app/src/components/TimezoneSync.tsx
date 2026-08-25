"use client"

import { useEffect } from "react"
import { TIMEZONE_COOKIE } from "@/lib/progress/date"

const TIMEZONE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Keeps a client-set timezone cookie in sync so server components/routes can
 * compute "today" using the user's local calendar day instead of UTC for
 * goals/streaks/reading-progress — see src/lib/progress/date.ts and
 * getRequestTimeZone. Renders nothing; first page load before this effect
 * runs falls back to UTC server-side.
 */
export function TimezoneSync() {
  useEffect(() => {
    let timeZone: string
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return
    }
    if (!timeZone || readCookie(TIMEZONE_COOKIE) === timeZone) return
    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=${TIMEZONE_COOKIE_MAX_AGE}; samesite=lax`
  }, [])

  return null
}
