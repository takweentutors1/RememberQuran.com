/**
 * Client-safe goal constants. Must not import Mongoose.
 */

export const AYAHS_PER_PAGE = 15
export const GOAL_TYPES = ["ayahs", "pages"] as const
export type GoalType = (typeof GOAL_TYPES)[number]

export function isGoalType(value: unknown): value is GoalType {
  return value === "ayahs" || value === "pages"
}

/** Convert raw ayah count into the unit the goal uses. */
export function countInGoalUnits(ayahCount: number, type: GoalType): number {
  if (type === "pages") {
    return Math.floor(ayahCount / AYAHS_PER_PAGE)
  }
  return ayahCount
}

export function validateGoalTarget(
  type: GoalType,
  target: number,
): string | null {
  if (!Number.isInteger(target) || target < 1) {
    return "Target must be a positive whole number."
  }
  const max = type === "pages" ? Math.floor(6236 / AYAHS_PER_PAGE) : 6236
  if (target > max) {
    return `Target can be at most ${max.toLocaleString()}.`
  }
  return null
}
