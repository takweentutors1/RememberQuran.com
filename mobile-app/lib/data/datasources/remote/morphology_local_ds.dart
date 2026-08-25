import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import '../../models/morphology_entry.dart';

/// Loads per-word morphology (root/lemma/POS/grammatical features) from the
/// bundled Quranic Arabic Corpus JSON assets. Despite living alongside the
/// other *_remote_ds.dart files, this one never touches the network — the
/// data is already shipped with the app (assets/data/morphology/v1/,
/// declared in pubspec.yaml), one file per surah keyed "{ayah}:{position}".
class MorphologyLocalDataSource {
  final Map<int, Map<String, MorphologyEntry>> _cache = {};

  Future<Map<String, MorphologyEntry>> _loadSurah(int surahId) async {
    final cached = _cache[surahId];
    if (cached != null) return cached;

    try {
      final raw = await rootBundle.loadString(
        'assets/data/morphology/v1/$surahId.json',
      );
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      final parsed = decoded.map(
        (key, value) => MapEntry(
          key,
          MorphologyEntry.fromJson(value as Map<String, dynamic>),
        ),
      );
      _cache[surahId] = parsed;
      return parsed;
    } catch (_) {
      // Missing/malformed asset for this surah — no morphology data, not a
      // crash. Cache the empty result too so a missing file isn't retried
      // on every word tap.
      _cache[surahId] = const {};
      return const {};
    }
  }

  /// Morphology for a single word, or null if this surah has no bundled
  /// data, or this ayah:position combination isn't covered.
  Future<MorphologyEntry?> getEntry({
    required int surahId,
    required int ayahNumber,
    required int wordPosition,
  }) async {
    final surahData = await _loadSurah(surahId);
    return surahData['$ayahNumber:$wordPosition'];
  }
}
