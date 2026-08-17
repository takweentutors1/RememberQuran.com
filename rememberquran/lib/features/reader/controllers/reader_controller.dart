import 'dart:async';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:get/get.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/repositories/goals_repository.dart';
import '../../../data/repositories/bookmarks_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../shared/widgets/app_feedback.dart';
import '../../account/controllers/auth_controller.dart';
import 'reader_settings_controller.dart';

class ReaderController extends GetxController {
  final QuranRepository repository;
  final GoalsRepository _goalsRepository = GoalsRepository();
  final BookmarksRepository _bookmarksRepo = BookmarksRepository();
  
  ReaderController({required this.repository});

  final Rx<Chapter?> chapter = Rx<Chapter?>(null);
  final verses = <Verse>[].obs;
  
  final verseWords = <int, List<Word>>{}.obs;
  final verseTranslations = <int, List<VerseTranslation>>{}.obs;
  
  final RxSet<String> bookmarkedVerses = <String>{}.obs;

  final isLoading = true.obs;
  final hasError = false.obs;

  int? _lastChapterId;

  final ItemScrollController itemScrollController = ItemScrollController();
  final ItemPositionsListener itemPositionsListener = ItemPositionsListener.create();
  
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
      if (targetAyahStr != null && !_hasScrolledToAyah && updatedVerses.isNotEmpty) {
        final targetAyah = int.tryParse(targetAyahStr);
        if (targetAyah != null) {
          final index = updatedVerses.indexWhere((v) => v.verseNumber == targetAyah);
          if (index != -1) {
            _scrollToIndex(index);
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
      _scrollToIndex(index);
    }
  }

  void _scrollToIndex(int index) {
    if (itemScrollController.isAttached) {
      _hasScrolledToAyah = true;
      itemScrollController.jumpTo(index: index);
    } else {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (itemScrollController.isAttached) {
          _hasScrolledToAyah = true;
          itemScrollController.jumpTo(index: index);
        }
      });
    }
  }

  void _onScrollPositionsChanged() {
    final positions = itemPositionsListener.itemPositions.value;
    if (positions.isEmpty || verses.isEmpty) return;

    // Find the item that takes up the most space near the top
    ItemPosition? bestPosition;
    double bestScore = -1;

    for (final pos in positions) {
      final itemHeight = pos.itemTrailingEdge - pos.itemLeadingEdge;
      final visiblePortion = min(pos.itemTrailingEdge, 1.0) - max(pos.itemLeadingEdge, 0.0);
      final ratio = itemHeight > 0 ? visiblePortion / itemHeight : 0;
      
      final centerY = (max(pos.itemLeadingEdge, 0.0) + min(pos.itemTrailingEdge, 1.0)) / 2;
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
      await FirebaseFirestore.instance.collection('users').doc(user.uid).update({
        'lastPosition': {
          'verseKey': verseKey,
          'surahId': chapter.value!.id,
          'ayahId': _focusedAyah,
          'updatedAt': FieldValue.serverTimestamp(),
        }
      });
    } catch (e) {
      // Silent failure
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
      await _goalsRepository.recordProgressEvent(user.uid, chapter.value!.id, from, to);
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

  Future<void> loadChapter(int chapterId) async {
    _lastChapterId = chapterId;
    final recoveringFromError = hasError.value;
    isLoading.value = true;
    hasError.value = false;
    try {
      if (Get.isRegistered<ReaderSettingsController>()) {
        Get.find<ReaderSettingsController>().clearRevealedAyahs();
      }

      chapter.value = await repository.getChapter(chapterId);
      final fetchedVerses = await repository.getVerses(chapterId);
      verses.value = fetchedVerses;

      final Map<int, List<Word>> wMap = {};
      final Map<int, List<VerseTranslation>> tMap = {};

      for (final v in fetchedVerses) {
        wMap[v.id] = await repository.getVerseWords(v.id);
        tMap[v.id] = await repository.getVerseTranslations(v.id);
      }

      verseWords.assignAll(wMap);
      verseTranslations.assignAll(tMap);

      // Load bookmarks for this chapter
      final user = Get.find<AuthController>().firebaseUser.value;
      if (user != null) {
        final bList = await _bookmarksRepo.listBookmarks(user.uid, surahPrefix: chapterId);
        bookmarkedVerses.assignAll(bList.map((e) => e.verseKey));
      }

      if (recoveringFromError) {
        AppFeedback.showSuccess("You're back — the surah loaded fine.", title: 'Reconnected');
      }
    } catch (e, st) {
      hasError.value = true;
      FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleBookmark(String verseKey) async {
    final user = Get.find<AuthController>().firebaseUser.value;
    if (user == null) {
      AppFeedback.showError('Please sign in to save bookmarks');
      return;
    }
    
    final isBookmarked = bookmarkedVerses.contains(verseKey);
    if (isBookmarked) {
      bookmarkedVerses.remove(verseKey);
      final success = await _bookmarksRepo.deleteBookmark(user.uid, verseKey);
      if (success) {
        AppFeedback.showSuccess('Bookmark removed');
      } else {
        bookmarkedVerses.add(verseKey); // Rollback
        AppFeedback.showError('Failed to remove bookmark');
      }
    } else {
      bookmarkedVerses.add(verseKey);
      final res = await _bookmarksRepo.createBookmark(user.uid, verseKey, null);
      if (res['ok'] == true) {
        AppFeedback.showSuccess('Bookmark added');
      } else {
        bookmarkedVerses.remove(verseKey); // Rollback
        AppFeedback.showError('Failed to add bookmark');
      }
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
    itemPositionsListener.itemPositions.removeListener(_onScrollPositionsChanged);
    _dwellTimer?.cancel();
    if (_eventTimer != null) {
      _eventTimer!.cancel();
      _putEvent();
    }
    super.onClose();
  }
}
