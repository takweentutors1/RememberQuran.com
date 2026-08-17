import 'dart:convert';
import 'package:drift/drift.dart';
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

  /// Get all chapters. Cache-first strategy.
  Future<List<Chapter>> getChapters() async {
    final cached = await localDb.select(localDb.chapters).get();
    
    // Background refresh
    _refreshChapters();
    
    if (cached.isNotEmpty) {
      return cached;
    }
    
    // If empty, we must wait for the refresh to populate the DB
    await _refreshChapters();
    return await localDb.select(localDb.chapters).get();
  }

  Future<void> _refreshChapters() async {
    try {
      final remoteList = await remoteDs.getChapters();
      await localDb.transaction(() async {
        for (final c in remoteList) {
          final map = Map<String, dynamic>.from(c);
          await localDb.into(localDb.chapters).insert(ChaptersCompanion.insert(
            id: map['id'],
            revelationPlace: map['revelation_place'],
            revelationOrder: map['revelation_order'],
            bismillahPre: map['bismillah_pre'] ?? false,
            nameSimple: map['name_simple'],
            nameComplex: map['name_complex'],
            nameArabic: map['name_arabic'],
            versesCount: map['verses_count'],
            pages: jsonEncode(map['pages']),
            translatedName: jsonEncode(map['translated_name']),
          ), mode: InsertMode.insertOrReplace);
        }
      });
    } catch (e) {
      // Background refresh failed, ignore (will fallback to cache)
    }
  }

  /// Get a single chapter's metadata
  Future<Chapter?> getChapter(int chapterId) async {
    return await (localDb.select(localDb.chapters)
      ..where((c) => c.id.equals(chapterId))
    ).getSingleOrNull();
  }

  /// Get all verses for a chapter. Cache-first strategy.
  Future<List<Verse>> getVerses(int chapterId) async {
    final cached = await (localDb.select(localDb.verses)
      ..where((v) => v.chapterId.equals(chapterId))
      ..orderBy([(v) => OrderingTerm(expression: v.verseNumber)])
    ).get();

    // Trigger background refresh for verses
    _refreshVerses(chapterId);

    if (cached.isNotEmpty) {
      return cached;
    }

    // Await refresh if nothing is cached
    await _refreshVerses(chapterId);
    return await (localDb.select(localDb.verses)
      ..where((v) => v.chapterId.equals(chapterId))
      ..orderBy([(v) => OrderingTerm(expression: v.verseNumber)])
    ).get();
  }

  Future<void> _refreshVerses(int chapterId) async {
    try {
      int page = 1;
      int totalPages = 1;
      
      await localDb.transaction(() async {
        do {
          final versesPage = await remoteDs.getVersesPage(chapterId, page: page, translations: bundleTranslationIds);
          totalPages = versesPage['pagination']['total_pages'];
          final versesList = versesPage['verses'] as List<dynamic>;
          
          for (final verse in versesList) {
            final v = Map<String, dynamic>.from(verse);
            await localDb.into(localDb.verses).insert(VersesCompanion.insert(
              id: v['id'],
              chapterId: chapterId,
              verseNumber: v['verse_number'],
              verseKey: v['verse_key'],
              pageNumber: v['page_number'],
              juzNumber: v['juz_number'],
              hizbNumber: v['hizb_number'],
              textUthmani: v['text_uthmani'],
              qpcUthmaniHafs: Value(v['qpc_uthmani_hafs']),
            ), mode: InsertMode.insertOrReplace);

            if (v['words'] != null) {
              final wordsList = v['words'] as List<dynamic>;
              for (final word in wordsList) {
                final w = Map<String, dynamic>.from(word);
                await localDb.into(localDb.words).insert(WordsCompanion.insert(
                  id: w['id'],
                  verseId: v['id'],
                  position: w['position'],
                  audioUrl: Value(w['audio_url']),
                  charTypeName: w['char_type_name'],
                  textUthmani: w['text_uthmani'],
                  qpcUthmaniHafs: Value(w['qpc_uthmani_hafs']),
                  textUthmaniTajweed: Value(w['text_uthmani_tajweed']),
                  translation: jsonEncode(w['translation']),
                  transliteration: Value(w['transliteration'] != null ? jsonEncode(w['transliteration']) : null),
                ), mode: InsertMode.insertOrReplace);
              }
            }

            if (v['translations'] != null) {
              final translationsList = v['translations'] as List<dynamic>;
              
              // Clear old translations for this verse to avoid duplicates since PK is auto-increment
              await (localDb.delete(localDb.verseTranslations)..where((t) => t.verseId.equals(v['id']))).go();

              for (final trans in translationsList) {
                final t = Map<String, dynamic>.from(trans);
                await localDb.into(localDb.verseTranslations).insert(VerseTranslationsCompanion.insert(
                  verseId: v['id'],
                  resourceId: t['resource_id'],
                  translationText: t['text'],
                ));
              }
            }
          }
          page++;
        } while (page <= totalPages);
      });
    } catch (e) {
      // Ignore network errors on background refresh
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
