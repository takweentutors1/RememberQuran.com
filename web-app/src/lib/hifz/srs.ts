/**
 * SM-2 / Leitner Spaced Repetition System (SRS) for Quran Memorisation (Hifz)
 *
 * Quality ratings:
 * - 0 / "again": Complete blackout / failure to recite. Reset repetitions to 0, review immediately (interval = 1 day).
 * - 1 / "hard": Recited with significant struggle/hesitation or prompts (interval scaled by 1.2).
 * - 2 / "good": Recited smoothly with minor hesitation (standard SM-2 interval).
 * - 3 / "easy": Recited flawlessly from memory with immediate recall (bonus interval multiplier).
 */

export type SRSGrade = "again" | "hard" | "good" | "easy"

export interface SRSState {
  repetitions: number
  intervalDays: number
  easeFactor: number
  nextReviewAt: Date
  lastReviewedAt?: Date
}

export const INITIAL_SRS_STATE: SRSState = {
  repetitions: 0,
  intervalDays: 1,
  easeFactor: 2.5,
  nextReviewAt: new Date(),
}

/**
 * Calculate the next interval and ease factor following an SM-2 spaced repetition review.
 */
export function calculateNextSRS(
  currentState: Partial<SRSState> = {},
  grade: SRSGrade,
  reviewDate: Date = new Date(),
): SRSState {
  let repetitions = currentState.repetitions ?? 0
  let intervalDays = currentState.intervalDays ?? 1
  let easeFactor = currentState.easeFactor ?? 2.5

  if (grade === "again") {
    // Reset to beginning of learning cycle
    repetitions = 0
    intervalDays = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else {
    // Success grades: calculate interval progression
    if (repetitions === 0) {
      intervalDays = grade === "easy" ? 2 : 1
    } else if (repetitions === 1) {
      intervalDays = grade === "easy" ? 6 : grade === "hard" ? 3 : 4
    } else {
      let modifier = 1.0
      if (grade === "hard") {
        modifier = 0.8
        easeFactor = Math.max(1.3, easeFactor - 0.15)
      } else if (grade === "good") {
        modifier = 1.0
      } else if (grade === "easy") {
        modifier = 1.3
        easeFactor = Math.min(3.0, easeFactor + 0.15)
      }
      intervalDays = Math.round(intervalDays * easeFactor * modifier)
    }
    repetitions += 1
  }

  const nextReviewAt = new Date(reviewDate.getTime() + intervalDays * 24 * 60 * 60 * 1000)

  return {
    repetitions,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReviewAt,
    lastReviewedAt: reviewDate,
  }
}
