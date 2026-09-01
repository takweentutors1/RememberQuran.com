import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../../../data/datasources/remote/search_remote_ds.dart';
import '../../../app/routes/app_routes.dart';

class SearchController extends GetxController {
  final SearchRemoteDs _remoteDs;
  
  SearchController() : _remoteDs = SearchRemoteDs(client: http.Client());

  final queryController = TextEditingController();
  final RxString currentQuery = ''.obs;
  
  final RxList<SearchResult> results = <SearchResult>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool hasMore = false.obs;
  final RxInt currentPage = 1.obs;
  
  final RxString error = ''.obs;

  @override
  void onClose() {
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
        // Clear previous list and insert immediate direct jump result
        results.value = [
          SearchResult(
            verseKey: '$surahId:$ayahId',
            verseNumber: ayahId,
            chapterId: surahId,
            text: 'Direct navigation to Surah $surahId, Ayah $ayahId',
            highlightedText: 'Jump to $surahId:$ayahId',
            words: [],
            translations: [],
          ),
        ];
        hasMore.value = false;
        error.value = '';
        isLoading.value = false;
        return;
      }
    }

    if (trimmed.length > 2) {
      _performSearch(trimmed, isLoadMore: false);
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
      );
      
      if (isLoadMore) {
        results.addAll(response.results);
      } else {
        results.value = response.results;
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
}
