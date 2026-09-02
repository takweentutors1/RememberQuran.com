import 'dart:async';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/repositories/goals_repository.dart';
import '../../../data/repositories/bookmarks_repository.dart';
import '../../../data/repositories/hifz_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../shared/widgets/app_feedback.dart';
import '../../account/controllers/auth_controller.dart';
import 'reader_settings_controller.dart';

class ReaderController extends GetxController {
  final QuranRepository repository;
  final GoalsRepository _goalsRepository = GoalsRepository();
  final BookmarksRepository _bookmarksRepo = BookmarksRepository();
  final HifzRepository _hifzRepo = HifzRepository();

  ReaderController({required this.repository});

  final Rx<Chapter?> chapter = Rx<Chapter?>(null);
  final verses = <Verse>[].obs;

  final verseWords = <int, List<Word>>{}.obs;
  final verseTranslations = <int, List<VerseTranslation>>{}.obs;

  final RxSet<String> bookmarkedVerses = <String>{}.obs;
  final RxSet<String> memorisedVerses = <String>{}.obs;

  final RxnString resumeBannerMessage = RxnString();
  final RxInt bulkMarkProgress = 0.obs;
  final RxBool isBulkMarking = false.obs;

  final isLoading = true.obs;
  final hasError = false.obs;

  int? _lastChapterId;

  final ItemScrollController itemScrollController = ItemScrollController();
  final ItemPositionsListener itemPositionsListener =
      ItemPositionsListener.create();

  bool _hasScrolledToAyah = false;

  // Tracking state
  int? _focusedAyah;
  int? _minAyah;
  int? _maxAyah;

  int _lastPositionAt = 0;
  Timer? _eventTimer;
  Timer? _dwellTimer;

  static const int PROGRESS_DWELL_MS = 3000;
  static const int POSITION_THROTTLE_MS = 8000;
  static const int EVENT_DEBOUNCE_MS = 15000;

  @override
  void onInit() {
    super.onInit();
    final chapterIdStr = Get.parameters['surahId'];
    if (chapterIdStr != null) {
      final id = int.tryParse(chapterIdStr);
      if (id != null) {
        loadChapter(id);
      }
    }

    ever(verses, (List<Verse> updatedVerses) {
      final targetAyahStr = Get.parameters['ayahId'];
      if (targetAyahStr != null &&
          !_hasScrolledToAyah &&
          updatedVerses.isNotEmpty) {
        final targetAyah = int.tryParse(targetAyahStr);
        if (targetAyah != null) {
          final index = updatedVerses.indexWhere(
            (v) => v.verseNumber == targetAyah,
          );
          if (index != -1) {
            _scrollToIndex(index, smooth: true);
          }
        }
      }
    });

    itemPositionsListener.itemPositions.addListener(_onScrollPositionsChanged);
  }

  /// Re-reads the route's `ayahId` param and scrolls to it. Used when this
  /// controller instance is reused across a SURAH -> SURAH_AYAH navigation
  /// for the same chapter (see AppPages), since onInit() won't rerun.
  void jumpToRouteAyah() {
    final targetAyahStr = Get.parameters['ayahId'];
    if (targetAyahStr == null || verses.isEmpty) return;
    final targetAyah = int.tryParse(targetAyahStr);
    if (targetAyah == null) return;
    final index = verses.indexWhere((v) => v.verseNumber == targetAyah);
    if (index != -1) {
      _scrollToIndex(index, smooth: true);
    }
  }

  /// Always deferred to a post-frame callback: this can be reached
  /// directly from a GetX route binding (_bindReaderController in
  /// app_pages.dart calls jumpToRouteAyah() when a SURAH -> SURAH_AYAH
  /// navigation reuses an existing ReaderController) while GetPageRoute is
  /// still building the widget tree for the new route. Calling jumpTo()
  /// synchronously there trips "setState() called during build" on
  /// ScrollablePositionedList, since the controller is already attached to
  /// the still-mounting frame. A post-frame callback guarantees the jump
  /// runs only once the current build has actually finished, whether this
  /// was called mid-build or from a plain async callback (e.g. the verses
  /// listener in onInit).
  void _scrollToIndex(int index, {bool smooth = false}) {
    void performScroll() {
      if (itemScrollController.isAttached) {
        _hasScrolledToAyah = true;
        if (smooth) {
          itemScrollController.scrollTo(
            index: index,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
          );
        } else {
          itemScrollController.jumpTo(index: index);
        }
      } else {
        Future.delayed(const Duration(milliseconds: 100), () {
          if (itemScrollController.isAttached) {
            _hasScrolledToAyah = true;
            if (smooth) {
              itemScrollController.scrollTo(
                index: index,
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeInOut,
              );
            } else {
              itemScrollController.jumpTo(index: index);
            }
          }
        });
      }
    }

    SchedulerBinding.instance.addPostFrameCallback((_) => performScroll());
  }

