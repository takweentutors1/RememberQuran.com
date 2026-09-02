import 'dart:math' as math;

/// Quality ratings for Spaced Repetition reviews:
/// - again: Complete failure to recall. Reset repetitions to 0, review immediately (interval = 1 day).
/// - hard: Recited with significant struggle or hesitation (interval scaled by 0.8 / 1.2).
/// - good: Recited smoothly with minor hesitation (standard SM-2 interval).
/// - easy: Recited flawlessly from memory with immediate recall (bonus interval multiplier).
enum SRSGrade {
  again,
  hard,
  good,
  easy,
}

class SRSState {
  final int repetitions;
  final int intervalDays;
  final double easeFactor;
  final DateTime nextReviewAt;
  final DateTime? lastReviewedAt;

  const SRSState({
    required this.repetitions,
    required this.intervalDays,
    required this.easeFactor,
    required this.nextReviewAt,
    this.lastReviewedAt,
  });

  static SRSState initial() {
    return SRSState(
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewAt: DateTime.now(),
    );
  }
}

/// Calculate the next interval and ease factor following an SM-2 spaced repetition review.
/// Direct port of web app's `src/lib/hifz/srs.ts`.
SRSState calculateNextSRS({
  int? currentRepetitions,
  int? currentIntervalDays,
  double? currentEaseFactor,
  required SRSGrade grade,
  DateTime? reviewDate,
}) {
  final now = reviewDate ?? DateTime.now();
  int repetitions = currentRepetitions ?? 0;
  int intervalDays = currentIntervalDays ?? 1;
  double easeFactor = currentEaseFactor ?? 2.5;

  if (grade == SRSGrade.again) {
    repetitions = 0;
    intervalDays = 1;
    easeFactor = math.max(1.3, easeFactor - 0.2);
  } else {
    if (repetitions == 0) {
      intervalDays = grade == SRSGrade.easy ? 2 : 1;
    } else if (repetitions == 1) {
      intervalDays = grade == SRSGrade.easy
          ? 6
          : grade == SRSGrade.hard
              ? 3
              : 4;
    } else {
      double modifier = 1.0;
      if (grade == SRSGrade.hard) {
        modifier = 0.8;
        easeFactor = math.max(1.3, easeFactor - 0.15);
      } else if (grade == SRSGrade.good) {
        modifier = 1.0;
      } else if (grade == SRSGrade.easy) {
        modifier = 1.3;
        easeFactor = math.min(3.0, easeFactor + 0.15);
      }
      intervalDays = (intervalDays * easeFactor * modifier).round();
    }
    repetitions += 1;
  }

  final nextReviewAt = now.add(Duration(days: intervalDays));

  return SRSState(
    repetitions: repetitions,
    intervalDays: intervalDays,
    easeFactor: (easeFactor * 100).round() / 100.0,
    nextReviewAt: nextReviewAt,
    lastReviewedAt: now,
  );
}
