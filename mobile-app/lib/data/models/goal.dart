import 'package:cloud_firestore/cloud_firestore.dart';

enum GoalType { ayahs, pages }

enum GoalPeriod { daily, weekly, monthly }

class ActiveGoal {
  final GoalType type;
  final int target;
  final GoalPeriod period;

  ActiveGoal({
    required this.type,
    required this.target,
    this.period = GoalPeriod.daily,
  });

  factory ActiveGoal.fromMap(Map<String, dynamic> map) {
    return ActiveGoal(
      type: map['type'] == 'pages' ? GoalType.pages : GoalType.ayahs,
      target: map['target'] as int? ?? 1,
      period: switch (map['period']) {
        'weekly' => GoalPeriod.weekly,
        'monthly' => GoalPeriod.monthly,
        _ => GoalPeriod.daily, // covers missing 'period' on goals set before this existed
      },
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type == GoalType.pages ? 'pages' : 'ayahs',
      'target': target,
      'period': switch (period) {
        GoalPeriod.weekly => 'weekly',
        GoalPeriod.monthly => 'monthly',
        GoalPeriod.daily => 'daily',
      },
    };
  }
}

class GoalStreak {
  final int currentStreak;
  final int longestStreak;
  final DateTime? lastMetDate;

  GoalStreak({
    required this.currentStreak,
    required this.longestStreak,
    this.lastMetDate,
  });

  factory GoalStreak.fromMap(Map<String, dynamic> map) {
    return GoalStreak(
      currentStreak: map['currentStreak'] as int? ?? 0,
      longestStreak: map['longestStreak'] as int? ?? 0,
      lastMetDate: (map['lastMetDate'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'lastMetDate': lastMetDate != null ? Timestamp.fromDate(lastMetDate!) : null,
    };
  }
}

class GoalSnapshot {
  final ActiveGoal? goal;

  /// Progress accumulated (in the goal's unit) within the current period —
  /// today for a daily goal, this calendar week (Mon-start) for weekly,
  /// this calendar month for monthly.
  final int periodCount;
  final bool metPeriod;
  final GoalStreak streak;

  /// Raw daily activity for the last 7 calendar days — used for the
  /// "Last 7 Days" chart, which is only shown for daily goals since a
  /// single day's reading isn't a meaningful checkpoint against a
  /// weekly/monthly target.
  final List<DailyProgress> week;

  GoalSnapshot({
    required this.goal,
    required this.periodCount,
    required this.metPeriod,
    required this.streak,
    required this.week,
  });
}

class DailyProgress {
  final DateTime date;
  final bool met;

  DailyProgress({required this.date, required this.met});
}
