/**
 * Client-safe goal constants. Must not import Mongoose.
 */

export const TOTAL_QURAN_AYAHS = 6236
export const TOTAL_QURAN_PAGES = 604
export const AYAHS_PER_PAGE = 15

export const GOAL_TYPES = ["ayahs", "pages", "khatm"] as const
export type GoalType = (typeof GOAL_TYPES)[number]

export interface GoalConfig {
  type: GoalType
  target: number
  targetDate?: string | null
}

export function isGoalType(value: unknown): value is GoalType {
  return value === "ayahs" || value === "pages" || value === "khatm"
}

/** Convert raw ayah count into the unit the goal uses. */
export function countInGoalUnits(ayahCount: number, type: GoalType): number {
  if (type === "pages") {
    return Math.floor(ayahCount / AYAHS_PER_PAGE)
  }
  return ayahCount
}

/** Calculate dynamic daily target for Khatm goal based on target date and total read so far */
export function calculateKhatmDailyTarget(
  targetDateStr: string,
  totalAyahsReadSoFar: number,
  now: Date = new Date(),
): { dailyAyahs: number; daysRemaining: number } {
  const targetDate = new Date(targetDateStr)
  const diffMs = targetDate.getTime() - now.getTime()
  const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  const remainingAyahs = Math.max(0, TOTAL_QURAN_AYAHS - totalAyahsReadSoFar)
  const dailyAyahs = Math.ceil(remainingAyahs / daysRemaining)

  return { dailyAyahs, daysRemaining }
}

export function validateGoalTarget(
  type: GoalType,
  target: number,
  targetDate?: string | null,
): string | null {
  if (type === "khatm") {
    if (!targetDate) return "Target date is required for a Khatm completion goal."
    const date = new Date(targetDate)
    if (isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      return "Target date must be a valid future date."
    }
    return null
  }

  if (!Number.isInteger(target) || target < 1) {
    return "Target must be a positive whole number."
  }
  const max = type === "pages" ? Math.floor(6236 / AYAHS_PER_PAGE) : 6236
  if (target > max) {
    return `Target can be at most ${max.toLocaleString()}.`
  }
  return null
}
