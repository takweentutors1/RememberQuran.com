import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { isGoalType, validateGoalTarget } from "@/lib/goals/constants"
import { setActiveGoal, clearActiveGoal, evaluateGoalAndStreak } from "@/lib/firestore/goals"

export const runtime = "nodejs"

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const snapshot = await evaluateGoalAndStreak(userId)
  return privateJson(snapshot as unknown as Record<string, unknown>)
}

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  if (!isGoalType(body.type)) {
    return privateJson({ error: "Type must be ayahs or pages." }, 400)
  }
  const type = body.type
  const target = Number(body.target)
  const targetError = validateGoalTarget(type, target)
  if (targetError) return privateJson({ error: targetError }, 400)

  await setActiveGoal(userId, { type, target })

  const snapshot = await evaluateGoalAndStreak(userId)
  return privateJson({
    ...(snapshot as unknown as Record<string, unknown>),
    goal: { type, target },
  })
}

export async function DELETE() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  await clearActiveGoal(userId)

  const snapshot = await evaluateGoalAndStreak(userId)
  return privateJson(snapshot as unknown as Record<string, unknown>)
}
