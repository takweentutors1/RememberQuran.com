import 'dart:async';
import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import '../datasources/local/quran_db.dart';
import '../datasources/remote/quran_remote_ds.dart';
import '../../core/models/translation.dart';

class QuranRepository {
  final QuranDatabase localDb;
  final QuranRemoteDataSource remoteDs;

  QuranRepository({required this.localDb, required this.remoteDs});

  /// Seeds the full offline Quran text database on first launch, if it hasn't been already.
  Future<void> seedIfEmpty() async {
    final hasData = await (localDb.select(localDb.chapters)..limit(1)).getSingleOrNull();
    if (hasData == null) {
      await localDb.seedFromFirstSync(remoteDs);
    }
  }

  /// Get all chapters. Cache-first: serves the cache instantly and refreshes
  /// it in the background. If nothing is cached yet, the caller is blocked
  /// on a real fetch and any failure is rethrown so the UI can show an error
  /// instead of a silently empty list.
  Future<List<Chapter>> getChapters() async {
    final cached = await localDb.select(localDb.chapters).get();

    if (cached.isNotEmpty) {
      unawaited(_refreshChapters(silent: true));
      return cached;
    }

    await _refreshChapters(silent: false);
    return await localDb.select(localDb.chapters).get();
  }

  Future<void> _refreshChapters({required bool silent}) async {
    try {
      final remoteList = await remoteDs.getChapters();
      await localDb.transaction(() async {
        for (final c in remoteList) {
          final map = Map<String, dynamic>.from(c);
          await localDb.into(localDb.chapters).insert(ChaptersCompanion.insert(
            id: Value(map['id'] as int),
            revelationPlace: map['revelation_place'] as String,
            revelationOrder: map['revelation_order'] as int,
            bismillahPre: (map['bismillah_pre'] ?? false) as bool,
            nameSimple: map['name_simple'] as String,
            nameComplex: map['name_complex'] as String,
            nameArabic: map['name_arabic'] as String,
            versesCount: map['verses_count'] as int,
            pages: jsonEncode(map['pages']),
            translatedName: jsonEncode(map['translated_name']),
          ), mode: InsertMode.insertOrReplace);
        }
      });
    } catch (e, st) {
      if (!silent) rethrow;
      // Background refresh failed; the cached copy is still shown, but log
      // it so silent data staleness is still visible in Crashlytics.
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
    }
  }

  /// Get a single chapter's metadata. Cache-first with the same must-succeed
  /// fallback as [getChapters] — previously this only ever read the local
  /// cache, so a chapter opened before it was seeded would return null
  /// forever and the reader would be stuck showing "Loading…".
  Future<Chapter?> getChapter(int chapterId) async {
    final cached = await (localDb.select(localDb.chapters)
      ..where((c) => c.id.equals(chapterId))
    ).getSingleOrNull();

    if (cached != null) {
      unawaited(_refreshChapter(chapterId, silent: true));
      return cached;
    }

    await _refreshChapter(chapterId, silent: false);
    return await (localDb.select(localDb.chapters)
      ..where((c) => c.id.equals(chapterId))
    ).getSingleOrNull();
  }

  Future<void> _refreshChapter(int chapterId, {required bool silent}) async {
    try {
      final c = await remoteDs.getChapter(chapterId);
      await localDb.into(localDb.chapters).insert(ChaptersCompanion.insert(
        id: Value(c['id'] as int),
        revelationPlace: c['revelation_place'] as String,
        revelationOrder: c['revelation_order'] as int,
        bismillahPre: (c['bismillah_pre'] ?? false) as bool,
        nameSimple: c['name_simple'] as String,
        nameComplex: c['name_complex'] as String,
        nameArabic: c['name_arabic'] as String,
        versesCount: c['verses_count'] as int,
        pages: jsonEncode(c['pages']),
        translatedName: jsonEncode(c['translated_name']),
      ), mode: InsertMode.insertOrReplace);
    } catch (e, st) {
      if (!silent) rethrow;
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
    }
  }

