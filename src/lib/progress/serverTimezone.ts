import { cookies } from "next/headers"
import { DEFAULT_TIME_ZONE, TIMEZONE_COOKIE, isValidTimeZone } from "./date"

/**
 * Reads the client-set timezone cookie (see components/TimezoneSync),
 * falling back to UTC if it's absent or malformed — e.g. the very first
 * request before the client effect has run, or JS disabled. Works in both
 * Server Components and Route Handlers (both are within the App Router
 * request scope that `cookies()` needs).
 */
export async function getRequestTimeZone(): Promise<string> {
  const store = await cookies()
  const value = store.get(TIMEZONE_COOKIE)?.value
  if (value && isValidTimeZone(value)) return value
  return DEFAULT_TIME_ZONE
}
