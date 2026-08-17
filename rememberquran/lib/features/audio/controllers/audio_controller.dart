import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:get/get.dart';
import '../services/audio_handler.dart';
import '../../../data/datasources/remote/audio_remote_ds.dart';
import '../../../data/repositories/audio_repository.dart';
import '../../../core/models/reciter.dart';
import '../../../core/utils/word_sync.dart';

enum RepeatMode { none, ayah, range }

class RepeatSettings {
  final RepeatMode mode;
  final int count;
  final Duration delay;
  final int? rangeStartIdx;
  final int? rangeEndIdx;

  const RepeatSettings({
    this.mode = RepeatMode.none,
    this.count = 1,
    this.delay = Duration.zero,
    this.rangeStartIdx,
    this.rangeEndIdx,
  });
}

class AudioController extends GetxController {
  final QuranAudioHandler _audioHandler = Get.find<QuranAudioHandler>();
  final AudioRemoteDataSource _audioRemoteDs = Get.find<AudioRemoteDataSource>();
  final AudioRepository _audioRepository = Get.find<AudioRepository>();

  final rxIsPlaying = false.obs;
  final rxCurrentAyahIndex = 0.obs;
  final rxRepeatSettings = const RepeatSettings().obs;
  final rxPlaybackSpeed = 1.0.obs;

  // Radio Mode State
  final rxIsRadioMode = false.obs;
  final rxRadioFailStreak = 0.obs;
  final rxCurrentReciterId = 7.obs;
  final rxCurrentSurahId = 1.obs;
  final rxIsBusy = false.obs;

  // Offline download state, keyed by "reciterId_chapterId"
  final RxSet<String> rxDownloadedKeys = <String>{}.obs;
  final RxMap<String, double> rxDownloadProgress = <String, double>{}.obs;

  // Word-by-word highlight sync — the verse/word currently being recited.
  final Rxn<String> rxActiveVerseKey = Rxn<String>();
  final Rxn<int> rxActiveWordPosition = Rxn<int>();

  List<CleanVerseTiming> _timings = [];
  bool _hasWordTiming = false;
  int _lastVerseIdx = -1;
  int? _lastWordPos;
  StreamSubscription<Duration>? _positionSub;

  int _currentRepeat = 0;
  Timer? _pauseTimer;

  String downloadKey(int reciterId, int chapterId) => '${reciterId}_$chapterId';

  bool isDownloaded(int reciterId, int chapterId) =>
      rxDownloadedKeys.contains(downloadKey(reciterId, chapterId));

  Future<void> refreshDownloadedKeys() async {
    rxDownloadedKeys.assignAll(await _audioRepository.getDownloadedKeys());
  }

  Future<void> downloadChapter(int reciterId, int chapterId) async {
    final key = downloadKey(reciterId, chapterId);
    if (rxDownloadedKeys.contains(key) || rxDownloadProgress.containsKey(key)) return;

    rxDownloadProgress[key] = 0.0;
    try {
      await _audioRepository.downloadChapter(
        reciterId,
        chapterId,
        onProgress: (progress) => rxDownloadProgress[key] = progress,
      );
      rxDownloadedKeys.add(key);
    } finally {
      rxDownloadProgress.remove(key);
    }
  }

  Future<void> deleteDownload(int reciterId, int chapterId) async {
    await _audioRepository.deleteDownload(reciterId, chapterId);
    rxDownloadedKeys.remove(downloadKey(reciterId, chapterId));
  }

  @override
  void onInit() {
    super.onInit();

    refreshDownloadedKeys();

    // Listen to media item changes (Queue index progression)
    _audioHandler.mediaItem.listen((item) {
      if (item != null) {
        // Find index in queue
        final queue = _audioHandler.queue.value;
        final idx = queue.indexWhere((q) => q.id == item.id);
        if (idx != -1) {
          if (idx != rxCurrentAyahIndex.value) {
            _onIndexChanged(idx);
          }
          rxCurrentAyahIndex.value = idx;
        }
      }
    });

    // Listen to playback state to determine playing status and completion
    _audioHandler.playbackState.listen((state) {
      rxIsPlaying.value = state.playing;

      if (state.processingState == AudioProcessingState.completed) {
        _onPlaybackCompleted();
      }
    });

    _positionSub = _audioHandler.positionStream.listen(_onPositionTick);
  }

  @override
  void onClose() {
    _positionSub?.cancel();
    super.onClose();
  }

