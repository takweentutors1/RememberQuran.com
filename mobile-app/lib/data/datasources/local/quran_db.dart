import 'dart:convert';
import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../remote/quran_remote_ds.dart';
import '../../../core/models/translation.dart';

part 'quran_db.g.dart';

class Chapters extends Table {
  IntColumn get id => integer()();
  TextColumn get revelationPlace => text()(); // 'makkah', 'madinah'
  IntColumn get revelationOrder => integer()();
  BoolColumn get bismillahPre => boolean()();
  TextColumn get nameSimple => text()();
  TextColumn get nameComplex => text()();
  TextColumn get nameArabic => text()();
  IntColumn get versesCount => integer()();
  TextColumn get pages => text()(); // JSON array [start, end]
  TextColumn get translatedName => text()(); // JSON string {language_name, name}

  @override
  Set<Column> get primaryKey => {id};
}

class Verses extends Table {
  IntColumn get id => integer()();
  IntColumn get chapterId => integer().references(Chapters, #id)();
  IntColumn get verseNumber => integer()();
  TextColumn get verseKey => text()(); // e.g. "1:1"
  IntColumn get pageNumber => integer()();
  IntColumn get juzNumber => integer()();
  IntColumn get hizbNumber => integer()();
  TextColumn get textUthmani => text()();
  TextColumn get qpcUthmaniHafs => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class Words extends Table {
  IntColumn get id => integer()();
  IntColumn get verseId => integer().references(Verses, #id)();
  IntColumn get position => integer()();
  TextColumn get audioUrl => text().nullable()();
  TextColumn get charTypeName => text()();
  TextColumn get textUthmani => text()();
  TextColumn get qpcUthmaniHafs => text().nullable()();
  TextColumn get textUthmaniTajweed => text().nullable()();
  TextColumn get translation => text()(); // JSON string {text, language_name}
  TextColumn get transliteration => text().nullable()(); // JSON string {text, language_name}

  @override
  Set<Column> get primaryKey => {id};
}

class VerseTranslations extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get verseId => integer().references(Verses, #id)();
  IntColumn get resourceId => integer()();
  TextColumn get translationText => text().named('text')();
}

class DownloadedAudio extends Table {
  IntColumn get reciterId => integer()();
  IntColumn get chapterId => integer()();
  TextColumn get localPath => text()();
  DateTimeColumn get downloadedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {reciterId, chapterId};
}

@DriftDatabase(tables: [Chapters, Verses, Words, VerseTranslations, DownloadedAudio])
class QuranDatabase extends _$QuranDatabase {
  QuranDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (Migrator m) async {
          await m.createAll();
        },
        onUpgrade: (Migrator m, int from, int to) async {
          if (from < 2) {
            await m.createTable(downloadedAudio);
          }
        },
      );

  Future<Chapter?> getChapter(int chapterId) {
    return (select(chapters)..where((t) => t.id.equals(chapterId))).getSingleOrNull();
  }

  Future<List<Verse>> getVersesByChapter(int chapterId) {
    return (select(verses)..where((tbl) => tbl.chapterId.equals(chapterId))).get();
  }

  /// Phase 1: Seeds all 114 chapter *names* from a single fast API call.
  /// Called synchronously during splash so the home screen can show all
  /// 114 surahs immediately — no need to wait for verses.
  Future<void> seedChaptersOnly(QuranRemoteDataSource remoteDs) async {
    final chaptersList = await remoteDs.getChapters();
    await transaction(() async {
      for (final chapter in chaptersList) {
        final c = Map<String, dynamic>.from(chapter);
        await into(chapters).insert(ChaptersCompanion.insert(
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
      }
    });
  }

  /// Phase 2: Seeds all verses in the background after chapters are visible.
  /// Each chapter's verses are fetched and stored page-by-page.
  Future<void> seedVerses(QuranRemoteDataSource remoteDs) async {
    final chaptersList = await remoteDs.getChapters();

    for (final chapter in chaptersList) {
      final c = Map<String, dynamic>.from(chapter);
      int page = 1;
      int totalPages = 1;

      do {
        // IMPORTANT: Fetch from network OUTSIDE the transaction so we don't lock the DB for seconds/minutes
        final versesPage = await remoteDs.getVersesPage(c['id'], page: page, translations: bundleTranslationIds);
        totalPages = versesPage['pagination']['total_pages'];

        final versesList = versesPage['verses'] as List<dynamic>;

        // Only wrap the inserts in a transaction for atomicity and speed
        await transaction(() async {
          for (final verse in versesList) {
            final v = Map<String, dynamic>.from(verse);
            await into(verses).insert(VersesCompanion.insert(
              id: Value(v['id'] as int),
              chapterId: c['id'] as int,
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
                await into(words).insert(WordsCompanion.insert(
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
              for (final trans in translationsList) {
                final t = Map<String, dynamic>.from(trans);
                await into(verseTranslations).insert(VerseTranslationsCompanion.insert(
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
    }
  }

  /// @deprecated Use [seedChaptersOnly] + [seedVerses] instead.
  /// Kept for reference. Fetches all 114 chapters and verses from the remote data source and inserts them.
  /// This should only be called once on first launch if the DB is empty.
  Future<void> seedFromFirstSync(QuranRemoteDataSource remoteDs) async {
    await seedChaptersOnly(remoteDs);
    await seedVerses(remoteDs);
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'quran.sqlite'));
    return NativeDatabase(
      file,
      setup: (db) {
        // Wait up to 5 seconds for locks to clear
        db.execute('PRAGMA busy_timeout = 5000;');
        db.execute('PRAGMA journal_mode=WAL;');
      },
    );
  });
}
