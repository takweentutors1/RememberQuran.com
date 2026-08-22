import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { validateCredentials } from "@/lib/auth/credentials"
import { createUser } from "@/lib/firestore/users"

export const runtime = "nodejs"
export const maxDuration = 30

const MAX_REQUEST_BYTES = 16_384
const DISPLAY_NAME_MAX_LENGTH = 80

interface RegisterBody {
  email?: unknown
  password?: unknown
  displayName?: unknown
}

function json(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: "Request is too large." }, 413)
  }

  let body: RegisterBody
  try {
    body = (await request.json()) as RegisterBody
  } catch {
    return json({ error: "Invalid JSON body." }, 400)
  }

  const parsed = validateCredentials(body.email, body.password)
  if (!parsed.success) {
    return json({ error: parsed.error }, 400)
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : ""

  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return json(
      {
        error: `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`,
      },
      400,
    )
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12)

    // Email reservation, user doc, and default "Favourites" collection are
    // created atomically in one Firestore transaction — see createUser().
    const result = await createUser({
      email: parsed.data.email,
      passwordHash,
      displayName,
    })

    if (!result.ok) {
      return json({ error: "An account with this email already exists." }, 409)
    }

    return json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: displayName || null,
        },
      },
      201,
    )
  } catch (error) {
    console.error("Registration failed", error)
    return json(
      { error: "Could not create your account. Please try again." },
      500,
    )
  }
}
