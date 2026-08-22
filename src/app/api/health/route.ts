import { NextResponse } from "next/server"
import { getDb } from "@/lib/firestore/admin"

/**
 * Liveness / readiness for account infrastructure.
 * Always dynamic — never cache health across deploys or cold starts.
 */
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function isConfigured(): boolean {
  if (process.env.FIRESTORE_EMULATOR_HOST) return true
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_PRIVATE_KEY?.trim(),
  )
}

export async function GET() {
  const started = Date.now()

  if (!isConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        service: "rememberquran",
        database: {
          configured: false,
          connected: false,
          error: "Firebase credentials are not set (see .env.example)",
        },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }

  try {
    // Cheap round-trip: a read for a doc that need not exist still proves
    // the socket/credentials work, same as Mongo's admin().ping() did.
    await getDb().doc("_health/ping").get()

    return NextResponse.json(
      {
        ok: true,
        service: "rememberquran",
        database: { configured: true, connected: true },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error"

    return NextResponse.json(
      {
        ok: false,
        service: "rememberquran",
        database: { configured: true, connected: false, error: message },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }
}