  /// Get all verses for a chapter. Cache-first strategy.
  Future<List<Verse>> getVerses(int chapterId) async {
    final cached = await (localDb.select(localDb.verses)
      ..where((v) => v.chapterId.equals(chapterId))
      ..orderBy([(v) => OrderingTerm(expression: v.verseNumber)])
    ).get();

    if (cached.isNotEmpty) {
      unawaited(_refreshVerses(chapterId, silent: true));
      return cached;
    }

    await _refreshVerses(chapterId, silent: false);
    return await (localDb.select(localDb.verses)
      ..where((v) => v.chapterId.equals(chapterId))
      ..orderBy([(v) => OrderingTerm(expression: v.verseNumber)])
    ).get();
  }

  /// Get a single verse from local DB without triggering network refresh.
  Future<Verse?> getVerse(int chapterId, int verseNumber) async {
    return await (localDb.select(localDb.verses)
      ..where((v) => v.chapterId.equals(chapterId) & v.verseNumber.equals(verseNumber))
    ).getSingleOrNull();
  }

  Future<void> _refreshVerses(int chapterId, {required bool silent}) async {
    try {
      int page = 1;
      int totalPages = 1;

      do {
        final versesPage = await remoteDs.getVersesPage(chapterId, page: page, translations: bundleTranslationIds);
        totalPages = versesPage['pagination']['total_pages'];
        final versesList = versesPage['verses'] as List<dynamic>;

        // Only wrap inserts in transaction
        await localDb.transaction(() async {
          for (final verse in versesList) {
            final v = Map<String, dynamic>.from(verse);
            await localDb.into(localDb.verses).insert(VersesCompanion.insert(
              id: Value(v['id'] as int),
              chapterId: chapterId,
              verseNumber: v['verse_number'] as int,
              verseKey: v['verse_key'] as String,
              pageNumber: v['page_number'] as int,
              juzNumber: v['juz_number'] as int,
              hizbNumber: v['hizb_number'] as int,
              textUthmani: (v['text_uthmani'] ?? '') as String,
              qpcUthmaniHafs: Value(v['qpc_uthmani_hafs'] as String?),
            ), mode: InsertMode.insertOrReplace);

            if (v['words'] != null) {
              final wordsList = v['words'] as List<dynamic>;
              for (final word in wordsList) {
                final w = Map<String, dynamic>.from(word);
                await localDb.into(localDb.words).insert(WordsCompanion.insert(
                  id: Value(w['id'] as int),
                  verseId: v['id'] as int,
                  position: w['position'] as int,
                  audioUrl: Value(w['audio_url'] as String?),
                  charTypeName: (w['char_type_name'] ?? '') as String,
                  textUthmani: (w['text_uthmani'] ?? '') as String,
                  qpcUthmaniHafs: Value(w['qpc_uthmani_hafs'] as String?),
                  textUthmaniTajweed: Value(w['text_uthmani_tajweed'] as String?),
                  translation: jsonEncode(w['translation']),
                  transliteration: Value(w['transliteration'] != null ? jsonEncode(w['transliteration']) : null),
                ), mode: InsertMode.insertOrReplace);
              }
            }

            if (v['translations'] != null) {
              final translationsList = v['translations'] as List<dynamic>;

              // Clear old translations for this verse to avoid duplicates since PK is auto-increment
              await (localDb.delete(localDb.verseTranslations)..where((t) => t.verseId.equals(v['id'] as int))).go();

              for (final trans in translationsList) {
                final t = Map<String, dynamic>.from(trans);
                await localDb.into(localDb.verseTranslations).insert(VerseTranslationsCompanion.insert(
                  verseId: v['id'] as int,
                  resourceId: t['resource_id'] as int,
                  translationText: t['text'] as String,
                ));
              }
            }
          }
        });
        page++;
      } while (page <= totalPages);
    } catch (e, st) {
      if (!silent) rethrow;
      // Background refresh failed; whatever is already cached keeps showing.
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
    }
  }

  /// Get verse words
  Future<List<Word>> getVerseWords(int verseId) async {
    return await (localDb.select(localDb.words)
      ..where((w) => w.verseId.equals(verseId))
      ..orderBy([(w) => OrderingTerm(expression: w.position)])
    ).get();
  }

  /// Get verse translations
  Future<List<VerseTranslation>> getVerseTranslations(int verseId) async {
    return await (localDb.select(localDb.verseTranslations)
      ..where((t) => t.verseId.equals(verseId))
    ).get();
  }
}
