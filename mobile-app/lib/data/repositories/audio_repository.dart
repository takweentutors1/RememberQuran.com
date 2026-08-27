import 'dart:io';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import '../datasources/local/quran_db.dart';
import '../datasources/remote/audio_remote_ds.dart';

class AudioRepository {
  final QuranDatabase localDb;
  final AudioRemoteDataSource remoteDs;
  final Dio _dio = Dio();

  AudioRepository({required this.localDb, required this.remoteDs});

  Future<Directory> _audioDir(int reciterId) async {
    final docsDir = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(docsDir.path, 'audio', '$reciterId'));
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  /// Returns the local file path for a downloaded chapter, or null if not downloaded.
  /// Drops stale DB records if the file was removed outside the app.
  Future<String?> getLocalPath(int reciterId, int chapterId) async {
    final row = await (localDb.select(localDb.downloadedAudio)
          ..where((t) => t.reciterId.equals(reciterId) & t.chapterId.equals(chapterId)))
        .getSingleOrNull();
    if (row == null) return null;

    // Resolve absolute path dynamically because iOS sandbox UUID changes on rebuilds.
    final baseDir = await _audioDir(reciterId);
    final fileName = p.basename(row.localPath);
    final absolutePath = p.join(baseDir.path, fileName);

    if (!await File(absolutePath).exists()) {
      await (localDb.delete(localDb.downloadedAudio)
            ..where((t) => t.reciterId.equals(reciterId) & t.chapterId.equals(chapterId)))
          .go();
      return null;
    }
    return absolutePath;
  }

  /// Set of "reciterId_chapterId" keys for chapters currently downloaded on disk.
  Future<Set<String>> getDownloadedKeys() async {
    final rows = await localDb.select(localDb.downloadedAudio).get();
    return rows.map((r) => '${r.reciterId}_${r.chapterId}').toSet();
  }

  Future<void> downloadChapter(
    int reciterId,
    int chapterId, {
    void Function(double progress)? onProgress,
  }) async {
    final audioFile = await remoteDs.getChapterAudio(reciterId, chapterId);
    final audioUrl = audioFile['audio_url'] as String;

    final dir = await _audioDir(reciterId);
    final savePath = p.join(dir.path, '$chapterId.mp3');
    final tempPath = '$savePath.part';

    await _dio.download(
      audioUrl,
      tempPath,
      onReceiveProgress: (received, total) {
        if (total > 0) onProgress?.call(received / total);
      },
    );

    await File(tempPath).rename(savePath);

    await localDb.into(localDb.downloadedAudio).insert(
          DownloadedAudioCompanion.insert(
            reciterId: reciterId,
            chapterId: chapterId,
            localPath: savePath,
            downloadedAt: DateTime.now(),
          ),
          mode: InsertMode.insertOrReplace,
        );
  }

  Future<void> deleteDownload(int reciterId, int chapterId) async {
    final path = await getLocalPath(reciterId, chapterId);

    await (localDb.delete(localDb.downloadedAudio)
          ..where((t) => t.reciterId.equals(reciterId) & t.chapterId.equals(chapterId)))
        .go();

    if (path != null) {
      final file = File(path);
      if (await file.exists()) await file.delete();
    }
  }
}
