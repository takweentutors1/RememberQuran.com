import 'package:cloud_firestore/cloud_firestore.dart';

enum GoalType { ayahs, pages }

class ActiveGoal {
  final GoalType type;
  final int target;

  ActiveGoal({required this.type, required this.target});

  factory ActiveGoal.fromMap(Map<String, dynamic> map) {
    return ActiveGoal(
      type: map['type'] == 'pages' ? GoalType.pages : GoalType.ayahs,
      target: map['target'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type == GoalType.pages ? 'pages' : 'ayahs',
      'target': target,
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
  final int todayAyahs;
  final int todayCount;
  final bool metToday;
  final GoalStreak streak;
  final List<DailyProgress> week;

  GoalSnapshot({
    required this.goal,
    required this.todayAyahs,
    required this.todayCount,
    required this.metToday,
    required this.streak,
    required this.week,
  });
}

class DailyProgress {
  final DateTime date;
  final bool met;

  DailyProgress({required this.date, required this.met});
}
