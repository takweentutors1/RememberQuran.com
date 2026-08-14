import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"
import { sumAyahsForDay } from "./progress"
import { countInGoalUnits, type GoalType } from "@/lib/goals/constants"
import { localDayStart, shiftLocalDay } from "@/lib/progress/date"

// Reduces `a` to its local-day-start under the *current* timeZone before
// comparing — the only sane behaviour if a user's timezone ever changes
// (e.g. travel), and also means a `lastMetDate` written under the old
// UTC-only scheme gets reinterpreted once under the new one. That one-time
// reinterpretation can shift a legacy streak's day boundary by at most one
// day on the first evaluation after this fix ships; it self-corrects from
// then on since every subsequent write uses the same tz consistently.
function sameLocalDay(timeZone: string, a: Date | null | undefined, b: Date): boolean {
  if (!a) return false
  return localDayStart(timeZone, a).getTime() === b.getTime()
}

export interface GoalSnapshot {
  goal: { type: GoalType; target: number } | null
  todayAyahs: number
  todayCount: number
  metToday: boolean
  streak: {
    currentStreak: number
    longestStreak: number
    lastMetDate: string | null
  }
  /** Last 7 local days ending today — met status uses the *current* goal, same as before. */
  week: Array<{ date: string; met: boolean }>
}

export async function setActiveGoal(
  userId: string,
  goal: { type: GoalType; target: number },
): Promise<void> {
  await getDb().collection("users").doc(userId).update({
    activeGoal: goal,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function clearActiveGoal(userId: string): Promise<void> {
  await getDb().collection("users").doc(userId).update({
    activeGoal: null,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

/**
 * Recompute streak against the active goal using today's progress events.
 * Safe to call often (idempotent for same day). Goal + streak are both just
 * fields on the user doc now — no separate collections, no upsert dance.
 */
export async function evaluateGoalAndStreak(
  userId: string,
  timeZone: string,
): Promise<GoalSnapshot> {
  const db = getDb()
  const userRef = db.collection("users").doc(userId)
  const now = new Date()
  const today = localDayStart(timeZone, now)
  const yesterday = shiftLocalDay(timeZone, now, -1)

  const [userSnap, todayAyahs] = await Promise.all([
    userRef.get(),
    sumAyahsForDay(userId, today),
  ])
  const data = userSnap.data() ?? {}
  const goal = (data.activeGoal ?? null) as { type: GoalType; target: number } | null
  const streakData = data.streak ?? {}

  let currentStreak: number = streakData.currentStreak ?? 0
  let longestStreak: number = streakData.longestStreak ?? 0
  let lastMetDate: Date | null =
    streakData.lastMetDate instanceof Timestamp
      ? localDayStart(timeZone, streakData.lastMetDate.toDate())
      : null

  const todayCount = goal ? countInGoalUnits(todayAyahs, goal.type) : todayAyahs
  const metToday = Boolean(goal && todayCount >= goal.target)

  let streakChanged = false

  if (goal) {
    if (metToday) {
      if (sameLocalDay(timeZone, lastMetDate, today)) {
        // already counted today
      } else if (sameLocalDay(timeZone, lastMetDate, yesterday)) {
        currentStreak += 1
        lastMetDate = today
        streakChanged = true
      } else {
        currentStreak = 1
        lastMetDate = today
        streakChanged = true
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
        streakChanged = true
      }
    } else if (lastMetDate && lastMetDate.getTime() < yesterday.getTime()) {
      if (currentStreak !== 0) streakChanged = true
      currentStreak = 0
    }
  } else if (lastMetDate && lastMetDate.getTime() < yesterday.getTime()) {
    if (currentStreak !== 0) streakChanged = true
    currentStreak = 0
  }

  if (streakChanged) {
    await userRef.update({
      streak: {
        currentStreak,
        longestStreak,
        lastMetDate: lastMetDate ? Timestamp.fromDate(lastMetDate) : null,
      },
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  const priorDays = Array.from({ length: 6 }, (_, i) => shiftLocalDay(timeZone, now, -(6 - i)))
  const priorAyahs = await Promise.all(priorDays.map((day) => sumAyahsForDay(userId, day)))
  const weekAyahs = [...priorAyahs, todayAyahs]
  const week = weekAyahs.map((ayahs, i) => {
    const day = i < 6 ? priorDays[i]! : today
    const count = goal ? countInGoalUnits(ayahs, goal.type) : 0
    return { date: day.toISOString(), met: Boolean(goal && count >= goal.target) }
  })

  return {
    goal,
    todayAyahs,
    todayCount: goal ? todayCount : 0,
    metToday,
    streak: {
      currentStreak,
      longestStreak,
      lastMetDate: lastMetDate ? lastMetDate.toISOString() : null,
    },
    week,
  }
}
