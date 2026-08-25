import { auth } from "@/auth"

/**
 * Session guard for account APIs. Returns the authenticated user id or null —
 * callers respond 401 themselves so each route controls its error shape.
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
