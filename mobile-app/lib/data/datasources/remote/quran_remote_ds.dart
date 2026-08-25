import 'package:dio/dio.dart';
import '../../../core/models/translation.dart';

class QuranRemoteDataSource {
  static const String chaptersBaseUrl = 'https://api.quran.com/api/v4';
  static const String versesBaseUrl = 'https://api.qurancdn.com/api/qdc';
  static const String khattabCdnUrl = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-mustafakhattaba';

  static const String wordFields = 'text_uthmani,qpc_uthmani_hafs,translation,audio_url,transliteration,text_uthmani_tajweed';
  static const String verseFields = 'text_uthmani,qpc_uthmani_hafs,verse_key,verse_number,page_number,juz_number,hizb_number';
  static const int versesPerPage = 50;
  static const int clearQuranId = TranslationIds.clearQuran;

  final Dio dio;

  QuranRemoteDataSource({required this.dio});

  /// All 114 chapters
  Future<List<dynamic>> getChapters() async {
    final response = await dio.get('$chaptersBaseUrl/chapters');
    return response.data['chapters'] as List<dynamic>;
  }

  /// Single chapter metadata
  Future<Map<String, dynamic>> getChapter(int id) async {
    final response = await dio.get('$chaptersBaseUrl/chapters/$id');
    return response.data['chapter'] as Map<String, dynamic>;
  }

  /// Khattab translation for a chapter, keyed by ayah number
  Future<Map<int, String>> getKhattabChapter(int chapterId) async {
    try {
      final response = await dio.get('$khattabCdnUrl/$chapterId.json');
      final chapterData = response.data['chapter'] as List<dynamic>;
      return {
        for (var v in chapterData) 
          v['verse'] as int: v['text'] as String
      };
    } catch (e) {
      return {};
    }
  }

  /// Saheeh International embeds <sup foot_note=…> markers — render plain text
  String _stripHtml(String text) {
    return text
        .replaceAll(RegExp(r'<sup[^>]*>.*?<\/sup>'), '')
        .replaceAll(RegExp(r'<[^>]+>'), '')
        .trim();
  }

  Map<String, dynamic> _sanitizeVerse(Map<String, dynamic> verse) {
    if (verse['translations'] != null) {
      final translations = verse['translations'] as List<dynamic>;
      verse['translations'] = translations.map((t) {
        final tMap = Map<String, dynamic>.from(t);
        tMap['text'] = _stripHtml(tMap['text']?.toString() ?? '');
        return tMap;
      }).toList();
    }
    return verse;
  }

  Map<String, dynamic> _mergeKhattab(Map<String, dynamic> verse, Map<int, String> khattab) {
    final verseNumber = verse['verse_number'] as int;
    final text = khattab[verseNumber];
    
    if (text != null) {
      final translations = List<Map<String, dynamic>>.from(verse['translations'] ?? []);
      translations.add({'resource_id': clearQuranId, 'text': text});
      verse['translations'] = translations;
    }
    
    return verse;
  }

  /// Drop duplicate wire weight
  Map<String, dynamic> _slimVerse(Map<String, dynamic> verse) {
    if (verse['words'] != null) {
      final words = verse['words'] as List<dynamic>;
      verse['words'] = words.map((w) {
        final wMap = Map<String, dynamic>.from(w);
        return _slimWord(wMap);
      }).toList();
    }
    return verse;
  }

