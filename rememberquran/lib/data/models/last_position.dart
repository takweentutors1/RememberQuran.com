import 'package:cloud_firestore/cloud_firestore.dart';

class LastPosition {
  final String verseKey;
  final int surahId;
  final int ayahId;
  final DateTime updatedAt;

  LastPosition({
    required this.verseKey,
    required this.surahId,
    required this.ayahId,
    required this.updatedAt,
  });

  factory LastPosition.fromMap(Map<String, dynamic> map) {
    return LastPosition(
      verseKey: map['verseKey'] as String? ?? '',
      surahId: map['surahId'] as int? ?? 1,
      ayahId: map['ayahId'] as int? ?? 1,
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'verseKey': verseKey,
      'surahId': surahId,
      'ayahId': ayahId,
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}