  void _onScrollPositionsChanged() {
    final positions = itemPositionsListener.itemPositions.value;
    if (positions.isEmpty || verses.isEmpty) return;

    // Find the item that takes up the most space near the top
    ItemPosition? bestPosition;
    double bestScore = -1;

    for (final pos in positions) {
      final itemHeight = pos.itemTrailingEdge - pos.itemLeadingEdge;
      final visiblePortion =
          min(pos.itemTrailingEdge, 1.0) - max(pos.itemLeadingEdge, 0.0);
      final ratio = itemHeight > 0 ? visiblePortion / itemHeight : 0;

      final centerY =
          (max(pos.itemLeadingEdge, 0.0) + min(pos.itemTrailingEdge, 1.0)) / 2;
      final proximity = max(0.0, 1.0 - (centerY - 0.35).abs());
      final score = (ratio * 0.6) + (proximity * 0.4);

      if (score > bestScore) {
        bestScore = score;
        bestPosition = pos;
      }
    }

    if (bestPosition != null) {
      final index = bestPosition.index;
      if (index >= 0 && index < verses.length) {
        final ayah = verses[index].verseNumber;
        _focusedAyah = ayah;

        _minAyah = _minAyah == null ? ayah : min(_minAyah!, ayah);
        _maxAyah = _maxAyah == null ? ayah : max(_maxAyah!, ayah);

        _startDwellTimer();
      }
    }
  }

  void _startDwellTimer() {
    _dwellTimer?.cancel();
    _dwellTimer = Timer(const Duration(milliseconds: PROGRESS_DWELL_MS), () {
      if (_focusedAyah != null) {
        _patchPosition();
        _scheduleEvent();
      }
    });
  }

  Future<void> _patchPosition() async {
    if (_focusedAyah == null || chapter.value == null) return;
    final now = DateTime.now().millisecondsSinceEpoch;
    if (now - _lastPositionAt < POSITION_THROTTLE_MS) return;

    _lastPositionAt = now;
    final authController = Get.find<AuthController>();
    final user = authController.firebaseUser.value;
    if (user == null) return;

    final verseKey = '${chapter.value!.id}:$_focusedAyah';

    try {
      await FirebaseFirestore.instance.collection('users').doc(user.uid).update(
        {
          'lastPosition': {
            'verseKey': verseKey,
            'surahId': chapter.value!.id,
            'ayahId': _focusedAyah,
            'updatedAt': FieldValue.serverTimestamp(),
          },
        },
      );
    } catch (e) {
      FirebaseCrashlytics.instance.recordError(e, null, fatal: false);
    }
  }

  Future<void> _putEvent() async {
    final from = _minAyah;
    final to = _maxAyah;
    if (from == null || to == null || chapter.value == null) return;

    final authController = Get.find<AuthController>();
    final user = authController.firebaseUser.value;
    if (user == null) return;

    try {
      await _goalsRepository.recordProgressEvent(
        user.uid,
        chapter.value!.id,
        from,
        to,
      );
    } catch (e) {
      // Silent
    }
  }

  void _scheduleEvent() {
    _eventTimer?.cancel();
    _eventTimer = Timer(const Duration(milliseconds: EVENT_DEBOUNCE_MS), () {
      _putEvent();
    });
  }

  /// Awaitable flush of any pending (debounced) progress event. GetX's
  /// onClose() is synchronous, so its own flush (below) is necessarily
  /// fire-and-forget — a user who finishes reading and immediately opens
  /// Goals can reach GoalsController.loadGoalData() before that write has
  /// actually landed, showing a streak/progress snapshot that doesn't yet
  /// reflect what they just read. SurahReaderView calls this from a
  /// PopScope and awaits it before letting the back-navigation complete, so
  /// leaving the reader can no longer race the write that's supposed to
  /// happen first.
  Future<void> flushPendingProgress() async {
    if (_eventTimer == null) return;
    _eventTimer!.cancel();
    _eventTimer = null;
    await _putEvent();
  }

