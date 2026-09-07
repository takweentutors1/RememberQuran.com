import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import '../models/goal.dart';
import '../models/progress.dart';

class GoalsRepository {
  final FirebaseFirestore _db;
  static const int AYAHS_PER_PAGE = 15;

  GoalsRepository({FirebaseFirestore? db}) : _db = db ?? FirebaseFirestore.instance;

  // ===========================================================================
  // Date Utilities (Local Timezone Aware)
  // ===========================================================================

  DateTime _localDayStart(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  DateTime _shiftLocalDay(DateTime date, int days) {
    return DateTime(date.year, date.month, date.day + days);
  }

  String _localDayKey(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  bool _sameLocalDay(DateTime? a, DateTime b) {
    if (a == null) return false;
    return _localDayStart(a).isAtSameMomentAs(_localDayStart(b));
  }

  /// Start of the goal's current period, containing [day]. Weeks start
  /// Monday to match the ISO week convention used elsewhere in the app.
  DateTime _periodStart(DateTime day, GoalPeriod period) {
    switch (period) {
      case GoalPeriod.daily:
        return day;
      case GoalPeriod.weekly:
        return _shiftLocalDay(day, -(day.weekday - 1));
      case GoalPeriod.monthly:
        return DateTime(day.year, day.month, 1);
    }
  }

  /// Exclusive end of the period starting at [periodStart].
  DateTime _periodEnd(DateTime periodStart, GoalPeriod period) {
    switch (period) {
      case GoalPeriod.daily:
        return _shiftLocalDay(periodStart, 1);
      case GoalPeriod.weekly:
        return _shiftLocalDay(periodStart, 7);
      case GoalPeriod.monthly:
        return DateTime(periodStart.year, periodStart.month + 1, 1);
    }
  }

  DateTime _previousPeriodStart(DateTime periodStart, GoalPeriod period) {
    switch (period) {
      case GoalPeriod.daily:
        return _shiftLocalDay(periodStart, -1);
      case GoalPeriod.weekly:
        return _shiftLocalDay(periodStart, -7);
      case GoalPeriod.monthly:
        return DateTime(periodStart.year, periodStart.month - 1, 1);
    }
  }

  // ===========================================================================
  // Goals Logic
  // ===========================================================================

  Future<void> setActiveGoal(String userId, ActiveGoal goal) async {
    await _db.collection('users').doc(userId).set({
      'activeGoal': goal.toMap(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> clearActiveGoal(String userId) async {
    await _db.collection('users').doc(userId).set({
      'activeGoal': null,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  int _countInGoalUnits(int ayahCount, GoalType type) {
    if (type == GoalType.pages) {
      return (ayahCount / AYAHS_PER_PAGE).floor();
    }
    return ayahCount;
  }

  Future<GoalSnapshot> evaluateGoalAndStreak(String userId) async {
    final userRef = _db.collection('users').doc(userId);
    final now = DateTime.now();
    final today = _localDayStart(now);

    final userSnap = await userRef.get();
    final data = userSnap.data() ?? {};

    ActiveGoal? goal;
    if (data['activeGoal'] != null) {
      goal = ActiveGoal.fromMap(data['activeGoal'] as Map<String, dynamic>);
    }
    final period = goal?.period ?? GoalPeriod.daily;

    final periodStart = _periodStart(today, period);
    final periodEnd = _periodEnd(periodStart, period);
    final previousPeriodStart = _previousPeriodStart(periodStart, period);

    final periodAyahs = await sumAyahsForRange(userId, periodStart, periodEnd);

    final streakData = data['streak'] as Map<String, dynamic>? ?? {};
    int currentStreak = streakData['currentStreak'] as int? ?? 0;
    int longestStreak = streakData['longestStreak'] as int? ?? 0;
    DateTime? lastMetDate = (streakData['lastMetDate'] as Timestamp?)?.toDate();
    if (lastMetDate != null) {
      lastMetDate = _localDayStart(lastMetDate);
    }

    final periodCount = goal != null ? _countInGoalUnits(periodAyahs, goal.type) : 0;
    final metPeriod = goal != null && periodCount >= goal.target;

    bool streakChanged = false;

    // lastMetDate stores the *start* of whichever period it was last hit
    // in (a day, a Monday, or a month's 1st) — comparing it against the
    // current/previous period start below works the same way regardless
    // of the goal's period.
    if (goal != null) {
      if (metPeriod) {
        if (_sameLocalDay(lastMetDate, periodStart)) {
          // already counted this period
        } else if (_sameLocalDay(lastMetDate, previousPeriodStart)) {
          currentStreak += 1;
          lastMetDate = periodStart;
          streakChanged = true;
        } else {
          currentStreak = 1;
          lastMetDate = periodStart;
          streakChanged = true;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          streakChanged = true;
        }
      } else if (lastMetDate != null && lastMetDate.isBefore(previousPeriodStart)) {
        if (currentStreak != 0) streakChanged = true;
        currentStreak = 0;
      }
    } else if (lastMetDate != null && lastMetDate.isBefore(previousPeriodStart)) {
      if (currentStreak != 0) streakChanged = true;
      currentStreak = 0;
    }

    if (streakChanged) {
      await userRef.set({
        'streak': {
          'currentStreak': currentStreak,
          'longestStreak': longestStreak,
          'lastMetDate': lastMetDate != null ? Timestamp.fromDate(lastMetDate) : null,
        },
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    }

    // Last-7-days chart context — only meaningful for daily goals (see
    // GoalSnapshot.week doc), but cheap enough to always compute.
    final priorDays = List.generate(6, (i) => _shiftLocalDay(now, -(6 - i)));
    final dayAyahs = await Future.wait(
      [...priorDays, today].map((day) => sumAyahsForDay(userId, day)),
    );

    final week = dayAyahs.asMap().entries.map((entry) {
      final i = entry.key;
      final ayahs = entry.value;
      final day = i < 6 ? priorDays[i] : today;
      final count = goal != null ? _countInGoalUnits(ayahs, goal.type) : 0;
      return DailyProgress(
        date: day,
        met: goal != null && count >= goal.target,
      );
    }).toList();

    return GoalSnapshot(
      goal: goal,
      periodCount: periodCount,
      metPeriod: metPeriod,
      streak: GoalStreak(
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        lastMetDate: lastMetDate,
      ),
      week: week,
    );
  }

  // ===========================================================================
  // Progress & Range Merging
  // ===========================================================================

  CollectionReference _progressRef(String userId) {
    return _db.collection('users').doc(userId).collection('progressEvents');
  }

  List<AyahRange> _extractRanges(Map<String, dynamic> data) {
    if (data['ranges'] is List) {
      return (data['ranges'] as List).map((r) => AyahRange.fromMap(r as Map<String, dynamic>)).toList();
    }
    // Legacy fallback
    if (data['fromAyah'] is int && data['toAyah'] is int) {
      return [AyahRange(from: data['fromAyah'] as int, to: data['toAyah'] as int)];
    }
    return [];
  }

  List<AyahRange> _mergeRanges(List<AyahRange> ranges) {
    if (ranges.isEmpty) return [];
    
    final sorted = List<AyahRange>.from(ranges)
      ..sort((a, b) => a.from.compareTo(b.from));
      
    final merged = [AyahRange(from: sorted[0].from, to: sorted[0].to)];
    
    for (int i = 1; i < sorted.length; i++) {
      final r = sorted[i];
      final last = merged.last;
      
      if (r.from <= last.to + 1) {
        last.to = max(last.to, r.to);
      } else {
        merged.push(AyahRange(from: r.from, to: r.to));
      }
    }
    
    return merged;
  }

  bool _rangesEqual(List<AyahRange> a, List<AyahRange> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i].from != b[i].from || a[i].to != b[i].to) return false;
    }
    return true;
  }

  int _sumRanges(List<AyahRange> ranges) {
    return ranges.fold(0, (total, r) => total + max(0, r.to - r.from + 1));
  }

  Future<ProgressEventRecord> recordProgressEvent(
    String userId, 
    int surah, 
    int fromAyah, 
    int toAyah
  ) async {
    final now = DateTime.now();
    final date = _localDayStart(now);
    final ref = _progressRef(userId).doc('${surah}_${_localDayKey(now)}');
    final userRef = _db.collection('users').doc(userId);
    final dateTs = Timestamp.fromDate(date);

    return _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final now2 = FieldValue.serverTimestamp();

      if (!snap.exists) {
        final ranges = [AyahRange(from: fromAyah, to: toAyah)];
        tx.set(ref, {
          'surah': surah,
          'ranges': ranges.map((r) => r.toMap()).toList(),
          'date': dateTs,
          'createdAt': now2,
        });
        tx.update(userRef, {
          'viewedSurahs': FieldValue.arrayUnion([surah]),
          'updatedAt': now2,
        });
        return ProgressEventRecord(surah: surah, ranges: ranges, date: date);
      }

      final existing = _extractRanges(snap.data() as Map<String, dynamic>);
      final toMerge = [...existing, AyahRange(from: fromAyah, to: toAyah)];
      final merged = _mergeRanges(toMerge);

      if (!_rangesEqual(merged, existing)) {
        tx.update(ref, {
          'ranges': merged.map((r) => r.toMap()).toList(),
        });
      }

      return ProgressEventRecord(surah: surah, ranges: merged, date: date);
    });
  }

  Future<int> sumAyahsForDay(String userId, DateTime day) async {
    final snap = await _progressRef(userId)
        .where('date', isEqualTo: Timestamp.fromDate(day))
        .get();

    int total = 0;
    for (var doc in snap.docs) {
      total += _sumRanges(_extractRanges(doc.data() as Map<String, dynamic>));
    }
    return total;
  }

  /// Sums ayahs read across [start, endExclusive) — used for weekly/monthly
  /// goal progress, where a single day's total isn't enough.
  Future<int> sumAyahsForRange(String userId, DateTime start, DateTime endExclusive) async {
    final snap = await _progressRef(userId)
        .where('date', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
        .where('date', isLessThan: Timestamp.fromDate(endExclusive))
        .get();

    int total = 0;
    for (var doc in snap.docs) {
      total += _sumRanges(_extractRanges(doc.data() as Map<String, dynamic>));
    }
    return total;
  }
}

extension on List<AyahRange> {
  void push(AyahRange range) {
    add(range);
  }
}
