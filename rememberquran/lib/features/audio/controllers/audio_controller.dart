import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart' show PlayerException;
import '../services/audio_handler.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../data/datasources/remote/audio_remote_ds.dart';
import '../../../data/repositories/audio_repository.dart';
import '../../../core/models/reciter.dart';
import '../../../core/utils/word_sync.dart';
import '../../../shared/widgets/app_feedback.dart';

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
  final QuranDatabase _db = Get.find<QuranDatabase>();

  final rxIsPlaying = false.obs;
  final rxCurrentAyahIndex = 0.obs;
  final rxRepeatSettings = const RepeatSettings().obs;
  final rxPlaybackSpeed = 1.0.obs;

  // Radio Mode State
  final rxIsRadioMode = false.obs;
  final rxRadioFailStreak = 0.obs;
  final rxCurrentReciterId = 7.obs;
  final rxCurrentSurahId = 1.obs;
  final rxCurrentSurahName = ''.obs;
  final rxCurrentSurahNameArabic = ''.obs;
  final rxCurrentSurahRevelationPlace = ''.obs;
  final rxCurrentSurahRevelationOrder = 0.obs;
  final rxCurrentSurahVersesCount = 0.obs;
  final rxCurrentSurahPages = ''.obs;
  final rxCurrentSurahFirstJuz = 1.obs;
  final rxHasAudio = false.obs;
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
  Timer? _highlightTimer;
  int? _lastSurahId;

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

    // Surface load/decode/network failures instead of leaving the user with
    // silent audio and no explanation — this is what used to just print to
    // a console nobody reads.
    _audioHandler.errorStream.listen((PlayerException e) {
      // Radio mode already recovers from a broken track by silently
      // skipping to the next surah (see _loadAndPlayChapter) — surfacing an
      // error here too would just be noise on top of that.
      if (rxIsRadioMode.value) return;
      AppFeedback.showError(
        'Audio failed to load. Check your connection and try again.',
        title: 'Playback error',
        onRetry: _lastSurahId == null ? null : () => _loadAndPlayChapter(_lastSurahId!),
      );
    });

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

    ever(rxCurrentSurahId, _updateSurahMetadata);

    // Listen to playback state to determine playing status and completion
    _audioHandler.playbackState.listen((state) {
      if (state.processingState == AudioProcessingState.completed) {
        rxIsPlaying.value = false;
      } else {
        rxIsPlaying.value = state.playing;
      }

      if (state.playing) {
        _startHighlightTimer();
      } else {
        _stopHighlightTimer();
        // Fire one last tick for exact pause location
        _onPositionTick(state.position);
      }

      if (state.processingState == AudioProcessingState.completed) {
        _onPlaybackCompleted();
      }
    });
  }

  void _startHighlightTimer() {
    _highlightTimer?.cancel();
    _highlightTimer = Timer.periodic(const Duration(milliseconds: 32), (_) {
      final state = _audioHandler.playbackState.value;
      if (!state.playing) return;
      
      // Interpolate current position based on update time and speed
      final elapsed = DateTime.now().difference(state.updateTime);
      final currentPosition = state.position + (elapsed * state.speed);
      
      _onPositionTick(currentPosition);
    });
  }

  void _stopHighlightTimer() {
    _highlightTimer?.cancel();
    _highlightTimer = null;
  }

  @override
  void onClose() {
    _stopHighlightTimer();
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
    unawaited(_audioHandler.play());
  }

  // Interruption Fix 2: Manual play/pause or scrubbing kills pending pause timer
  Future<void> play() async {
    _pauseTimer?.cancel();
    if (_audioHandler.playbackState.value.processingState == AudioProcessingState.completed) {
      final activeVerseParts = rxActiveVerseKey.value?.split(':') ?? const <String>[];
      if (activeVerseParts.length == 2) {
        final timing = _findTiming(int.tryParse(activeVerseParts[1]) ?? 1);
        if (timing != null) {
          await _audioHandler.seek(Duration(milliseconds: timing.from));
        }
      } else {
        await _audioHandler.seek(Duration.zero);
      }
    }
    unawaited(_audioHandler.play());
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

  Future<void> _updateSurahMetadata(int surahId) async {
    final chapter = await _db.getChapter(surahId);
    if (chapter != null) {
      rxCurrentSurahName.value = chapter.nameSimple;
      rxCurrentSurahNameArabic.value = chapter.nameArabic;
      rxCurrentSurahRevelationPlace.value = chapter.revelationPlace;
      rxCurrentSurahRevelationOrder.value = chapter.revelationOrder;
      rxCurrentSurahVersesCount.value = chapter.versesCount;
      rxCurrentSurahPages.value = chapter.pages;
      
      // Attempt to get the first Juz for this Surah
      final verses = await _db.getVersesByChapter(surahId);
      if (verses.isNotEmpty) {
        rxCurrentSurahFirstJuz.value = verses.first.juzNumber;
      }
    }
  }

  Future<void> _loadAndPlayChapter(int surahId) async {
    rxIsBusy.value = true;
    _lastSurahId = surahId;
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
      rxHasAudio.value = true;
      
      // Do not await play() itself — it only completes when playback ends —
      // but any *immediate* failure (bad URL, unsupported format) still
      // needs to be logged, not silently dropped.
      unawaited(_audioHandler.play().catchError((Object e, StackTrace st) {
        FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
      }));
      // Block here until the player has actually buffered the new source.
      // Without this, a caller that seeks right after (playVerse, "play
      // from this ayah") races a still-loading network source — the seek
      // is silently ignored on iOS and playback starts from 0:00 instead
      // of the requested ayah.
      await _audioHandler.waitUntilReady();
      rxRadioFailStreak.value = 0;
    } catch (e) {
      rxRadioFailStreak.value += 1;
      // Skip at most one broken chapter — never loop through failures indefinitely
      if (rxIsRadioMode.value && rxRadioFailStreak.value < 2) {
        final nextSurah = (surahId % 114) + 1;
        rxCurrentSurahId.value = nextSurah;
        await _loadAndPlayChapter(nextSurah);
      } else if (rxIsRadioMode.value) {
        // Retry budget exhausted — stop instead of leaving Radio mode stuck
        // "on" with nothing loaded and no feedback.
        rxIsRadioMode.value = false;
        rxHasAudio.value = false;
        AppFeedback.showError(
          'Could not reach the audio server. Check your connection and try again.',
          title: 'Playback error',
          onRetry: () => startRadio(surahId),
        );
      } else {
        AppFeedback.showError(
          'Could not play this surah. Check your connection and try again.',
          title: 'Playback error',
          onRetry: () => _loadAndPlayChapter(surahId),
        );
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
    }

    final timing = _findTiming(verseNumber);
    if (timing != null) {
      await _audioHandler.seek(Duration(milliseconds: timing.from));
      _lastVerseIdx = -1;
      _lastWordPos = null;
      rxActiveVerseKey.value = timing.verseKey;
      rxActiveWordPosition.value = null;
    }
    
    // Ensure we start playing if paused or completed
    unawaited(_audioHandler.play());
  }
}
