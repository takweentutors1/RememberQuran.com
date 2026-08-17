import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_session/audio_session.dart';

Future<QuranAudioHandler> initAudioService() async {
  final session = await AudioSession.instance;
  await session.configure(const AudioSessionConfiguration.music());

  return await AudioService.init(
    builder: () => QuranAudioHandler(),
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
  final _player = AudioPlayer();
  final _playlist = ConcatenatingAudioSource(children: []);

  /// Fires ~4x/sec during playback — the drive signal for word-by-word sync.
  Stream<Duration> get positionStream => _player.positionStream;

  /// Surfaces load/decode/network failures (bad URL, unreachable CDN,
  /// unsupported format) that [play] would otherwise fail on silently.
  Stream<PlayerException> get errorStream => _player.errorStream;

  QuranAudioHandler() {
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
    await _player.processingStateStream
        .firstWhere((s) => s == ProcessingState.ready || s == ProcessingState.completed)
        .timeout(timeout);
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
    final audioSources = mediaItems.map((item) {
      return AudioSource.uri(
        Uri.parse(item.id),
        tag: item,
      );
    }).toList();

    await _playlist.addAll(audioSources);

    final newQueue = queue.value..addAll(mediaItems);
    queue.add(newQueue);
  }

  @override
  Future<void> updateQueue(List<MediaItem> newQueue) async {
    await _playlist.clear();

    final audioSources = newQueue.map((item) {
      return AudioSource.uri(
        Uri.parse(item.id),
        tag: item, // we attach the media item as a tag so we can read it later if needed
      );
    }).toList();

    await _playlist.addAll(audioSources);
    queue.add(newQueue);

    if (newQueue.isNotEmpty) {
      mediaItem.add(newQueue.first);
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
}