  Future<void> loadChapter(int chapterId) async {
    _lastChapterId = chapterId;
    _hasScrolledToAyah = false;
    final recoveringFromError = hasError.value;
    isLoading.value = true;
    hasError.value = false;
    try {
      if (Get.isRegistered<ReaderSettingsController>()) {
        final settings = Get.find<ReaderSettingsController>();
        settings.clearRevealedAyahs();
        settings.loadHifzRange(chapterId);
      }

      chapter.value = await repository.getChapter(chapterId);
      final fetchedVerses = await repository.getVerses(chapterId);
      verses.value = fetchedVerses;

      resumeBannerMessage.value = null;
      final user = Get.find<AuthController>().firebaseUser.value;
      final requestedAyahStr = Get.parameters['ayahId'];
      if (requestedAyahStr == null && user != null && fetchedVerses.isNotEmpty) {
        _checkAndResumeLastPosition(user.uid, chapterId, fetchedVerses);
      }

      final Map<int, List<Word>> wMap = {};
      final Map<int, List<VerseTranslation>> tMap = {};

      for (final v in fetchedVerses) {
        wMap[v.id] = await repository.getVerseWords(v.id);
        tMap[v.id] = await repository.getVerseTranslations(v.id);
      }

      verseWords.assignAll(wMap);
      verseTranslations.assignAll(tMap);

      // Load bookmarks for this chapter
      if (user != null) {
        final bList = await _bookmarksRepo.listBookmarks(
          user.uid,
          surahPrefix: chapterId,
        );
        bookmarkedVerses.assignAll(bList.map((e) => e.verseKey));

        final mList = await _hifzRepo.listMemorisedAyahs(
          user.uid,
          surahId: chapterId,
        );
        memorisedVerses.assignAll(mList.map((e) => e.verseKey));
      }

      if (recoveringFromError) {
        AppFeedback.showSuccess(
          "You're back — the surah loaded fine.",
          title: 'Reconnected',
        );
      }
    } catch (e, st) {
      hasError.value = true;
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
    } finally {
      isLoading.value = false;
    }
  }

  /// Checks Firestore for user's last read position in this surah and smoothly
  /// scrolls to it with a feedback toast.
  Future<void> _checkAndResumeLastPosition(
    String uid,
    int chapterId,
    List<Verse> fetchedVerses,
  ) async {
    try {
      final doc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
      if (!doc.exists) return;
      final data = doc.data();
      if (data == null) return;
      final lastPos = data['lastPosition'];
      if (lastPos is Map<String, dynamic>) {
        final lastSurahId = lastPos['surahId'] as int?;
        final lastAyahId = lastPos['ayahId'] as int?;
        if (lastSurahId == chapterId && lastAyahId != null && lastAyahId > 1) {
          final targetIndex = fetchedVerses.indexWhere((v) => v.verseNumber == lastAyahId);
          if (targetIndex != -1) {
            _scrollToIndex(targetIndex, smooth: true);
            resumeBannerMessage.value = 'Resumed from Ayah $lastAyahId';
          }
        }
      }
    } catch (e, st) {
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
    }
  }

  void dismissResumeBanner() {
    resumeBannerMessage.value = null;
  }

  /// Toggles the bookmark on [verseKey]. [collectionId] only matters for
  /// the create path (removal always just deletes wherever it is) — pass
  /// the id the user picked in CollectionPickerSheet, or leave it null to
  /// save straight to Favourites (createBookmark's own default).
  Future<void> toggleBookmark(String verseKey, {String? collectionId}) async {
    final user = Get.find<AuthController>().firebaseUser.value;
    if (user == null) {
      AppFeedback.showError('Please sign in to save your bookmarks.');
      return;
    }

    final isBookmarked = bookmarkedVerses.contains(verseKey);
    if (isBookmarked) {
      bookmarkedVerses.remove(verseKey);
      final success = await _bookmarksRepo.deleteBookmark(user.uid, verseKey);
      if (success) {
        AppFeedback.showSuccess('Bookmark successfully removed.');
      } else {
        bookmarkedVerses.add(verseKey); // Rollback
        AppFeedback.showError(
          'We couldn\'t remove this bookmark. Please try again.',
        );
      }
    } else {
      bookmarkedVerses.add(verseKey);
      final res = await _bookmarksRepo.createBookmark(
        user.uid,
        verseKey,
        collectionId,
      );
      if (res['ok'] == true) {
        AppFeedback.showSuccess('Ayah successfully bookmarked!');
      } else {
        bookmarkedVerses.remove(verseKey); // Rollback
        AppFeedback.showError(
          'Unable to save this bookmark. Please try again.',
        );
      }
    }
  }

