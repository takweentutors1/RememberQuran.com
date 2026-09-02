import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' show Random;
import 'dart:ui' as ui;
import 'package:audio_service/audio_service.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/material.dart' show Color, Path, Paint, Rect, Size;
import 'package:get/get.dart';
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
  Rxn<DateTime> get rxSleepTimerEnd => rxSleepTimerEndsAt;
  final RxnString rxSleepTimerRemaining = RxnString();
  Timer? _sleepTimer;
  Timer? _sleepTimerTicker;
  final rxHasAudio = false.obs;
  final rxIsBusy = false.obs;
  /// True while just_audio is natively buffering (AudioProcessingState.loading
  /// or .buffering). Unlike rxIsBusy, this does NOT block user interaction —
  /// it just drives a subtle indicator on the play button.
  final rxIsBuffering = false.obs;

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

  // Connectivity — drives Radio mode's offline fallback (only cycle through
  // already-downloaded surahs, skip pointless network probing/loading) so
  // airplane mode doesn't just leave playback stuck "loading" forever.
  final RxBool rxIsOffline = false.obs;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  // Word-by-word highlight sync — the verse/word currently being recited.
  final Rxn<String> rxActiveVerseKey = Rxn<String>();
  final Rxn<int> rxActiveWordPosition = Rxn<int>();

  /// Chapter duration reported directly by the qdc audio_files API (already
  /// fetched for timings/word-sync — this is just its `duration` field).
  /// The Radio progress bar prefers this over MediaItem.duration, which
  /// depends on just_audio's own durationStream firing — for a streamed
  /// LockCachingAudioSource that can lag or never fire promptly, leaving
  /// the progress bar stuck at 0:00/0:00 even while audio is audibly
  /// playing. The API already knows the answer up front; no reason to wait
  /// on the player to figure it out too.
  final Rxn<Duration> rxKnownDuration = Rxn<Duration>();

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

  /// Confirms whether a surah is missing for this reciter via the same qdc
  /// API that actually serves playback (see _loadAndPlayChapter) — probing
  /// used to HEAD-request Reciter.baseUrl, a separate hardcoded CDN
  /// (cdn.islamic.network) unrelated to what's actually streamed, so a
  /// surah could be marked available/unavailable based on a CDN the app no
  /// longer plays from. Only a confirmed-empty response counts as
  /// "missing"; any failure (timeout, DNS hiccup, 5xx) is treated as
  /// present, so a flaky connection can never hide a surah that would
  /// actually have played fine.
  Future<bool> _probeSurahMissing(int reciterId, int surahId) async {
    return await _audioRemoteDs.isChapterAudioMissing(reciterId, surahId) ?? false;
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

    // Delay the probe so it doesn't compete with initial audio buffering.
    // The default reciter (Mishary, id=7) has all 114 surahs; skip the network
    // probe entirely and treat him as having no unavailable surahs.
    if (reciterId == defaultReciterId) {
      _unavailableByReciter[reciterId] = const <int>{};
      _availabilityChecksInFlight.remove(reciterId);
      if (rxCurrentReciterId.value == reciterId) {
        rxUnavailableSurahIds.clear();
        rxIsValidatingAvailability.value = false;
      }
      return;
    }

    final cached = await _readCachedUnavailable(reciterId);
    if (cached != null) {
      _unavailableByReciter[reciterId] = cached;
      _availabilityChecksInFlight.remove(reciterId);
      if (rxCurrentReciterId.value == reciterId) rxUnavailableSurahIds.assignAll(cached);
      return;
    }

    // Delay probing by 3s so the initial audio buffering gets priority bandwidth.
    await Future.delayed(const Duration(seconds: 3));
    // If the user switched away from this reciter while we were waiting, skip.
    if (!_availabilityChecksInFlight.contains(reciterId)) return;
    // Offline — 114 HEAD requests would each hang until their own timeout for
    // nothing. Bail without caching a result so this re-runs once connectivity
    // returns (see _initConnectivity).
    if (rxIsOffline.value) {
      _availabilityChecksInFlight.remove(reciterId);
      return;
    }

    if (rxCurrentReciterId.value == reciterId) rxIsValidatingAvailability.value = true;
    final unavailable = <int>{};
    try {
      // Bounded concurrency: 114 qdc API requests fire in small batches
      // rather than all at once, which is kinder to the API and to flaky
      // mobile connections while still finishing in a couple of seconds.
      const chunkSize = 12;
      for (var start = 1; start <= 114; start += chunkSize) {
        final end = (start + chunkSize - 1) > 114 ? 114 : start + chunkSize - 1;
        final results = await Future.wait([
          for (var id = start; id <= end; id++) _probeSurahMissing(reciterId, id),
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
    unawaited(_initConnectivity());

    // Route lock-screen/notification/Bluetooth "skip" taps through the same
    // logic the in-app buttons use, instead of the handler's no-op default
    // (see the doc comment on QuranAudioHandler.onSkipToNext): the next/
    // previous surah in Radio mode, or the next/previous ayah otherwise.
    _audioHandler.onSkipToNext = () async {
      if (rxIsRadioMode.value) {
        await radioSkipToNext();
      } else {
        await skipToNext();
      }
    };
    _audioHandler.onSkipToPrevious = () async {
      if (rxIsRadioMode.value) {
        await radioSkipToPrevious();
      } else {
        await skipToPrevious();
      }
    };

    // Surface load/decode/network failures instead of leaving the user with
    // silent audio and no explanation — this is what used to just print to
    // a console nobody reads.
    _audioHandler.errorStream.listen((PlayerException e) {
      // Radio mode already recovers from a broken track by silently
      // skipping to the next surah (see _loadAndPlayChapter) — surfacing an
      // error here too would just be noise on top of that.
      if (rxIsRadioMode.value) return;
      AppFeedback.showError(
        'Audio failed to load (${e.code}: ${e.message}). Check your connection and try again.',
        title: 'Playback error',
        onRetry: _lastSurahId == null ? null : () => _loadAndPlayChapter(_lastSurahId!),
      );
    });

    // Listen to media item changes (Queue index progression). Repeat used
    // to be driven from here (see _handleRepeatLogic's removal below) but
    // the queue only ever has one MediaItem per chapter (the whole surah's
    // audio is one continuous file, not one file per ayah — see
    // _loadAndPlayChapter), so this index never meaningfully changes
    // mid-surah; repeat is now driven by _onPositionTick instead, which
    // already tracks the actually-playing ayah for word-sync highlighting.
    _audioHandler.mediaItem.listen((item) {
      if (item != null) {
        final queue = _audioHandler.queue.value;
        final idx = queue.indexWhere((q) => q.id == item.id);
        if (idx != -1) {
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

      // Track native buffering so the UI can show a subtle spinner on the
      // play button even after rxIsBusy is cleared (i.e., while AVPlayer
      // is actually fetching enough data to start decoding).
      rxIsBuffering.value =
          state.processingState == AudioProcessingState.loading ||
          state.processingState == AudioProcessingState.buffering;

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

  /// Clears the "an ayah is actively playing" UI state — rxActiveVerseKey/
  /// rxActiveWordPosition, which drive the pause icon and gold highlight on
  /// ayah_block — and makes sure the underlying player is actually paused.
  /// Call this everywhere Radio gives up on playback (rxHasAudio flips to
  /// false due to a failure, as opposed to a normal stop()/pause()) so a
  /// stale highlight can't outlive the player it was describing. Without
  /// this, a Radio session that fails on, say, Al-Fatihah ayah 3 left
  /// rxActiveVerseKey stuck at "1:3" and rxIsPlaying stuck true — so
  /// opening the Reader for that chapter showed ayah 3 with a pause icon
  /// and gold highlight even though rxHasAudio was already false and the
  /// MiniPlayer had disappeared entirely.
  void _resetActiveHighlight() {
    _lastVerseIdx = -1;
    _lastWordPos = null;
    rxActiveVerseKey.value = null;
    rxActiveWordPosition.value = null;
    rxKnownDuration.value = null;
    unawaited(_audioHandler.pause());
  }

  @override
  void onClose() {
    _stopHighlightTimer();
    _sleepTimer?.cancel();
    _sleepTimerTicker?.cancel();
    _connectivitySub?.cancel();
    super.onClose();
  }

  /// Airplane mode / no-signal detection for Radio's offline fallback.
  /// [ConnectivityResult] only reports the OS's network *interface* state
  /// (e.g. "no radio active"), not real internet reachability, but that's
  /// exactly what airplane mode flips off and is enough to stop Radio from
  /// wasting retries on a network it already knows doesn't exist.
  Future<void> _initConnectivity() async {
    try {
      final result = await Connectivity().checkConnectivity();
      rxIsOffline.value = result.every((r) => r == ConnectivityResult.none);
    } catch (_) {
      // Best-effort — assume online if the platform check itself fails.
    }
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final wasOffline = rxIsOffline.value;
      rxIsOffline.value = results.every((r) => r == ConnectivityResult.none);
      // Connection just came back — re-validate this reciter's surah
      // availability now rather than waiting for the next reciter switch.
      if (wasOffline && !rxIsOffline.value) {
        _onReciterChangedForAvailability(rxCurrentReciterId.value);
      }
    });
  }

  /// Drives word-by-word highlight sync — resolves the current verse/word
  /// from raw playback position via word_sync.dart's binary search.
  void _onPositionTick(Duration position) {
    // Background execution safeguard: if an OS Doze or background throttle
    // suspended the Dart Timer, check the timestamp target directly on ticks.
    final endsAt = rxSleepTimerEndsAt.value;
    if (endsAt != null && DateTime.now().isAfter(endsAt)) {
      pause();
      _clearSleepTimer();
      AppFeedback.showInfo(
        'Sleep timer finished recitation.',
        title: 'Sleep Timer',
      );
      return;
    }

    if (_timings.isEmpty) return;
    final t = position.inMilliseconds;

    bool within(int i) => i >= 0 && i < _timings.length && _timings[i].from <= t && t < _timings[i].to;
    var idx = _lastVerseIdx;
    if (!within(idx)) {
      idx = within(idx + 1) ? idx + 1 : findVerseIndex(_timings, t);
    }

    // Repeat interception: this is the same "we've moved on to the next
    // ayah" boundary crossing that would otherwise just update
    // _lastVerseIdx below — intercept it here instead when the ayah being
    // left is the one repeat should hold on. idx > _lastVerseIdx guards
    // against a manual seek backward (also a change in idx) being mistaken
    // for "finished playing forward past the target".
    if (idx != _lastVerseIdx && _lastVerseIdx >= 0 && idx > _lastVerseIdx) {
      if (_tryTriggerRepeat(_lastVerseIdx)) return;
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

    final durationMs = audioFile['duration'] as num?;
    rxKnownDuration.value = durationMs != null ? Duration(milliseconds: durationMs.toInt()) : null;
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
      rxKnownDuration.value = null;
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
    // A chapter load is already in flight (rxIsBusy is true for the whole
    // span of _loadAndPlayChapter, from the first await through
    // waitUntilReady()). The audio engine's playbackState stream can keep
    // re-emitting a stale processingState == completed while that load is
    // still in progress, since nothing moves the player out of "completed"
    // until updateQueue() lands partway through the load. Without this
    // guard, each stale re-emission re-enters this method and calls
    // advanceRadio() again on top of the advance already under way,
    // silently skipping a surah (e.g. Surah 1 -> 3, missing Surah 2).
    if (rxIsBusy.value) return;

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
          _resetActiveHighlight();
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
    // Standard processingState=completed means the whole chapter's audio
    // file finished. That's also how repeat's "the target ayah/range end
    // was the last ayah in the surah" edge case surfaces — there's no
    // "next ayah" position tick to intercept in _onPositionTick when
    // there's nothing left to play, so it has to be caught here instead.
    if (_lastVerseIdx >= 0) _tryTriggerRepeat(_lastVerseIdx);
  }

  /// Checks whether repeat should hold on the ayah at [leavingIdx] instead
  /// of letting playback move past it, and if so schedules the restart.
  /// Returns true if a repeat was triggered (a seek is scheduled/underway),
  /// meaning the caller should not treat this as a normal advance/end.
  ///
  /// Driven by real playback position (via _onPositionTick and, for the
  /// last-ayah-of-surah edge case, _onPlaybackCompleted) rather than the
  /// old queue-index-based approach, which only worked when there was one
  /// MediaItem per ayah. There's exactly one MediaItem per *chapter* (see
  /// _loadAndPlayChapter), so that index never meaningfully changed
  /// mid-surah and repeat never actually triggered before the whole
  /// surah's audio had already finished playing once.
  bool _tryTriggerRepeat(int leavingIdx) {
    final settings = rxRepeatSettings.value;
    if (settings.mode == RepeatMode.none) return false;

    final int restartIdx;
    if (settings.mode == RepeatMode.ayah) {
      restartIdx = leavingIdx;
    } else if (settings.mode == RepeatMode.range &&
        settings.rangeStartIdx != null &&
        settings.rangeEndIdx != null) {
      if (leavingIdx != settings.rangeEndIdx) return false;
      restartIdx = settings.rangeStartIdx!;
    } else {
      return false;
    }

    if (_currentRepeat >= settings.count - 1) {
      _currentRepeat = 0; // Exhausted — let playback continue normally.
      return false;
    }
    _currentRepeat++;
    _scheduleRepeatRestart(restartIdx);
    return true;
  }

  /// Pauses, then seeks back to the start of [verseIdx] and resumes —
  /// after [RepeatSettings.delay] if one is set. Seeks via the verse's
  /// real timestamp (_timings), not the previous no-op skipToQueueItem
  /// (QuranAudioHandler never overrides it, so it silently did nothing —
  /// the repeat looked like it restarted but audio just kept playing from
  /// wherever it already was).
  void _scheduleRepeatRestart(int verseIdx) {
    if (verseIdx < 0 || verseIdx >= _timings.length) return;
    final fromMs = _timings[verseIdx].from;

    _pauseTimer?.cancel();
    unawaited(_audioHandler.pause());

    Future<void> restart() async {
      _lastVerseIdx = -1;
      _lastWordPos = null;
      await _audioHandler.seek(Duration(milliseconds: fromMs));
      rxActiveVerseKey.value = _timings[verseIdx].verseKey;
      rxActiveWordPosition.value = null;
      _playGuarded();
    }

    final delay = rxRepeatSettings.value.delay;
    if (delay > Duration.zero) {
      _pauseTimer = Timer(delay, () => unawaited(restart()));
    } else {
      unawaited(restart());
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

  /// Fires [_audioHandler.play()] without blocking the caller, but — unlike
  /// a bare `unawaited(_audioHandler.play())` — makes sure a failure (dead
  /// network, source error, offline mid-stream) is actually handled instead
  /// of vanishing as an unobserved Future error. just_audio flips its
  /// internal `playing` flag to true the instant play() is called, before
  /// it knows whether the source will actually produce sound, so an
  /// unguarded call leaves the UI (rxIsPlaying, and anything keyed off it
  /// like the per-ayah pause icon) stuck showing "playing" over silence
  /// forever once the underlying request fails.
  void _playGuarded() {
    unawaited(_audioHandler.play().catchError((Object e, StackTrace st) {
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
      if (_audioHandler.playbackState.value.playing) {
        unawaited(_audioHandler.pause());
      }
      AppFeedback.showError(
        rxIsOffline.value
            ? 'You\'re offline and this audio isn\'t downloaded.'
            : 'Playback failed. Check your connection and try again.',
        title: 'Playback error',
      );
    }));
  }

  // Interruption Fix 1: Manual navigation kills active repeat/timer
  Future<void> playAyah(int index) async {
    rxIsRadioMode.value = false;
    _currentRepeat = 0;
    _pauseTimer?.cancel();
    await _audioHandler.skipToQueueItem(index);
    _playGuarded();
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
    _playGuarded();
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
    rxKnownDuration.value = null;
    _lastSurahId = null;
    _hasPrefetchedNextSurah = false;
    _clearSleepTimer();
    await _audioHandler.stop();
    rxHasAudio.value = false;
  }

  /// Sets or clears the sleep timer.
  /// If [duration] is null, cancels any active sleep timer.
  /// If [duration] is provided, pauses audio after the given duration,
  /// ticking [rxSleepTimerRemaining] every second, and notifies the user.
  void setSleepTimer(Duration? duration) {
    if (duration == null) {
      cancelSleepTimer();
      return;
    }
    setSleepTimerDuration(duration);
  }

  /// Pauses playback after [duration] of real (wall-clock) time, regardless
  /// of intermediate manual pauses — matches how sleep timers behave in
  /// most audio apps. Replaces any previously scheduled sleep timer.
  void setSleepTimerDuration(Duration duration) {
    _sleepTimer?.cancel();
    _sleepTimerTicker?.cancel();

    rxSleepTimerMode.value = SleepTimerMode.duration;
    final end = DateTime.now().add(duration);
    rxSleepTimerEndsAt.value = end;
    _updateSleepTimerRemaining(end);

    _sleepTimerTicker = Timer.periodic(const Duration(seconds: 1), (_) {
      final endsAt = rxSleepTimerEndsAt.value;
      if (endsAt == null) {
        _sleepTimerTicker?.cancel();
        _sleepTimerTicker = null;
        rxSleepTimerRemaining.value = null;
        return;
      }
      final rem = endsAt.difference(DateTime.now());
      if (rem.isNegative || rem == Duration.zero) {
        _sleepTimerTicker?.cancel();
        _sleepTimerTicker = null;
        rxSleepTimerRemaining.value = null;
      } else {
        _updateSleepTimerRemaining(endsAt);
      }
    });

    _sleepTimer = Timer(duration, () {
      pause();
      _clearSleepTimer();
      AppFeedback.showInfo(
        'Sleep timer finished recitation.',
        title: 'Sleep Timer',
      );
    });
  }

  void _updateSleepTimerRemaining(DateTime endsAt) {
    final diff = endsAt.difference(DateTime.now());
    if (diff.isNegative) {
      rxSleepTimerRemaining.value = '0:00';
      return;
    }
    final totalSeconds = diff.inSeconds;
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    rxSleepTimerRemaining.value =
        '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  /// Stops at the end of whatever is currently playing instead of a fixed
  /// duration — honored in [_onPlaybackCompleted].
  void setSleepTimerEndOfSurah() {
    _sleepTimer?.cancel();
    _sleepTimerTicker?.cancel();
    _sleepTimer = null;
    _sleepTimerTicker = null;
    rxSleepTimerMode.value = SleepTimerMode.endOfSurah;
    rxSleepTimerEndsAt.value = null;
    rxSleepTimerRemaining.value = 'End of Surah';
  }

  void cancelSleepTimer() => _clearSleepTimer();

  void _clearSleepTimer() {
    _sleepTimer?.cancel();
    _sleepTimerTicker?.cancel();
    _sleepTimer = null;
    _sleepTimerTicker = null;
    rxSleepTimerMode.value = SleepTimerMode.off;
    rxSleepTimerEndsAt.value = null;
    rxSleepTimerRemaining.value = null;
  }

  /// One-shot read of time left on a [SleepTimerMode.duration] timer — null
  /// if no duration timer is active.
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
  
  /// Jumps to the next/previous ayah's timestamp within the chapter that's
  /// currently loaded, using the fetched word-timing data. There's no
  /// per-ayah queue to skip through any more — a chapter's audio is one
  /// continuous file, not one MediaItem per ayah (see _loadAndPlayChapter)
  /// — so a literal _audioHandler.skipToNext()/seekToNext() call has
  /// nothing to jump to and is a silent no-op; these had never actually
  /// worked despite the "Previous/Next ayah" tooltips on the buttons that
  /// call them (MiniPlayer, the reader's Now Playing sheet). A no-op here
  /// too if timings haven't loaded (fetch failed, or this reciter has
  /// none) or we're already at the first/last ayah.
  Future<void> skipToNext() async {
    _pauseTimer?.cancel();
    _currentRepeat = 0;
    await _seekToAdjacentVerse(forward: true);
  }

  Future<void> skipToPrevious() async {
    _pauseTimer?.cancel();
    _currentRepeat = 0;
    await _seekToAdjacentVerse(forward: false);
  }

  Future<void> _seekToAdjacentVerse({required bool forward}) async {
    if (_timings.isEmpty) return;
    final position = _audioHandler.playbackState.value.position.inMilliseconds;
    final currentIdx = _lastVerseIdx >= 0 ? _lastVerseIdx : findVerseIndex(_timings, position);
    final targetIdx = forward ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx < 0 || targetIdx >= _timings.length) return;

    final timing = _timings[targetIdx];
    await _audioHandler.seek(Duration(milliseconds: timing.from));
    _lastVerseIdx = -1;
    _lastWordPos = null;
    rxActiveVerseKey.value = timing.verseKey;
    rxActiveWordPosition.value = null;
    _playGuarded();
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
      final isLocal = localPath != null;

      // Deliberately NOT gating on rxIsOffline here. ConnectivityResult only
      // reports which network *interface* is active, not real internet
      // reachability — it's known to report "none" on iOS Simulators (no
      // real radio hardware) and in other edge cases even while the device
      // has a perfectly working connection. An earlier version of this
      // method pre-emptively refused to even attempt a network load when
      // rxIsOffline was true, which turned that unreliable signal into a
      // hard outage: any false "offline" reading permanently blocked every
      // non-downloaded surah from ever loading. rxIsOffline is now only
      // consulted reactively, in _handleChapterLoadFailure, to pick smarter
      // recovery/wording *after* a load has actually failed for real.
      final String audioSource;
      if (isLocal) {
        audioSource = Uri.file(localPath).toString();
        // Downloaded chapters don't need to wait on this — it's best-effort
        // highlight data, not required for the already-local file to play.
        _timingFetchFuture = _fetchAndApplyTimings(reciterId, surahId);
      } else {
        // Primary source of truth for a *streamed* chapter: Quran.com's own
        // qdc API — the same call already needed for verse timings — also
        // returns audio_url, the canonical file on download.quranicaudio.com
        // (Quran.com's own audio CDN). This used to be discarded in favor of
        // a hardcoded cdn.islamic.network URL built from Reciter.baseUrl: an
        // unofficial, community-run mirror with its own per-reciter path
        // quirks, rate limits, and no relation to the CDN timings actually
        // came from. Falling back to that hardcoded pattern only when the
        // qdc call itself fails keeps some resilience for a brief API outage
        // without making the unofficial mirror the everyday playback path.
        final timingsFuture = _fetchAndApplyTimings(reciterId, surahId);
        _timingFetchFuture = timingsFuture;
        final audioFile = await timingsFuture;
        final officialUrl = audioFile?['audio_url'] as String?;
        audioSource = (officialUrl != null && officialUrl.isNotEmpty)
            ? officialUrl
            : '${reciter.baseUrl}${surahId.toString().padLeft(3, '0')}.mp3';
      }

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

      // Release the busy lock NOW — the play button should flip to its
      // native play/pause state immediately. just_audio surfaces its own
      // AudioProcessingState.buffering while the network stream loads,
      // which the UI already listens to for the progress bar; there is no
      // need to keep rxIsBusy true just to show a spinner.
      rxIsBusy.value = false;

      // Do not await play() itself — it only completes when playback ends —
      // but a failure (dead network mid-flight, unsupported format) still
      // needs to reach the same recovery path a synchronous failure above
      // gets: log it, and in Radio mode retry/advance/tell the user, instead
      // of leaving the UI stuck showing "loaded" with silence. The
      // _lastSurahId guard drops a stale rejection from a chapter the user
      // has already navigated away from.
      unawaited(_audioHandler.play().catchError((Object e, StackTrace st) {
        FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
        if (_lastSurahId == surahId) unawaited(_handleChapterLoadFailure(surahId, e, audioSource));
      }));

      rxRadioFailStreak.value = 0;
    } catch (e) {
      await _handleChapterLoadFailure(surahId, e, 'unknown_url_sync_catch');
    } finally {
      rxIsBusy.value = false;
    }
  }

  /// Shared recovery for a chapter that failed to load or play — reached
  /// both from a synchronous failure in [_loadAndPlayChapter] and from
  /// play()'s async catchError, so a dead-network/offline failure gets the
  /// same retry/advance/error-message treatment regardless of which stage
  /// it actually surfaces at.
  Future<void> _handleChapterLoadFailure(int surahId, [Object? error, String? audioUrl]) async {
    rxRadioFailStreak.value += 1;
    if (!rxIsRadioMode.value) {
      final urlText = audioUrl != null ? '\nURL: $audioUrl' : '';
      AppFeedback.showError(
        rxIsOffline.value
            ? 'You\'re offline and this surah isn\'t downloaded.'
            : 'Could not play this surah ($error).$urlText\nCheck your connection and try again.',
        title: 'Playback error',
        onRetry: () => _loadAndPlayChapter(surahId),
      );
      return;
    }

    // Offline in Radio mode: a plain "next surah" pick would just be
    // another dead network URL. Cycle through downloaded surahs instead so
    // the user can keep listening in airplane mode; only give up if nothing
    // is downloaded at all.
    if (rxIsOffline.value) {
      final nextSurah = _pickNextRadioSurah(forward: true);
      if (nextSurah != null && rxRadioFailStreak.value < 2) {
        rxCurrentSurahId.value = nextSurah;
        await _loadAndPlayChapter(nextSurah);
        return;
      }
      rxIsRadioMode.value = false;
      rxHasAudio.value = false;
      _resetActiveHighlight();
      AppFeedback.showError(
        'You\'re offline. Download surahs to keep listening without a connection.',
        title: 'No offline audio',
        onRetry: () => startRadio(surahId),
      );
      return;
    }

    // Skip at most one broken chapter — never loop through failures indefinitely
    if (rxRadioFailStreak.value < 2) {
      final nextSurah = nextAvailableSurahId(surahId);
      rxCurrentSurahId.value = nextSurah;
      await _loadAndPlayChapter(nextSurah);
    } else {
      // Retry budget exhausted — stop instead of leaving Radio mode stuck
      // "on" with nothing loaded and no feedback.
      rxIsRadioMode.value = false;
      rxHasAudio.value = false;
      _resetActiveHighlight();
      AppFeedback.showError(
        'Could not reach the audio server. Check your connection and try again.',
        title: 'Playback error',
        onRetry: () => startRadio(surahId),
      );
    }
  }

  /// Auto-advance on track completion — identical to a manual
  /// [radioSkipToNext] tap, kept as a separate name since callers differ.
  Future<void> advanceRadio() async => radioSkipToNext();

  /// Manual skip always tries the normal next/previous surah first — same
  /// as if the user picked it from the surah list — rather than pre-judging
  /// connectivity. If that particular surah genuinely fails to load,
  /// _loadAndPlayChapter's own failure handling (_handleChapterLoadFailure)
  /// reactively falls back to a downloaded surah when it turns out we
  /// really are offline. Deciding this upfront off rxIsOffline used to mean
  /// a single bad/false "offline" reading from the OS made every skip tap
  /// refuse to even try the network.
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

  /// Picks a downloaded-only fallback surah once a load has *actually*
  /// failed and we're reacting to a confirmed offline state (see
  /// _handleChapterLoadFailure) — never called pre-emptively, so a stale or
  /// false rxIsOffline reading can no longer block a skip from even trying
  /// the network. Returns null only when nothing is downloaded for this
  /// reciter at all.
  int? _pickNextRadioSurah({required bool forward}) {
    return rxShuffleEnabled.value
        ? _randomDownloadedSurahId(exclude: rxCurrentSurahId.value)
        : _nextDownloadedSurahId(rxCurrentSurahId.value, forward: forward);
  }

  /// Surah ids downloaded for the current reciter, sorted ascending — the
  /// pool Radio draws from when offline.
  List<int> _downloadedSurahIdsForCurrentReciter() {
    final prefix = '${rxCurrentReciterId.value}_';
    final ids = <int>[];
    for (final key in rxDownloadedKeys) {
      if (!key.startsWith(prefix)) continue;
      final id = int.tryParse(key.substring(prefix.length));
      if (id != null) ids.add(id);
    }
    ids.sort();
    return ids;
  }

  /// Next downloaded surah id after/before [currentId], wrapping around —
  /// null if nothing is downloaded for this reciter at all.
  int? _nextDownloadedSurahId(int currentId, {bool forward = true}) {
    final ids = _downloadedSurahIdsForCurrentReciter();
    if (ids.isEmpty) return null;
    if (ids.length == 1) return ids.first;
    final idx = ids.indexOf(currentId);
    if (idx == -1) return forward ? ids.first : ids.last;
    final nextIdx = forward ? (idx + 1) % ids.length : (idx - 1 + ids.length) % ids.length;
    return ids[nextIdx];
  }

  /// Random downloaded surah id, excluding [exclude] when more than one is
  /// available — null if nothing is downloaded for this reciter.
  int? _randomDownloadedSurahId({int? exclude}) {
    final ids = _downloadedSurahIdsForCurrentReciter();
    if (ids.isEmpty) return null;
    final pool = ids.where((id) => id != exclude).toList();
    if (pool.isEmpty) return ids.first;
    return pool[_shuffleRandom.nextInt(pool.length)];
  }

  /// Disabled — QuranAudioHandler.prefetchItem() is a deliberate no-op (see
  /// its doc comment: LockCachingAudioSource caused excessive buffering
  /// delays on iOS; offline caching is handled exclusively by the explicit
  /// download feature instead). This used to still fire a real
  /// getChapterAudio() network call every time Radio crossed 90% of a
  /// surah just to build a MediaItem that was then handed to a function
  /// that does nothing with it — a wasted API call, every surah, forever,
  /// for zero benefit. Left as a stub rather than removing the
  /// _hasPrefetchedNextSurah bookkeeping/call site, so re-enabling real
  /// prefetching later only means filling this back in.
  Future<void> _prefetchNextSurah() async {}

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
      
      // Block here until the player has actually buffered the new source.
      // Without this, seeking right after loading races a still-loading network source
      // and is silently ignored on iOS.
      await _audioHandler.waitUntilReady();
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
    _playGuarded();
  }

  /// Switches reciters. Radio mode already had a picker (RadioView); the
  /// reading-mode "Now Playing" sheet did not, so a chapter played from the
  /// reader had no way to change reciters at all. In Radio mode this
  /// restarts the current surah with the new reciter, matching
  /// RadioView's existing behaviour. Otherwise it reloads whatever chapter
  /// is currently playing with the new reciter's audio and resumes from the
  /// same ayah, so switching reciters mid-recitation doesn't reset you back
  /// to the start of the surah.
  Future<void> changeReciter(int newReciterId) async {
    if (rxCurrentReciterId.value == newReciterId) return;
    rxCurrentReciterId.value = newReciterId;

    if (rxIsRadioMode.value) {
      await startRadio(rxCurrentSurahId.value);
      return;
    }

    final surahId = _lastSurahId;
    if (surahId == null) return;

    final resumeVerseNumber =
        int.tryParse(rxActiveVerseKey.value?.split(':').last ?? '');

    await _loadAndPlayChapter(surahId);
    if (_timingFetchFuture != null) {
      await _timingFetchFuture;
    }

    if (resumeVerseNumber != null) {
      final timing = _findTiming(resumeVerseNumber);
      if (timing != null) {
        await _audioHandler.waitUntilReady();
        await _audioHandler.seek(Duration(milliseconds: timing.from));
        _lastVerseIdx = -1;
        _lastWordPos = null;
        rxActiveVerseKey.value = timing.verseKey;
        rxActiveWordPosition.value = null;
      }
    }
  }
}
