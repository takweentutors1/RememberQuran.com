import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../data/datasources/remote/search_remote_ds.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../app/routes/app_routes.dart';
import '../../../shared/widgets/app_feedback.dart';

class SearchController extends GetxController {
  final SearchRemoteDs _remoteDs;

  /// [client] is optional so the production binding in [app_pages.dart] needs
  /// no change. Pass a mock [http.Client] in tests to avoid real network calls.
  SearchController({http.Client? client})
      : _remoteDs = SearchRemoteDs(client: client ?? http.Client());

  final queryController = TextEditingController();
  final RxString currentQuery = ''.obs;
  
  final RxList<SearchResult> results = <SearchResult>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool hasMore = false.obs;
  final RxInt currentPage = 1.obs;
  
  final RxString error = ''.obs;

  final RxString searchScope = 'all'.obs;

  final RxList<String> recentSearches = <String>[].obs;
  static const String _recentSearchesKey = 'recent_searches';

  Timer? _debounce;

  @override
  void onInit() {
    super.onInit();
    _loadRecentSearches();
  }

  Future<void> _loadRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_recentSearchesKey) ?? [];
      recentSearches.assignAll(list);
    } catch (_) {}
  }

  Future<void> addRecent(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty || trimmed.length < 2) return;

    recentSearches.remove(trimmed);
    recentSearches.insert(0, trimmed);
    if (recentSearches.length > 10) {
      recentSearches.assignAll(recentSearches.sublist(0, 10));
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_recentSearchesKey, recentSearches.toList());
    } catch (_) {}
  }

  Future<void> removeRecent(String query) async {
    recentSearches.remove(query);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_recentSearchesKey, recentSearches.toList());
    } catch (_) {}
  }

  void selectRecent(String query) {
    queryController.text = query;
    queryController.selection = TextSelection.fromPosition(
      TextPosition(offset: query.length),
    );
    onSearchChanged(query);
  }

  void setScope(String scope) {
    if (searchScope.value == scope) return;
    searchScope.value = scope;
    final trimmed = currentQuery.value.trim();
    if (trimmed.length > 2) {
      _performSearch(trimmed, isLoadMore: false);
    }
  }

  @override
  void onClose() {
    _debounce?.cancel();
    queryController.dispose();
    super.onClose();
  }

  void onSearchChanged(String query) {
    currentQuery.value = query;
    final trimmed = query.trim();

    // Check for direct surah:ayah navigation format (e.g., 2:255)
    final directMatch = RegExp(r'^(\d+):(\d+)$').firstMatch(trimmed);
    if (directMatch != null) {
      final surahId = int.tryParse(directMatch.group(1) ?? '');
      final ayahId = int.tryParse(directMatch.group(2) ?? '');
      if (surahId != null && surahId >= 1 && surahId <= 114 && ayahId != null && ayahId >= 1) {
        _debounce?.cancel();
        _jumpToAyah(surahId, ayahId);
        return;
      }
    }

    _debounce?.cancel();
    if (trimmed.length > 2) {
      _debounce = Timer(const Duration(milliseconds: 400), () {
        _performSearch(trimmed, isLoadMore: false);
      });
    } else {
      results.clear();
      hasMore.value = false;
      error.value = '';
    }
  }

  void loadMore() {
    if (hasMore.value && !isLoading.value) {
      _performSearch(currentQuery.value.trim(), isLoadMore: true);
    }
  }

  Future<void> _performSearch(String query, {required bool isLoadMore}) async {
    if (!isLoadMore) {
      currentPage.value = 1;
      results.clear();
    }
    
    isLoading.value = true;
    error.value = '';
    
    try {
      final response = await _remoteDs.searchQuran(
        query,
        page: currentPage.value,
        size: 20,
        scope: searchScope.value,
      );
      
      if (isLoadMore) {
        results.addAll(response.results);
      } else {
        results.value = response.results;
        if (response.results.isNotEmpty) {
          addRecent(query);
        }
      }
      
      hasMore.value = response.nextPage != null;
      if (hasMore.value) {
        currentPage.value = response.nextPage!;
      }
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  void onResultTapped(SearchResult result) {
    Get.toNamed(
      Routes.SURAH_AYAH
          .replaceAll(':surahId', result.chapterId.toString())
          .replaceAll(':ayahId', result.verseNumber.toString()),
    );
  }

  /// Navigates directly to [surahId]:[ayahId] without adding a fake result to
  /// the list. Looks up the surah name from the local Drift DB (via the
  /// already-registered [QuranRepository]) so the toast reads naturally,
  /// e.g. "Jumping to Al-Baqarah, Ayah 255" instead of a raw number pair.
  Future<void> _jumpToAyah(int surahId, int ayahId) async {
    // Resolve surah name from the local DB — QuranRepository is a global
    // singleton registered in main.dart, so Get.find is safe here.
    String surahName = 'Surah $surahId';
    try {
      final repo = Get.find<QuranRepository>();
      final chapter = await repo.getChapter(surahId);
      if (chapter != null) surahName = chapter.nameSimple;
    } catch (_) {
      // DB not ready yet — fall back to the numeric label above.
    }

    AppFeedback.showSuccess(
      'Jumping to $surahName, Ayah $ayahId',
      title: 'Direct Navigation',
    );

    Get.toNamed(
      Routes.SURAH_AYAH
          .replaceAll(':surahId', surahId.toString())
          .replaceAll(':ayahId', ayahId.toString()),
    );
  }
}