  /// Toggles whether [verseKey] is marked memorised in the user's Hifz
  /// progress tracker. That tracker (HifzController/HifzRepository) was
  /// already fully built — storage, per-surah/per-juz percentages, and a
  /// dedicated progress screen — but nothing anywhere ever called
  /// markMemorised/unmarkMemorised, so it could only ever show 0%. This is
  /// the missing write path.
  Future<void> toggleMemorised(
    String verseKey,
    int surahId,
    int ayahId,
  ) async {
    final user = Get.find<AuthController>().firebaseUser.value;
    if (user == null) {
      AppFeedback.showError('Please sign in to track memorised ayahs.');
      return;
    }

    final isMemorised = memorisedVerses.contains(verseKey);
    if (isMemorised) {
      memorisedVerses.remove(verseKey);
      final success = await _hifzRepo.unmarkMemorised(user.uid, verseKey);
      if (success) {
        AppFeedback.showSuccess('Ayah unmarked as memorised.');
      } else {
        memorisedVerses.add(verseKey); // Rollback
        AppFeedback.showError(
          'We couldn\'t update this. Please try again.',
        );
      }
    } else {
      memorisedVerses.add(verseKey);
      HapticFeedback.lightImpact();
      final res = await _hifzRepo.markMemorised(
        user.uid,
        verseKey,
        surahId,
        ayahId,
      );
      if (res.ok) {
        AppFeedback.showSuccess('Ayah marked as memorised!');
      } else {
        memorisedVerses.remove(verseKey); // Rollback
        AppFeedback.showError(
          res.error == 'limit-reached'
              ? 'You\'ve reached the maximum number of memorised ayahs.'
              : 'Unable to update this. Please try again.',
        );
      }
    }
  }

  /// Bulk marks all ayahs in the range [from]..[to] (inclusive) as memorised.
  Future<void> markRangeMemorised(int surahId, int from, int to) async {
    final user = Get.find<AuthController>().firebaseUser.value;
    if (user == null) {
      AppFeedback.showError('Please sign in to track memorised ayahs.');
      return;
    }

    if (from > to) {
      final tmp = from;
      from = to;
      to = tmp;
    }

    isBulkMarking.value = true;
    bulkMarkProgress.value = 0;
    final total = to - from + 1;
    int successCount = 0;
    bool limitReached = false;

    try {
      for (int i = from; i <= to; i++) {
        final verseKey = '$surahId:$i';
        if (!memorisedVerses.contains(verseKey)) {
          final res = await _hifzRepo.markMemorised(
            user.uid,
            verseKey,
            surahId,
            i,
          );
          if (res.ok) {
            memorisedVerses.add(verseKey);
            successCount++;
          } else if (res.error == 'limit-reached') {
            limitReached = true;
            break;
          }
        } else {
          successCount++;
        }
        bulkMarkProgress.value = ((i - from + 1) / total * 100).round();
      }

      if (limitReached) {
        AppFeedback.showError(
          'Memorisation limit reached. Marked $successCount of $total ayahs.',
          title: 'Limit Reached',
        );
      } else {
        AppFeedback.showSuccess(
          'Marked Ayahs $from–$to as memorised ($successCount total).',
          title: 'Range Memorised',
        );
      }
    } catch (e, st) {
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
      AppFeedback.showError('Could not finish marking range. Please try again.');
    } finally {
      isBulkMarking.value = false;
      bulkMarkProgress.value = 0;
    }
  }

  /// Re-runs the last chapter load — used by the reader's error state retry button.
  void retryLoadChapter() {
    final chapterId = _lastChapterId;
    if (chapterId != null) {
      loadChapter(chapterId);
    }
  }

  @override
  void onClose() {
    itemPositionsListener.itemPositions.removeListener(
      _onScrollPositionsChanged,
    );
    _dwellTimer?.cancel();
    if (_eventTimer != null) {
      _eventTimer!.cancel();
      _putEvent();
    }
    super.onClose();
  }
}
