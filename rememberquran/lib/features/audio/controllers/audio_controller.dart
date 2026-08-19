import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' show Random;
import 'dart:ui' as ui;
import 'package:audio_service/audio_service.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/material.dart' show Color, Path, Paint, Rect, Size;
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart' show PlayerException;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/audio_handler.dart';
import '../views/widgets/arabesque_painter.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../data/datasources/remote/audio_remote_ds.dart';
import '../../../data/repositories/audio_repository.dart';
import '../../../core/models/reciter.dart';
import '../../../core/utils/word_sync.dart';
import '../../../shared/widgets/app_feedback.dart';

enum RepeatMode { none, ayah, range }

enum SleepTimerMode { off, duration, endOfSurah }

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
  /// Cosmetic waveform bars on the Radio tab — user-toggleable in Settings
  /// for performance-sensitive devices. Defaults on; persisted locally.
  final RxBool rxWaveformEnabled = true.obs;
  static const _waveformEnabledPrefsKey = 'rq_waveform_bars_enabled';

  /// Radio shuffle — governs what [radioSkipToNext] picks, both on manual
  /// skip and on auto-advance at the end of a track. Persisted like other
  /// playback prefs since most audio apps remember shuffle across launches.
  final RxBool rxShuffleEnabled = false.obs;
  static const _shuffleEnabledPrefsKey = 'rq_radio_shuffle_enabled';
  final Random _shuffleRandom = Random();

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
  /// English meaning of the surah's name, e.g. "The Opening" — parsed from
  /// the chapter's stored translated_name JSON ({language_name, name}).
  final rxCurrentSurahEnglishMeaning = ''.obs;

  // Sleep timer
  final Rx<SleepTimerMode> rxSleepTimerMode = SleepTimerMode.off.obs;
  /// Only meaningful when [rxSleepTimerMode] is [SleepTimerMode.duration].
  final Rxn<DateTime> rxSleepTimerEndsAt = Rxn<DateTime>();
  Timer? _sleepTimer;
  final rxHasAudio = false.obs;
  final rxIsBusy = false.obs;

  // Offline download state, keyed by "reciterId_chapterId"
  final RxSet<String> rxDownloadedKeys = <String>{}.obs;
  final RxMap<String, double> rxDownloadProgress = <String, double>{}.obs;

  // Surah availability for the *currently selected* reciter — some
  // reciters don't host every one of the 114 surahs, and playing a missing
  // one causes a 404 loading flash. Only a confirmed 404/410 lands in this
  // set; timeouts, DNS hiccups, and 5xx are treated as "exists" so a network
  // blip never hides a surah that would actually have played fine.
  final RxSet<int> rxUnavailableSurahIds = <int>{}.obs;
  final RxBool rxIsValidatingAvailability = false.obs;
  final Map<int, Set<int>> _unavailableByReciter = {};
  final Set<int> _availabilityChecksInFlight = {};
  static const _availabilityCacheTtl = Duration(days: 30);

  // Word-by-word highlight sync — the verse/word currently being recited.
  final Rxn<String> rxActiveVerseKey = Rxn<String>();
  final Rxn<int> rxActiveWordPosition = Rxn<int>();

  List<CleanVerseTiming> _timings = [];
  bool _hasWordTiming = false;
  int _lastVerseIdx = -1;
  int? _lastWordPos;
  Timer? _highlightTimer;
  int? _lastSurahId;
  bool _hasPrefetchedNextSurah = false;
  /// Cached lock-screen/notification artwork — generated once per app
  /// launch (see [_prepareLockscreenArt]) and reused for every MediaItem;
  /// null until ready, so the very first track of a session may briefly
  /// show no artwork rather than delay playback waiting for it.
  Uri? _lockscreenArtUri;
  Future<void>? _timingFetchFuture;

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

  String _availabilityPrefsKey(int reciterId) => 'rq_unavailable_surahs_$reciterId';

  Future<Set<int>?> _readCachedUnavailable(int reciterId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_availabilityPrefsKey(reciterId));
      if (raw == null) return null;
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      final checkedAt = DateTime.tryParse(decoded['checkedAt'] as String? ?? '');
      if (checkedAt == null || DateTime.now().difference(checkedAt) > _availabilityCacheTtl) {
        return null; // stale — re-validate rather than trust an old snapshot forever
      }
      return (decoded['unavailable'] as List<dynamic>).map((e) => e as int).toSet();
    } catch (_) {
      return null; // corrupt/missing cache — just re-validate over the network
    }
  }

  Future<void> _writeCachedUnavailable(int reciterId, Set<int> unavailable) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_availabilityPrefsKey(reciterId), jsonEncode({
        'checkedAt': DateTime.now().toIso8601String(),
        'unavailable': unavailable.toList(),
      }));
    } catch (_) {
      // Best-effort cache — a failed write just means we re-validate next launch.
    }
  }

  /// HEAD-probes one surah's mp3. Only an explicit 404/410 counts as
  /// "missing" — any other outcome (timeout, DNS hiccup, 5xx) is treated as
  /// present, so a flaky connection can never hide a surah that would
  /// actually have played fine.
  Future<bool> _probeSurahMissing(String baseUrl, int surahId) async {
    final url = Uri.parse('$baseUrl${surahId.toString().padLeft(3, '0')}.mp3');
    try {
      final response = await http.head(url).timeout(const Duration(seconds: 5));
      return response.statusCode == 404 || response.statusCode == 410;
    } catch (_) {
      return false;
    }
  }

  void _onReciterChangedForAvailability(int reciterId) {
    final cached = _unavailableByReciter[reciterId];
    if (cached != null) {
      rxUnavailableSurahIds.assignAll(cached);
      rxIsValidatingAvailability.value = false;
      return;
    }
    // Fail open while we don't yet know: show every surah rather than
    // hiding the whole list behind a spinner on every reciter switch.
    rxUnavailableSurahIds.clear();
    unawaited(_checkReciterAvailability(reciterId));
  }

  Future<void> _checkReciterAvailability(int reciterId) async {
    if (!_availabilityChecksInFlight.add(reciterId)) return; // already running

    final cached = await _readCachedUnavailable(reciterId);
    if (cached != null) {
      _unavailableByReciter[reciterId] = cached;
      _availabilityChecksInFlight.remove(reciterId);
      if (rxCurrentReciterId.value == reciterId) rxUnavailableSurahIds.assignAll(cached);
      return;
    }

    final reciter = getReciter(reciterId);
    if (reciter.baseUrl.isEmpty) {
      // Nothing to probe — cache "no known-unavailable surahs" so this
      // reciter isn't re-checked on every switch, same as a real result.
      _unavailableByReciter[reciterId] = const <int>{};
      _availabilityChecksInFlight.remove(reciterId);
      if (rxCurrentReciterId.value == reciterId) {
        rxUnavailableSurahIds.clear();
        rxIsValidatingAvailability.value = false;
      }
      return;
    }

    if (rxCurrentReciterId.value == reciterId) rxIsValidatingAvailability.value = true;
    final unavailable = <int>{};
    try {
      // Bounded concurrency: 114 HEAD requests fire in small batches rather
      // than all at once, which is kinder to the CDN and to flaky mobile
      // connections while still finishing in a couple of seconds.
      const chunkSize = 12;
      for (var start = 1; start <= 114; start += chunkSize) {
        final end = (start + chunkSize - 1) > 114 ? 114 : start + chunkSize - 1;
        final results = await Future.wait([
          for (var id = start; id <= end; id++) _probeSurahMissing(reciter.baseUrl, id),
        ]);
        for (var i = 0; i < results.length; i++) {
          if (results[i]) unavailable.add(start + i);
        }
      }
    } finally {
      _unavailableByReciter[reciterId] = unavailable;
      _availabilityChecksInFlight.remove(reciterId);
      unawaited(_writeCachedUnavailable(reciterId, unavailable));
      if (rxCurrentReciterId.value == reciterId) {
        rxUnavailableSurahIds.assignAll(unavailable);
        rxIsValidatingAvailability.value = false;
      }
    }
  }

  /// Next surah id in [forward]/backward order, skipping any confirmed
  /// unavailable for the current reciter. Falls back to the plain wrap-
  /// around if every surah is somehow marked unavailable.
  int nextAvailableSurahId(int currentId, {bool forward = true}) {
    final unavailable = _unavailableByReciter[rxCurrentReciterId.value] ?? const <int>{};
    var next = currentId;
    var guard = 0;
    do {
      next = forward ? (next % 114) + 1 : (next > 1 ? next - 1 : 114);
      guard++;
    } while (unavailable.contains(next) && guard < 114);
    return next;
  }

  @override
  void onInit() {
    super.onInit();

    refreshDownloadedKeys();
    unawaited(_prepareLockscreenArt());
    unawaited(_loadWaveformPreference());
    unawaited(_loadShufflePreference());

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
    ever(rxCurrentReciterId, _onReciterChangedForAvailability);
    _onReciterChangedForAvailability(rxCurrentReciterId.value);

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
      
      // PlaybackState.position already interpolates based on speed and updateTime
      _onPositionTick(state.position);
    });
  }

  void _stopHighlightTimer() {
    _highlightTimer?.cancel();
    _highlightTimer = null;
  }

  @override
  void onClose() {
    _stopHighlightTimer();
    _sleepTimer?.cancel();
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

    // Prefetch next Surah if we reached 90% in Radio mode
    if (!_hasPrefetchedNextSurah && rxIsRadioMode.value) {
      final duration = _audioHandler.mediaItem.value?.duration;
      if (duration != null && duration.inMilliseconds > 0) {
        if (position.inMilliseconds >= duration.inMilliseconds * 0.9) {
          _hasPrefetchedNextSurah = true;
          _prefetchNextSurah();
        }
      } else if (_timings.isNotEmpty) {
        final totalDurationMs = _timings.last.to;
        if (totalDurationMs > 0 && position.inMilliseconds >= totalDurationMs * 0.9) {
          _hasPrefetchedNextSurah = true;
          _prefetchNextSurah();
        }
      }
    }
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
  Future<Map<String, dynamic>?> _fetchAndApplyTimings(int reciterId, int chapterId) async {
    try {
      final audioFile = await _audioRemoteDs.getChapterAudio(reciterId, chapterId);
      if (_lastSurahId == chapterId) {
        _applyTimings(audioFile);
      }
      return audioFile;
    } catch (_) {
      _timings = [];
      _hasWordTiming = false;
      _lastVerseIdx = -1;
      _lastWordPos = null;
      rxActiveVerseKey.value = null;
      rxActiveWordPosition.value = null;
      return null;
    }
  }

  CleanVerseTiming? _findTiming(int verseNumber) {
    for (final t in _timings) {
      if (t.verseNumber == verseNumber) return t;
    }
    return null;
  }


  void _onPlaybackCompleted() {
    // "End of Surah" sleep timer: the track has already stopped at its own
    // end, so honoring it just means *not* doing whatever would normally
    // happen next — auto-advancing in Radio mode, or restarting a repeat
    // loop — rather than an explicit pause() call.
    if (rxSleepTimerMode.value == SleepTimerMode.endOfSurah) {
      _clearSleepTimer();
      return;
    }
    if (rxIsRadioMode.value) {
      final position = _audioHandler.playbackState.value.position;
      final duration = _audioHandler.mediaItem.value?.duration;
      
      // Prevent infinite loop: if playback completed instantly (under 1s) and it's not a short clip,
      // it means the audio failed to play but the player didn't throw a hard error.
      if (position.inMilliseconds < 1000 && (duration == null || duration.inMilliseconds > 1000)) {
        rxRadioFailStreak.value += 1;
        if (rxRadioFailStreak.value >= 2) {
          rxIsRadioMode.value = false;
          rxHasAudio.value = false;
          AppFeedback.showError(
            'Could not play this surah. Check your connection and try again.',
            title: 'Playback error',
          );
          return;
        }
      } else {
        rxRadioFailStreak.value = 0;
      }
      
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

  Future<void> _loadWaveformPreference() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      rxWaveformEnabled.value = prefs.getBool(_waveformEnabledPrefsKey) ?? true;
    } catch (_) {
      // Keep the default (on) if prefs can't be read.
    }
  }

  Future<void> setWaveformEnabled(bool enabled) async {
    rxWaveformEnabled.value = enabled;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_waveformEnabledPrefsKey, enabled);
    } catch (_) {
      // Best-effort — worst case the toggle doesn't survive a restart.
    }
  }

  Future<void> _loadShufflePreference() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      rxShuffleEnabled.value = prefs.getBool(_shuffleEnabledPrefsKey) ?? false;
    } catch (_) {
      // Keep the default (off) if prefs can't be read.
    }
  }

  Future<void> setShuffleEnabled(bool enabled) async {
    rxShuffleEnabled.value = enabled;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_shuffleEnabledPrefsKey, enabled);
    } catch (_) {
      // Best-effort — worst case the toggle doesn't survive a restart.
    }
  }

  /// Random surah id for shuffle mode, excluding known-unavailable ones for
  /// the current reciter and (when possible) [exclude] itself, so shuffle
  /// doesn't immediately repeat the surah that just finished.
  int _randomAvailableSurahId({int? exclude}) {
    final unavailable = _unavailableByReciter[rxCurrentReciterId.value] ?? const <int>{};
    final pool = [
      for (var id = 1; id <= 114; id++)
        if (!unavailable.contains(id) && id != exclude) id,
    ];
    if (pool.isEmpty) {
      // Every surah is unavailable-or-excluded (e.g. only one surah works
      // for this reciter) — fall back to sequential rather than getting
      // stuck with nothing to play.
      return nextAvailableSurahId(exclude ?? rxCurrentSurahId.value);
    }
    return pool[_shuffleRandom.nextInt(pool.length)];
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

  /// Pause and reset to the start — distinct from [pause], which keeps the
  /// current position so resuming continues where the user left off. Keeps
  /// the surah loaded (used by the Now Playing sheet's Stop button).
  Future<void> stopPlayback() async {
    _pauseTimer?.cancel();
    await _audioHandler.pause();
    await _audioHandler.seek(Duration.zero);
  }

  /// Full teardown — tears down the loaded queue and clears every bit of
  /// "something is loaded" state so [rxHasAudio] flips false and the
  /// MiniPlayer disappears immediately. Distinct from [stopPlayback], which
  /// only rewinds; this is for the MiniPlayer's dismiss ("x") button, where
  /// the intent is to get rid of the player entirely, not just restart it.
  Future<void> stop() async {
    _pauseTimer?.cancel();
    _stopHighlightTimer();
    _currentRepeat = 0;
    rxIsRadioMode.value = false;
    rxRadioFailStreak.value = 0;
    _timings = [];
    _hasWordTiming = false;
    _lastVerseIdx = -1;
    _lastWordPos = null;
    rxActiveVerseKey.value = null;
    rxActiveWordPosition.value = null;
    _lastSurahId = null;
    _hasPrefetchedNextSurah = false;
    _clearSleepTimer();
    await _audioHandler.stop();
    rxHasAudio.value = false;
  }

  /// Pauses playback after [duration] of real (wall-clock) time, regardless
  /// of intermediate manual pauses — matches how sleep timers behave in
  /// most audio apps. Replaces any previously scheduled sleep timer.
  void setSleepTimerDuration(Duration duration) {
    _sleepTimer?.cancel();
    rxSleepTimerMode.value = SleepTimerMode.duration;
    rxSleepTimerEndsAt.value = DateTime.now().add(duration);
    _sleepTimer = Timer(duration, () {
      pause();
      _clearSleepTimer();
    });
  }

  /// Stops at the end of whatever is currently playing instead of a fixed
  /// duration — honored in [_onPlaybackCompleted].
  void setSleepTimerEndOfSurah() {
    _sleepTimer?.cancel();
    _sleepTimer = null;
    rxSleepTimerMode.value = SleepTimerMode.endOfSurah;
    rxSleepTimerEndsAt.value = null;
  }

  void cancelSleepTimer() => _clearSleepTimer();

  void _clearSleepTimer() {
    _sleepTimer?.cancel();
    _sleepTimer = null;
    rxSleepTimerMode.value = SleepTimerMode.off;
    rxSleepTimerEndsAt.value = null;
  }

  /// One-shot read of time left on a [SleepTimerMode.duration] timer — null
  /// if no duration timer is active. Not reactive; callers that display it
  /// (e.g. the picker sheet) read it once rather than tick a live countdown.
  Duration? get sleepTimerRemaining {
    final endsAt = rxSleepTimerEndsAt.value;
    if (endsAt == null) return null;
    final remaining = endsAt.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  /// Live playback state (position, playing/buffering, speed) for UI that
  /// needs to render a progress bar — exposed through the controller so
  /// views never need to reach into the underlying [QuranAudioHandler].
  Stream<PlaybackState> get playbackStateStream => _audioHandler.playbackState;
  PlaybackState get currentPlaybackState => _audioHandler.playbackState.value;

  /// The currently loaded media item (carries total duration once known).
  Stream<MediaItem?> get mediaItemStream => _audioHandler.mediaItem;
  MediaItem? get currentMediaItem => _audioHandler.mediaItem.value;

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

  /// [raw] is the chapter's stored JSON, e.g. '{"language_name":"english","name":"The Opening"}'.
  /// Malformed/missing data just yields an empty string rather than throwing.
  String _parseEnglishMeaning(String raw) {
    try {
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      return decoded['name'] as String? ?? '';
    } catch (_) {
      return '';
    }
  }

  Future<void> _updateSurahMetadata(int surahId) async {
    final chapter = await _db.getChapter(surahId);
    if (chapter != null) {
      rxCurrentSurahName.value = chapter.nameSimple;
      rxCurrentSurahNameArabic.value = chapter.nameArabic;
      rxCurrentSurahRevelationPlace.value = chapter.revelationPlace;
      rxCurrentSurahRevelationOrder.value = chapter.revelationOrder;
      rxCurrentSurahVersesCount.value = chapter.versesCount;
      rxCurrentSurahPages.value = chapter.pages;
      rxCurrentSurahEnglishMeaning.value = _parseEnglishMeaning(chapter.translatedName);

      // Attempt to get the first Juz for this Surah
      final verses = await _db.getVersesByChapter(surahId);
      if (verses.isNotEmpty) {
        rxCurrentSurahFirstJuz.value = verses.first.juzNumber;
      }
    }
  }

  Future<void> _prepareLockscreenArt() async {
    _lockscreenArtUri = await _generateLockscreenArt();
  }

  /// Renders the same [ArabesquePainter] pattern used on the Radio tab's
  /// art card to a cached PNG file, for use as MediaItem.artUri — native
  /// lock-screen/notification chrome can't resolve a Flutter asset or
  /// CustomPainter directly, only a real file/network URI. Not tied to the
  /// in-app light/dark theme (no BuildContext here, and lock-screen media
  /// widgets sit on the OS's own dark, blurred backdrop regardless).
  Future<Uri?> _generateLockscreenArt() async {
    try {
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/lockscreen_art.png');
      if (await file.exists()) return file.uri;

      const double size = 512;
      const cardBackground = Color(0xFF151618);
      const gold = Color(0xFFE0AE55);

      final recorder = ui.PictureRecorder();
      final canvas = ui.Canvas(recorder);
      const circleRect = Rect.fromLTWH(0, 0, size, size);

      canvas.drawOval(circleRect, Paint()..color = cardBackground);
      canvas.save();
      canvas.clipPath(Path()..addOval(circleRect));
      ArabesquePainter(color: gold.withValues(alpha: 0.45))
          .paint(canvas, const Size(size, size));
      canvas.restore();

      final picture = recorder.endRecording();
      final image = await picture.toImage(size.toInt(), size.toInt());
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      if (bytes == null) return null;

      await file.writeAsBytes(bytes.buffer.asUint8List());
      return file.uri;
    } catch (_) {
      return null; // Best-effort — a missing lock-screen icon isn't worth failing playback over.
    }
  }

  Future<void> _loadAndPlayChapter(int surahId) async {
    rxIsBusy.value = true;
    _lastSurahId = surahId;
    _hasPrefetchedNextSurah = false;
    try {
      final reciterId = rxCurrentReciterId.value;
      final reciter = getReciter(reciterId);
      final localPath = await _audioRepository.getLocalPath(reciterId, surahId);

      final String audioSource;
      if (localPath != null) {
        audioSource = Uri.file(localPath).toString();
        // Still need timings even if playing from local file
        _timingFetchFuture = _fetchAndApplyTimings(reciterId, surahId);
      } else {
        // Fetch audio url and timings synchronously before playing
        final audioData = await _fetchAndApplyTimings(reciterId, surahId);
        if (audioData != null && audioData['audio_url'] != null) {
          audioSource = audioData['audio_url'] as String;
        } else {
          audioSource = '${reciter.baseUrl}${surahId.toString().padLeft(3, '0')}.mp3';
        }
        _timingFetchFuture = Future.value();
      }

      // Fetched directly (not read off rxCurrentSurahName) since that field
      // updates via a separate reactive listener whose timing isn't
      // guaranteed to have landed yet when this MediaItem is built.
      final chapter = await _db.getChapter(surahId);

      final mediaItem = MediaItem(
        id: audioSource,
        title: chapter != null ? 'Surah ${chapter.nameSimple}' : 'Surah $surahId',
        artist: reciter.name,
        album: 'The Holy Quran',
        artUri: _lockscreenArtUri,
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
        final nextSurah = nextAvailableSurahId(surahId);
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

  /// Auto-advance on track completion — identical to a manual
  /// [radioSkipToNext] tap, kept as a separate name since callers differ.
  Future<void> advanceRadio() async => radioSkipToNext();

  Future<void> radioSkipToNext() async {
    if (!rxIsRadioMode.value) return;
    final nextSurah = rxShuffleEnabled.value
        ? _randomAvailableSurahId(exclude: rxCurrentSurahId.value)
        : nextAvailableSurahId(rxCurrentSurahId.value);
    rxCurrentSurahId.value = nextSurah;
    await _loadAndPlayChapter(nextSurah);
  }

  Future<void> radioSkipToPrevious() async {
    if (!rxIsRadioMode.value) return;
    final prevSurah = nextAvailableSurahId(rxCurrentSurahId.value, forward: false);
    rxCurrentSurahId.value = prevSurah;
    await _loadAndPlayChapter(prevSurah);
  }

  Future<void> _prefetchNextSurah() async {
    final nextSurahId = nextAvailableSurahId(rxCurrentSurahId.value);
    final reciterId = rxCurrentReciterId.value;
    
    // Skip if already fully downloaded offline
    if (isDownloaded(reciterId, nextSurahId)) return;
    
    final reciter = getReciter(reciterId);
    String audioSource = '${reciter.baseUrl}${nextSurahId.toString().padLeft(3, '0')}.mp3';
    
    try {
      final audioData = await _audioRemoteDs.getChapterAudio(reciterId, nextSurahId);
      if (audioData['audio_url'] != null) {
        audioSource = audioData['audio_url'] as String;
      }
    } catch (_) {}
    
    final nextMediaItem = MediaItem(
      id: audioSource,
      album: 'Surah $nextSurahId',
      title: 'Surah $nextSurahId',
    );
    
    // Delegate to the audio handler's detached prefetch player
    unawaited(_audioHandler.prefetchItem(nextMediaItem));
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
      
      // Wait for the background timing fetch to finish so we can actually find the timestamp!
      if (_timingFetchFuture != null) {
        await _timingFetchFuture;
      }
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
