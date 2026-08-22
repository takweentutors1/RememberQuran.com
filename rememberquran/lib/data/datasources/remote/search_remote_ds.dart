import 'dart:convert';
import 'package:http/http.dart' as http;

class SearchWord {
  final String text;
  final bool highlight;

  const SearchWord({required this.text, required this.highlight});

  factory SearchWord.fromJson(Map<String, dynamic> json) {
    return SearchWord(
      text: json['text'] as String,
      highlight: json['highlight'] as bool? ?? false,
    );
  }
}

class SearchTranslation {
  final int resourceId;
  final String text;

  const SearchTranslation({required this.resourceId, required this.text});

  factory SearchTranslation.fromJson(Map<String, dynamic> json) {
    return SearchTranslation(
      resourceId: json['resource_id'] as int,
      text: json['text'] as String,
    );
  }
}

class SearchResult {
  final String verseKey;
  final int chapterId;
  final int verseNumber;
  final List<SearchWord> words;
  final List<SearchTranslation> translations;

  const SearchResult({
    required this.verseKey,
    required this.chapterId,
    required this.verseNumber,
    required this.words,
    required this.translations,
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      verseKey: json['verse_key'] as String,
      chapterId: json['chapter_id'] as int,
      verseNumber: json['verse_number'] as int,
      words: (json['words'] as List?)
              ?.map((e) => SearchWord.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      translations: (json['translations'] as List?)
              ?.map((e) => SearchTranslation.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class SearchResponse {
  final List<SearchResult> results;
  final int totalCount;
  final int currentPage;
  final int? nextPage;

  const SearchResponse({
    required this.results,
    required this.totalCount,
    required this.currentPage,
    this.nextPage,
  });

  factory SearchResponse.fromJson(Map<String, dynamic> json) {
    return SearchResponse(
      results: (json['results'] as List?)
              ?.map((e) => SearchResult.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      totalCount: json['totalCount'] as int? ?? 0,
      currentPage: json['currentPage'] as int? ?? 1,
      nextPage: json['nextPage'] as int?,
    );
  }
}

class SearchRemoteDs {
  final String _baseUrl = 'https://rememberquran.com/api/search';
  final http.Client client;

  SearchRemoteDs({required this.client});

  Future<SearchResponse> searchQuran(String q, {int page = 1, int size = 20}) async {
    final uri = Uri.parse('$_baseUrl?q=${Uri.encodeQueryComponent(q)}&size=$size&page=$page');
    final response = await client.get(
      uri,
      headers: {'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw Exception('Search failed (${response.statusCode})');
    }

    final data = json.decode(response.body);
    return SearchResponse.fromJson(data);
  }
}