  Map<String, dynamic> _slimWord(Map<String, dynamic> word) {
    final hasQpc = word['qpc_uthmani_hafs']?.toString().isNotEmpty == true;
    final translation = word['translation'] as Map<String, dynamic>?;
    final transliteration = word['transliteration'] as Map<String, dynamic>?;

    final slim = <String, dynamic>{
      'id': word['id'],
      'position': word['position'],
      'audio_url': word['audio_url'],
      'char_type_name': word['char_type_name'],
      'text_uthmani': hasQpc ? '' : (word['text_uthmani'] ?? ''),
      if (hasQpc) 'qpc_uthmani_hafs': word['qpc_uthmani_hafs'],
      if (word['text_uthmani_tajweed']?.toString().isNotEmpty == true) 
        'text_uthmani_tajweed': word['text_uthmani_tajweed'],
      'translation': {
        'text': translation?['text'] ?? '',
        'language_name': translation?['language_name'] ?? 'english',
      },
    };

    if (transliteration != null && transliteration['text']?.toString().isNotEmpty == true) {
      slim['transliteration'] = {
        'text': transliteration['text'],
        'language_name': transliteration['language_name'] ?? 'english',
      };
    }

    return slim;
  }

  /// One page of verses (max 50)
  Future<Map<String, dynamic>> getVerses(
    int chapterId, {
    List<int> translations = const [],
    int page = 1,
  }) async {
    final queryParams = <String, dynamic>{
      'words': 'true',
      'word_fields': wordFields,
      'fields': verseFields,
      'per_page': versesPerPage.toString(),
      'page': page.toString(),
    };

    final apiTranslationIds = toApiTranslationIds(translations);
    if (apiTranslationIds.isNotEmpty) {
      queryParams['translations'] = apiTranslationIds.join(',');
    }

    final response = await dio.get(
      '$versesBaseUrl/verses/by_chapter/$chapterId',
      queryParameters: queryParams,
    );
    
    final data = response.data as Map<String, dynamic>;
    final verses = data['verses'] as List<dynamic>;
    data['verses'] = verses.map((v) => _sanitizeVerse(Map<String, dynamic>.from(v))).toList();
    
    return data;
  }

  /// One page with Clear Quran merge + slim payload
  Future<Map<String, dynamic>> getVersesPage(
    int chapterId, {
    int page = 1,
    List<int> translations = const [],
  }) async {
    final wantsKhattab = translations.contains(clearQuranId);

    final results = await Future.wait([
      getVerses(chapterId, translations: translations, page: page),
      if (wantsKhattab) 
        getKhattabChapter(chapterId)
      else 
        Future.value(<int, String>{})
    ]);

    final data = results[0] as Map<String, dynamic>;
    final khattab = (results.length > 1 ? results[1] : <int, String>{}) as Map<int, String>;

    final verses = data['verses'] as List<dynamic>;
    
    data['verses'] = verses.map((v) {
      var verseMap = Map<String, dynamic>.from(v);
      if (wantsKhattab && khattab.isNotEmpty) {
        verseMap = _mergeKhattab(verseMap, khattab);
      }
      return _slimVerse(verseMap);
    }).toList();

    return data;
  }

  /// Single verse by key e.g. "2:255"
  Future<Map<String, dynamic>> getVerseByKey(
    String verseKey, {
    List<int> translations = const [],
  }) async {
    final queryParams = <String, dynamic>{
      'words': 'true',
      'word_fields': wordFields,
      'fields': verseFields,
    };

    final apiTranslationIds = toApiTranslationIds(translations);
    if (apiTranslationIds.isNotEmpty) {
      queryParams['translations'] = apiTranslationIds.join(',');
    }

    final chapterId = int.tryParse(verseKey.split(':').first) ?? 1;
    final wantsKhattab = translations.contains(clearQuranId);

    final results = await Future.wait([
      dio.get(
        '$versesBaseUrl/verses/by_key/$verseKey',
        queryParameters: queryParams,
      ),
      if (wantsKhattab) 
        getKhattabChapter(chapterId)
      else 
        Future.value(<int, String>{})
    ]);

    final response = results[0] as Response;
    final khattab = (results.length > 1 ? results[1] : <int, String>{}) as Map<int, String>;

    var verseMap = _sanitizeVerse(Map<String, dynamic>.from(response.data['verse']));
    
    if (wantsKhattab && khattab.isNotEmpty) {
      verseMap = _mergeKhattab(verseMap, khattab);
    }

    return verseMap;
  }
}
