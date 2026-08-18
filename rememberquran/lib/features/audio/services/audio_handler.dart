import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_session/audio_session.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

Future<QuranAudioHandler> initAudioService() async {
  final session = await AudioSession.instance;
  await session.configure(const AudioSessionConfiguration.music());

  final tempDir = await getTemporaryDirectory();
  final cacheDir = Directory('${tempDir.path}/quran_audio_cache');
  if (!await cacheDir.exists()) {
    await cacheDir.create(recursive: true);
  }

  return await AudioService.init(
    builder: () => QuranAudioHandler(cacheDirPath: cacheDir.path),
    config: const AudioServiceConfig(
      androidNotificationChannelId: 'com.rememberquran.audio',
      androidNotificationChannelName: 'Quran Recitation',
      androidNotificationOngoing: true,
      androidStopForegroundOnPause: true,
      androidShowNotificationBadge: true,
    ),
  );
}

class QuranAudioHandler extends BaseAudioHandler with SeekHandler {
  final String cacheDirPath;
  final _player = AudioPlayer();
  final _prefetchPlayer = AudioPlayer();
  final _playlist = ConcatenatingAudioSource(children: []);

  /// Fires ~4x/sec during playback — the drive signal for word-by-word sync.
  Stream<Duration> get positionStream => _player.positionStream;

  /// Surfaces load/decode/network failures (bad URL, unreachable CDN,
  /// unsupported format) that [play] would otherwise fail on silently.
  Stream<PlayerException> get errorStream => _player.errorStream;

  QuranAudioHandler({required this.cacheDirPath}) {
    _init();
  }

  Future<void> _init() async {
    // Map just_audio's playback events to audio_service's playbackState.
    _player.playbackEventStream.listen((PlaybackEvent event) {
      final playing = _player.playing;
      playbackState.add(playbackState.value.copyWith(
        controls: [
          MediaControl.skipToPrevious,
          if (playing) MediaControl.pause else MediaControl.play,
          MediaControl.stop,
          MediaControl.skipToNext,
        ],
        systemActions: const {
          MediaAction.seek,
          MediaAction.seekForward,
          MediaAction.seekBackward,
        },
        androidCompactActionIndices: const [0, 1, 3],
        processingState: const {
          ProcessingState.idle: AudioProcessingState.idle,
          ProcessingState.loading: AudioProcessingState.loading,
          ProcessingState.buffering: AudioProcessingState.buffering,
          ProcessingState.ready: AudioProcessingState.ready,
          ProcessingState.completed: AudioProcessingState.completed,
        }[_player.processingState]!,
        playing: playing,
        updatePosition: _player.position,
        bufferedPosition: _player.bufferedPosition,
        speed: _player.speed,
        queueIndex: event.currentIndex,
      ));
    });

    // Listen to current sequence item changes to update media item
    _player.currentIndexStream.listen((index) {
      if (index != null && queue.value.isNotEmpty && index < queue.value.length) {
        mediaItem.add(queue.value[index]);
      }
    });

    // A phone call, another app, or Siri stealing focus should pause us
    // rather than leaving us "playing" into silence — the classic cause of
    // "I tapped play and heard nothing" reports.
    final session = await AudioSession.instance;
    session.interruptionEventStream.listen((event) {
      if (event.begin) {
        _player.pause();
      }
    });
    session.becomingNoisyEventStream.listen((_) => _player.pause());

    _player.durationStream.listen((duration) {
      if (duration != null && mediaItem.value != null) {
        mediaItem.add(mediaItem.value!.copyWith(duration: duration));
      }
    });

    await _player.setAudioSource(_playlist);
  }

  /// Resolves once the current source has buffered enough to seek reliably
  /// (or after [timeout] as a safety net), so callers that need to seek
  /// right after loading a new track — e.g. "play from this ayah" — don't
  /// race a seek against a still-loading network source and get ignored.
  Future<void> waitUntilReady({Duration timeout = const Duration(seconds: 12)}) async {
    if (_player.processingState == ProcessingState.ready ||
        _player.processingState == ProcessingState.completed) {
      return;
    }
    
    final completer = Completer<void>();
    StreamSubscription? stateSub;
    StreamSubscription? errSub;
    Timer? timer;

    void cleanup() {
      stateSub?.cancel();
      errSub?.cancel();
      timer?.cancel();
    }

    stateSub = _player.processingStateStream.listen((s) {
      if (s == ProcessingState.ready || s == ProcessingState.completed) {
        if (!completer.isCompleted) {
          completer.complete();
          cleanup();
        }
      }
    });

    errSub = _player.errorStream.listen((err) {
      if (!completer.isCompleted) {
        completer.completeError(err);
        cleanup();
      }
    });

    timer = Timer(timeout, () {
      if (!completer.isCompleted) {
        completer.completeError(TimeoutException('Audio loading timed out'));
        cleanup();
      }
    });

    return completer.future;
  }

