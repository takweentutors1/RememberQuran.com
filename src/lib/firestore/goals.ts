import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getDb } from "./admin"
import { sumAyahsForDay } from "./progress"
import { countInGoalUnits, type GoalType } from "@/lib/goals/constants"
import { utcDayStart } from "@/lib/progress/date"

function addUtcDays(day: Date, days: number): Date {
  const next = new Date(day)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function sameUtcDay(a: Date | null | undefined, b: Date): boolean {
  if (!a) return false
  return utcDayStart(a).getTime() === b.getTime()
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
  /** Last 7 UTC days ending today — met status uses the *current* goal, same as before. */
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
export async function evaluateGoalAndStreak(userId: string): Promise<GoalSnapshot> {
  const db = getDb()
  const userRef = db.collection("users").doc(userId)
  const today = utcDayStart()
  const yesterday = addUtcDays(today, -1)

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
      ? utcDayStart(streakData.lastMetDate.toDate())
      : null

  const todayCount = goal ? countInGoalUnits(todayAyahs, goal.type) : todayAyahs
  const metToday = Boolean(goal && todayCount >= goal.target)

  let streakChanged = false

  if (goal) {
    if (metToday) {
      if (sameUtcDay(lastMetDate, today)) {
        // already counted today
      } else if (sameUtcDay(lastMetDate, yesterday)) {
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

  const priorDays = Array.from({ length: 6 }, (_, i) => addUtcDays(today, -(6 - i)))
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