  /// Drives word-by-word highlight sync — resolves the current verse/word
  /// from raw playback position via word_sync.dart's binary search.
  void _onPositionTick(Duration position) {
    if (_timings.isEmpty) return;
    final t = position.inMilliseconds;

    bool within(int i) => i >= 0 && i < _timings.length && _timings[i].from <= t && t < _timings[i].to;
    var idx = _lastVerseIdx;
    if (!within(idx)) {
      idx = within(idx + 1) ? idx + 1 : findVerseIndex(_timings, t);
    }
    if (idx != _lastVerseIdx) {
      _lastVerseIdx = idx;
      _lastWordPos = null;
    }
    if (idx < 0 || idx >= _timings.length) return;

    final timing = _timings[idx];
    final pos = _hasWordTiming ? findWordPosition(timing, t) : null;
    // Gaps (pauses, madd tails) keep the previous word lit — no flicker.
    if (pos != null) _lastWordPos = pos;

    rxActiveVerseKey.value = timing.verseKey;
    rxActiveWordPosition.value = _lastWordPos;
  }

  void _applyTimings(Map<String, dynamic> audioFile) {
    final rawTimings = audioFile['verse_timings'] as List<dynamic>? ?? [];
    _timings = sanitizeTimings(rawTimings);
    _hasWordTiming = getReciter(rxCurrentReciterId.value).hasWordTiming &&
        _timings.any((t) => t.segments.isNotEmpty);
    _lastVerseIdx = -1;
    _lastWordPos = null;
    rxActiveVerseKey.value = null;
    rxActiveWordPosition.value = null;
  }

  /// Best-effort timings fetch for locally downloaded chapters — the mp3 is
  /// already available, so a failure here (e.g. offline) just means no
  /// highlight, not a playback failure.
  Future<void> _loadTimings(int reciterId, int chapterId) async {
    try {
      final audioFile = await _audioRemoteDs.getChapterAudio(reciterId, chapterId);
      _applyTimings(audioFile);
    } catch (_) {
      _timings = [];
      _hasWordTiming = false;
      _lastVerseIdx = -1;
      _lastWordPos = null;
      rxActiveVerseKey.value = null;
      rxActiveWordPosition.value = null;
    }
  }

  CleanVerseTiming? _findTiming(int verseNumber) {
    for (final t in _timings) {
      if (t.verseNumber == verseNumber) return t;
    }
    return null;
  }


  void _onPlaybackCompleted() {
    if (rxIsRadioMode.value) {
      advanceRadio();
      return;
    }
    // Standard processingState=completed usually means the entire queue finished.
    // just_audio automatically skips to next if it's a concatenating source, 
    // so we handle track completion mostly in _onIndexChanged.
    // However, if the entire queue finishes, we might need to handle repeat all.
    _handleRepeatLogic(isEndOfQueue: true);
  }

  void _onIndexChanged(int newIndex) {
    // When track naturally progresses to the next one, we check if we need to intercept
    // and loop back based on our custom state machine.
    _handleRepeatLogic(newIndex: newIndex);
  }
  
  void _handleRepeatLogic({int? newIndex, bool isEndOfQueue = false}) {
    final settings = rxRepeatSettings.value;
    if (settings.mode == RepeatMode.none) return;

    if (settings.mode == RepeatMode.ayah) {
      if (_currentRepeat < settings.count - 1) {
        _currentRepeat++;
        _pauseAndScheduleRestart(rxCurrentAyahIndex.value);
      } else {
        _currentRepeat = 0; // Move on
      }
    } else if (settings.mode == RepeatMode.range && settings.rangeStartIdx != null && settings.rangeEndIdx != null) {
      // If we just entered a track past the rangeEndIdx, or the queue ended at rangeEndIdx
      if (isEndOfQueue || (newIndex != null && newIndex > settings.rangeEndIdx!)) {
        if (_currentRepeat < settings.count - 1) {
          _currentRepeat++;
          _pauseAndScheduleRestart(settings.rangeStartIdx!);
        } else {
          _currentRepeat = 0;
        }
      }
    }
  }

  void _pauseAndScheduleRestart(int targetIndex) {
    _audioHandler.pause();
    
    _pauseTimer?.cancel();
    if (rxRepeatSettings.value.delay > Duration.zero) {
      _pauseTimer = Timer(rxRepeatSettings.value.delay, () {
        _audioHandler.skipToQueueItem(targetIndex);
        _audioHandler.play();
      });
    } else {
      _audioHandler.skipToQueueItem(targetIndex);
      _audioHandler.play();
    }
  }

