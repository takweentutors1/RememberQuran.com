import 'package:cloud_firestore/cloud_firestore.dart';
import '../../features/account/models/hifz_srs.dart';

class JuzRange {
  final int juz;
  final int startSurah;
  final int startAyah;
  final int endSurah;
  final int endAyah;

  const JuzRange({
    required this.juz,
    required this.startSurah,
    required this.startAyah,
    required this.endSurah,
    required this.endAyah,
  });
}

class MemorisedAyahRecord {
  final String verseKey;
  final int surahId;
  final int ayahId;
  final DateTime memorisedAt;
  final int repetitions;
  final int intervalDays;
  final double easeFactor;
  final DateTime? nextReviewAt;
  final DateTime? lastReviewedAt;

  MemorisedAyahRecord({
    required this.verseKey,
    required this.surahId,
    required this.ayahId,
    required this.memorisedAt,
    this.repetitions = 0,
    this.intervalDays = 1,
    this.easeFactor = 2.5,
    this.nextReviewAt,
    this.lastReviewedAt,
  });

  factory MemorisedAyahRecord.fromSnapshot(DocumentSnapshot snap) {
    final data = snap.data() as Map<String, dynamic>;
    return MemorisedAyahRecord(
      verseKey: snap.id,
      surahId: data['surahId'] as int,
      ayahId: data['ayahId'] as int,
      memorisedAt: (data['memorisedAt'] as Timestamp?)?.toDate() ?? DateTime(1970),
      repetitions: (data['repetitions'] as num?)?.toInt() ?? 0,
      intervalDays: (data['intervalDays'] as num?)?.toInt() ?? 1,
      easeFactor: (data['easeFactor'] as num?)?.toDouble() ?? 2.5,
      nextReviewAt: (data['nextReviewAt'] as Timestamp?)?.toDate(),
      lastReviewedAt: (data['lastReviewedAt'] as Timestamp?)?.toDate(),
    );
  }
}

class MarkMemorisedResult {
  final bool ok;
  final bool created;
  final MemorisedAyahRecord? ayah;
  final String? error;

  MarkMemorisedResult({required this.ok, required this.created, this.ayah, this.error});
}

class HifzRepository {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  static const int MAX_MEMORISED = 6236;

