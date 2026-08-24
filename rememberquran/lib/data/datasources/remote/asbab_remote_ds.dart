import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

class AsbabRemoteDataSource {
  final String _baseUrl = 'https://rememberquran.com/api/asbab';
  static Map<String, dynamic>? _indexCache;

  Future<void> _loadIndexIfNeeded() async {
    if (_indexCache != null) return;
    try {
      final jsonString = await rootBundle.loadString('assets/data/asbab-index.json');
      _indexCache = jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      _indexCache = {'coverage': {}, 'redirects': {}};
    }
  }

  Future<bool> hasAsbab(int surahId, int ayahId) async {
    await _loadIndexIfNeeded();
    final coverage = _indexCache?['coverage'] as Map<String, dynamic>?;
    final redirects = _indexCache?['redirects'] as Map<String, dynamic>?;
    
    final verseKey = '$surahId:$ayahId';
    if (redirects?.containsKey(verseKey) ?? false) {
      return true;
    }
    
    final surahCoverage = coverage?[surahId.toString()] as List<dynamic>?;
    if (surahCoverage != null && surahCoverage.contains(ayahId)) {
      return true;
    }
    
    return false;
  }

  Future<Map<String, dynamic>> getAsbab(int surahId, int ayahId) async {
    final url = Uri.parse('$_baseUrl/$surahId/$ayahId');
    final response = await http.get(url, headers: {'Accept': 'application/json'});
    
    if (response.statusCode != 200) {
      throw Exception('Asbab API error ${response.statusCode} ${response.reasonPhrase}');
    }
    
    final data = jsonDecode(response.body);
    return data as Map<String, dynamic>;
  }
}