  void setRepeatSettings(RepeatSettings settings) {
    rxRepeatSettings.value = settings;
    _currentRepeat = 0;
  }

  Future<void> setSpeed(double speed) async {
    rxPlaybackSpeed.value = speed;
    await _audioHandler.setSpeed(speed);
  }

  // Interruption Fix 1: Manual navigation kills active repeat/timer
  Future<void> playAyah(int index) async {
    rxIsRadioMode.value = false;
    _currentRepeat = 0;
    _pauseTimer?.cancel();
    await _audioHandler.skipToQueueItem(index);
    await _audioHandler.play();
  }

  // Interruption Fix 2: Manual play/pause or scrubbing kills pending pause timer
  Future<void> play() async {
    _pauseTimer?.cancel();
    await _audioHandler.play();
  }

  Future<void> pause() async {
    _pauseTimer?.cancel();
    await _audioHandler.pause();
  }

  Future<void> seek(Duration position) async {
    _pauseTimer?.cancel();
    await _audioHandler.seek(position);
  }
  
  Future<void> skipToNext() async {
    _pauseTimer?.cancel();
    _currentRepeat = 0;
    await _audioHandler.skipToNext();
  }
  
  Future<void> skipToPrevious() async {
    _pauseTimer?.cancel();
    _currentRepeat = 0;
    await _audioHandler.skipToPrevious();
  }

  // Radio Mode Functions
  Future<void> startRadio(int surahId) async {
    rxIsRadioMode.value = true;
    rxRadioFailStreak.value = 0;
    rxCurrentSurahId.value = surahId;
    await _loadAndPlayChapter(surahId);
  }

  /// Loads a chapter's audio (+ verse timings for word-sync) and plays it.
  /// Shared by Radio mode and [playVerse] — only Radio mode auto-advances
  /// past a broken chapter on failure.
  Future<void> _loadAndPlayChapter(int surahId) async {
    rxIsBusy.value = true;
    try {
      final reciterId = rxCurrentReciterId.value;
      final localPath = await _audioRepository.getLocalPath(reciterId, surahId);

      final String audioSource;
      if (localPath != null) {
        audioSource = Uri.file(localPath).toString();
        await _loadTimings(reciterId, surahId);
      } else {
        final audioFile = await _audioRemoteDs.getChapterAudio(reciterId, surahId);
        audioSource = audioFile['audio_url'] as String;
        _applyTimings(audioFile);
      }

      final mediaItem = MediaItem(
        id: audioSource,
        album: 'Surah $surahId',
        title: 'Surah $surahId',
      );

      await _audioHandler.updateQueue([mediaItem]);
      await _audioHandler.play();
      rxRadioFailStreak.value = 0;
    } catch (e) {
      rxRadioFailStreak.value += 1;
      // Skip at most one broken chapter — never loop through failures indefinitely
      if (rxIsRadioMode.value && rxRadioFailStreak.value < 2) {
        final nextSurah = (surahId % 114) + 1;
        rxCurrentSurahId.value = nextSurah;
        await _loadAndPlayChapter(nextSurah);
      }
    } finally {
      rxIsBusy.value = false;
    }
  }

  Future<void> advanceRadio() async {
    if (!rxIsRadioMode.value) return;
    final nextSurah = (rxCurrentSurahId.value % 114) + 1;
    rxCurrentSurahId.value = nextSurah;
    await _loadAndPlayChapter(nextSurah);
  }

  /// Plays a chapter starting from a specific verse — the reader's
  /// "play from here" trigger. Leaves Radio mode; loads the chapter's audio
  /// only if it isn't already the one loaded.
  Future<void> playVerse(int chapterId, int verseNumber) async {
    rxIsRadioMode.value = false;
    _currentRepeat = 0;
    _pauseTimer?.cancel();

    final alreadyLoaded = rxCurrentSurahId.value == chapterId && _timings.isNotEmpty;
    if (!alreadyLoaded) {
      rxCurrentSurahId.value = chapterId;
      await _loadAndPlayChapter(chapterId);
    } else if (!rxIsPlaying.value) {
      await _audioHandler.play();
    }

    final timing = _findTiming(verseNumber);
    if (timing != null) {
      await _audioHandler.seek(Duration(milliseconds: timing.from));
      _lastVerseIdx = -1;
      _lastWordPos = null;
      rxActiveVerseKey.value = timing.verseKey;
      rxActiveWordPosition.value = null;
    }
  }
}