  @override
  Future<void> play() => _player.play();

  @override
  Future<void> pause() => _player.pause();

  @override
  Future<void> seek(Duration position) => _player.seek(position);

  @override
  Future<void> stop() async {
    await _player.stop();
    await super.stop();
  }

  @override
  Future<void> skipToNext() => _player.seekToNext();

  @override
  Future<void> skipToPrevious() => _player.seekToPrevious();

  @override
  Future<void> addQueueItems(List<MediaItem> mediaItems) async {
    _enforceCacheLimit();
    final audioSources = mediaItems.map((item) {
      final uri = Uri.parse(item.id);
      if (uri.scheme == 'http' || uri.scheme == 'https') {
        final safeName = item.id.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
        final cacheFile = File('$cacheDirPath/$safeName.mp3');
        return LockCachingAudioSource(uri, tag: item, cacheFile: cacheFile);
      }
      return AudioSource.uri(uri, tag: item);
    }).toList();

    await _playlist.addAll(audioSources);

    final newQueue = queue.value..addAll(mediaItems);
    queue.add(newQueue);
  }

  @override
  Future<void> updateQueue(List<MediaItem> newQueue) async {
    _enforceCacheLimit();
    await _playlist.clear();

    final audioSources = newQueue.map((item) {
      final uri = Uri.parse(item.id);
      if (uri.scheme == 'http' || uri.scheme == 'https') {
        final safeName = item.id.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
        final cacheFile = File('$cacheDirPath/$safeName.mp3');
        return LockCachingAudioSource(uri, tag: item, cacheFile: cacheFile);
      }
      return AudioSource.uri(uri, tag: item);
    }).toList();

    await _playlist.addAll(audioSources);
    queue.add(newQueue);

    if (newQueue.isNotEmpty) {
      mediaItem.add(newQueue.first);
    }
  }

  Future<void> _enforceCacheLimit() async {
    try {
      final dir = Directory(cacheDirPath);
      if (!await dir.exists()) return;

      int totalSize = 0;
      final List<FileSystemEntity> entities = await dir.list().toList();
      final List<File> files = entities.whereType<File>().toList();

      final fileStats = <File, FileStat>{};
      for (var file in files) {
        final stat = await file.stat();
        fileStats[file] = stat;
        totalSize += stat.size;
      }

      // 500 MB limit
      const int maxBytes = 500 * 1024 * 1024;
      if (totalSize <= maxBytes) return;

      // Sort by last modified, oldest first
      files.sort((a, b) {
        final statA = fileStats[a]!;
        final statB = fileStats[b]!;
        return statA.modified.compareTo(statB.modified);
      });

      for (var file in files) {
        // Delete until we hit 400 MB to give some headroom
        if (totalSize <= 400 * 1024 * 1024) break;
        try {
          await file.delete();
          totalSize -= fileStats[file]!.size;
        } catch (_) {
          // File might be currently locked or playing
        }
      }
    } catch (e) {
      // Silently fail if we can't clean up right now
    }
  }

  @override
  Future<void> setSpeed(double speed) => _player.setSpeed(speed);

  @override
  Future<void> setRepeatMode(AudioServiceRepeatMode repeatMode) async {
    switch (repeatMode) {
      case AudioServiceRepeatMode.none:
        await _player.setLoopMode(LoopMode.off);
        break;
      case AudioServiceRepeatMode.one:
        await _player.setLoopMode(LoopMode.one);
        break;
      case AudioServiceRepeatMode.all:
      case AudioServiceRepeatMode.group:
        await _player.setLoopMode(LoopMode.all);
        break;
    }
  }

  /// Silently downloads/caches the given item without interrupting active playback.
  Future<void> prefetchItem(MediaItem item) async {
    final uri = Uri.parse(item.id);
    if (uri.scheme == 'http' || uri.scheme == 'https') {
      final safeName = item.id.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
      final cacheFile = File('$cacheDirPath/$safeName.mp3');
      if (await cacheFile.exists()) return; // Already cached
      
      final source = LockCachingAudioSource(uri, tag: item, cacheFile: cacheFile);
      try {
        await _prefetchPlayer.setAudioSource(source);
      } catch (_) {
        // Ignore prefetch failures
      }
    }
  }
}