  static const List<int> surahAyahCounts = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
    111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
    54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
    49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
    44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
    26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
    6, 3, 5, 4, 5, 6
  ];

  static const List<JuzRange> juzRanges = [
    JuzRange(juz: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141),
    JuzRange(juz: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252),
    JuzRange(juz: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92),
    JuzRange(juz: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23),
    JuzRange(juz: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147),
    JuzRange(juz: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81),
    JuzRange(juz: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110),
    JuzRange(juz: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87),
    JuzRange(juz: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40),
    JuzRange(juz: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92),
    JuzRange(juz: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5),
    JuzRange(juz: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52),
    JuzRange(juz: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52),
    JuzRange(juz: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128),
    JuzRange(juz: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74),
    JuzRange(juz: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135),
    JuzRange(juz: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78),
    JuzRange(juz: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20),
    JuzRange(juz: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55),
    JuzRange(juz: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45),
    JuzRange(juz: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30),
    JuzRange(juz: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27),
    JuzRange(juz: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31),
    JuzRange(juz: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46),
    JuzRange(juz: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37),
    JuzRange(juz: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30),
    JuzRange(juz: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29),
    JuzRange(juz: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12),
    JuzRange(juz: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50),
    JuzRange(juz: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6),
  ];

  static int getAyahCount(int surahId) {
    if (surahId < 1 || surahId > 114) return 0;
    return surahAyahCounts[surahId - 1];
  }

  static int countAyahsInRange(int startSurah, int startAyah, int endSurah, int endAyah) {
    int total = 0;
    for (int s = startSurah; s <= endSurah; s++) {
      final count = getAyahCount(s);
      if (count == 0) continue;
      final from = s == startSurah ? startAyah : 1;
      final to = s == endSurah ? endAyah : count;
      if (to >= from) total += to - from + 1;
    }
    return total;
  }

  static JuzRange? getJuzRange(int juz) {
    if (juz < 1 || juz > 30) return null;
    return juzRanges[juz - 1];
  }

  static int getJuzAyahCount(int juz) {
    final range = getJuzRange(juz);
    if (range == null) return 0;
    return countAyahsInRange(range.startSurah, range.startAyah, range.endSurah, range.endAyah);
  }

  static int? getJuzForVerse(int surahId, int ayahId) {
    if (getAyahCount(surahId) == 0 || ayahId < 1) return null;
    final order = surahId * 1000 + ayahId;
    for (final range in juzRanges) {
      final start = range.startSurah * 1000 + range.startAyah;
      final end = range.endSurah * 1000 + range.endAyah;
      if (order >= start && order <= end) return range.juz;
    }
    return null;
  }

  CollectionReference _hifzRef(String userId) {
    return _db.collection('users').doc(userId).collection('memorisedAyahs');
  }

  Future<int> countMemorisedAyahs(String userId) async {
    final snap = await _hifzRef(userId).count().get();
    return snap.count ?? 0;
  }

  Future<List<MemorisedAyahRecord>> listMemorisedAyahs(String userId, {int? surahId}) async {
    Query query = _hifzRef(userId);
    if (surahId != null) {
      query = query.where('surahId', isEqualTo: surahId);
    }
    final snap = await query
        .orderBy('surahId', descending: false)
        .orderBy('ayahId', descending: false)
        .limit(MAX_MEMORISED)
        .get();
    return snap.docs.map((doc) => MemorisedAyahRecord.fromSnapshot(doc)).toList();
  }

  Future<MarkMemorisedResult> markMemorised(String userId, String verseKey, int surahId, int ayahId) async {
    final ref = _hifzRef(userId).doc(verseKey);

    // Best-effort pre-check — a count() aggregate can't be read inside a
    // Firestore transaction (only individual documents can), so this only
    // guards the common case, not a simultaneous race marking two ayahs.
    final countSnap = await _hifzRef(userId).count().get();
    final atLimit = (countSnap.count ?? 0) >= MAX_MEMORISED;

    try {
      final outcome = await _db.runTransaction((tx) async {
        final existing = await tx.get(ref);
        if (existing.exists) return {'ok': true, 'created': false};

        if (atLimit) {
          return {'ok': false, 'error': 'limit-reached'};
        }

        tx.set(ref, {
          'surahId': surahId,
          'ayahId': ayahId,
          'memorisedAt': FieldValue.serverTimestamp(),
        });
        return {'ok': true, 'created': true};
      });

      if (outcome['ok'] == false) {
        return MarkMemorisedResult(ok: false, created: false, error: outcome['error'] as String?);
      }

      final snap = await ref.get();
      return MarkMemorisedResult(
        ok: true,
        created: outcome['created'] as bool,
        ayah: MemorisedAyahRecord.fromSnapshot(snap),
      );
    } catch (e) {
      return MarkMemorisedResult(ok: false, created: false, error: e.toString());
    }
  }

  Future<List<MarkMemorisedResult>> markMemorisedBatch(
    String userId,
    List<({String verseKey, int surahId, int ayahId})> ayahs,
  ) async {
    if (ayahs.isEmpty) return [];

    if (ayahs.length > 500) {
      final results = <MarkMemorisedResult>[];
      for (final a in ayahs) {
        final res = await markMemorised(userId, a.verseKey, a.surahId, a.ayahId);
        results.add(res);
      }
      return results;
    }

    final countSnap = await _hifzRef(userId).count().get();
    final currentCount = countSnap.count ?? 0;
    if (currentCount + ayahs.length > MAX_MEMORISED) {
      return [
        MarkMemorisedResult(ok: false, created: false, error: 'limit-reached'),
      ];
    }

    try {
      final batch = _db.batch();
      for (final a in ayahs) {
        final ref = _hifzRef(userId).doc(a.verseKey);
        batch.set(ref, {
          'surahId': a.surahId,
          'ayahId': a.ayahId,
          'memorisedAt': FieldValue.serverTimestamp(),
        }, SetOptions(merge: true));
      }
      await batch.commit();

      return ayahs.map((a) => MarkMemorisedResult(ok: true, created: true)).toList();
    } catch (e) {
      return [
        MarkMemorisedResult(ok: false, created: false, error: e.toString()),
      ];
    }
  }

  Future<bool> unmarkMemorised(String userId, String verseKey) async {
    final ref = _hifzRef(userId).doc(verseKey);
    final snap = await ref.get();
    if (!snap.exists) return false;
    await ref.delete();
    return true;
  }

  /// Fetches ayahs that are due for review (where nextReviewAt is null or in the past).
  Future<List<MemorisedAyahRecord>> getDueReviews(String userId) async {
    final all = await listMemorisedAyahs(userId);
    final now = DateTime.now();
    return all.where((item) {
      if (item.nextReviewAt == null) return true;
      return item.nextReviewAt!.isBefore(now) ||
          item.nextReviewAt!.isAtSameMomentAs(now);
    }).toList();
  }

  /// Submits an SRS review grade for an ayah and updates its intervals in Firestore.
  Future<void> submitReview(
    String userId,
    String verseKey,
    SRSGrade grade,
  ) async {
    final ref = _hifzRef(userId).doc(verseKey);
    final snap = await ref.get();
    if (!snap.exists) return;

    final record = MemorisedAyahRecord.fromSnapshot(snap);
    final nextState = calculateNextSRS(
      currentRepetitions: record.repetitions,
      currentIntervalDays: record.intervalDays,
      currentEaseFactor: record.easeFactor,
      grade: grade,
      reviewDate: DateTime.now(),
    );

    await ref.update({
      'repetitions': nextState.repetitions,
      'intervalDays': nextState.intervalDays,
      'easeFactor': nextState.easeFactor,
      'nextReviewAt': Timestamp.fromDate(nextState.nextReviewAt),
      'lastReviewedAt': Timestamp.fromDate(nextState.lastReviewedAt!),
    });
  }
}
