import 'package:flutter_test/flutter_test.dart';
import 'package:rememberquran/features/account/models/hifz_srs.dart';

void main() {
  group('SM-2 Spaced Repetition Logic', () {
    test('calculateNextSRS for brand new ayah with grade again resets repetition', () {
      final baseDate = DateTime(2026, 9, 2);
      final next = calculateNextSRS(
        currentRepetitions: 3,
        currentIntervalDays: 14,
        currentEaseFactor: 2.5,
        grade: SRSGrade.again,
        reviewDate: baseDate,
      );

      expect(next.repetitions, 0);
      expect(next.intervalDays, 1);
      expect(next.easeFactor, 2.3);
      expect(next.nextReviewAt, baseDate.add(const Duration(days: 1)));
    });

    test('calculateNextSRS for first repetition progression', () {
      final baseDate = DateTime(2026, 9, 2);
      
      // Repetition 0 -> grade good -> interval 1, repetitions 1
      final r1 = calculateNextSRS(
        currentRepetitions: 0,
        grade: SRSGrade.good,
        reviewDate: baseDate,
      );
      expect(r1.repetitions, 1);
      expect(r1.intervalDays, 1);

      // Repetition 1 -> grade good -> interval 4, repetitions 2
      final r2 = calculateNextSRS(
        currentRepetitions: r1.repetitions,
        currentIntervalDays: r1.intervalDays,
        currentEaseFactor: r1.easeFactor,
        grade: SRSGrade.good,
        reviewDate: baseDate,
      );
      expect(r2.repetitions, 2);
      expect(r2.intervalDays, 4);

      // Repetition 2 -> grade easy -> modifier 1.3, easeFactor increases
      final r3 = calculateNextSRS(
        currentRepetitions: r2.repetitions,
        currentIntervalDays: r2.intervalDays,
        currentEaseFactor: r2.easeFactor,
        grade: SRSGrade.easy,
        reviewDate: baseDate,
      );
      expect(r3.repetitions, 3);
      expect(r3.easeFactor, 2.65);
      expect(r3.intervalDays, (4 * 2.65 * 1.3).round());
    });
  });
}
