import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firestore/admin"

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the window resets — only meaningful when `allowed` is false. */
  retryAfterSeconds: number
}

/**
 * Fixed-window rate limiter backed by Firestore — no separate Redis/KV
 * needed, and correct across Vercel's distributed serverless instances
 * (unlike an in-memory counter, which wouldn't be shared across them).
 * One doc per key, reset via a transaction so concurrent requests in the
 * same window can't race past the limit.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const db = getDb()
  const ref = db.collection("rateLimits").doc(key)
  const now = Date.now()

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const data = snap.data()
    const windowStartMs =
      data?.windowStart instanceof Timestamp ? data.windowStart.toMillis() : 0
    const count = typeof data?.count === "number" ? data.count : 0
    const windowExpired = now - windowStartMs >= windowMs

    if (windowExpired) {
      tx.set(ref, {
        windowStart: Timestamp.fromMillis(now),
        count: 1,
        // TTL-eligible field, so old windows get garbage-collected instead
        // of leaving one doc per IP/key sitting around forever.
        expiresAt: Timestamp.fromMillis(now + windowMs),
      })
      return { allowed: true, retryAfterSeconds: 0 }
    }

    if (count >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((windowStartMs + windowMs - now) / 1000),
      }
    }

    tx.update(ref, { count: FieldValue.increment(1) })
    return { allowed: true, retryAfterSeconds: 0 }
  })
}

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip") ?? "unknown"
}
