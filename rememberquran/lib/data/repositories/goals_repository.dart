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
    final yesterday = _shiftLocalDay(now, -1);

    final futures = await Future.wait([
      userRef.get(),
      sumAyahsForDay(userId, today),
    ]);

    final userSnap = futures[0] as DocumentSnapshot;
    final todayAyahs = futures[1] as int;

    final data = userSnap.data() as Map<String, dynamic>? ?? {};
    
    ActiveGoal? goal;
    if (data['activeGoal'] != null) {
      goal = ActiveGoal.fromMap(data['activeGoal'] as Map<String, dynamic>);
    }

    final streakData = data['streak'] as Map<String, dynamic>? ?? {};
    int currentStreak = streakData['currentStreak'] as int? ?? 0;
    int longestStreak = streakData['longestStreak'] as int? ?? 0;
    DateTime? lastMetDate = (streakData['lastMetDate'] as Timestamp?)?.toDate();
    if (lastMetDate != null) {
      lastMetDate = _localDayStart(lastMetDate);
    }

    final todayCount = goal != null ? _countInGoalUnits(todayAyahs, goal.type) : todayAyahs;
    final metToday = goal != null && todayCount >= goal.target;

    bool streakChanged = false;

    if (goal != null) {
      if (metToday) {
        if (_sameLocalDay(lastMetDate, today)) {
          // already counted today
        } else if (_sameLocalDay(lastMetDate, yesterday)) {
          currentStreak += 1;
          lastMetDate = today;
          streakChanged = true;
        } else {
          currentStreak = 1;
          lastMetDate = today;
          streakChanged = true;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          streakChanged = true;
        }
      } else if (lastMetDate != null && lastMetDate.isBefore(yesterday)) {
        if (currentStreak != 0) streakChanged = true;
        currentStreak = 0;
      }
    } else if (lastMetDate != null && lastMetDate.isBefore(yesterday)) {
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

    final priorDays = List.generate(6, (i) => _shiftLocalDay(now, -(6 - i)));
    final priorAyahs = await Future.wait(priorDays.map((day) => sumAyahsForDay(userId, day)));
    
    final weekAyahs = [...priorAyahs, todayAyahs];
    final week = weekAyahs.asMap().entries.map((entry) {
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
      todayAyahs: todayAyahs,
      todayCount: goal != null ? todayCount : 0,
      metToday: metToday,
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
}

extension on List<AyahRange> {
  void push(AyahRange range) {
    add(range);
  }
}
