import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { recordProgressEvent } from "@/lib/firestore/progress"
import { evaluateGoalAndStreak } from "@/lib/firestore/goals"
import { getAyahCount } from "@/lib/quran/verse-key"

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

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const surah = Number(body.surah)
  let fromAyah = Number(body.fromAyah)
  let toAyah = Number(body.toAyah)

  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return privateJson({ error: "Invalid surah." }, 400)
  }

  const count = getAyahCount(surah)
  if (count === null) return privateJson({ error: "Invalid surah." }, 400)

  if (
    !Number.isInteger(fromAyah) ||
    !Number.isInteger(toAyah) ||
    fromAyah < 1 ||
    toAyah < 1
  ) {
    return privateJson({ error: "Invalid ayah range." }, 400)
  }

  if (fromAyah > toAyah) {
    const tmp = fromAyah
    fromAyah = toAyah
    toAyah = tmp
  }

  if (toAyah > count) {
    return privateJson({ error: "Invalid ayah range." }, 400)
  }

  // Server owns the calendar day — ignore client date (recordProgressEvent
  // computes it internally, matching the old ignore-client-date behaviour).
  const event = await recordProgressEvent(userId, surah, fromAyah, toAyah)
  void evaluateGoalAndStreak(userId).catch(() => {})

  return privateJson({ event })
}
