import 'dart:convert';
import 'package:http/http.dart' as http;

class TafsirRemoteDataSource {
  final String _baseUrl = 'https://remember-quran-com.vercel.app/api/tafsir';

  Future<Map<String, dynamic>> getTafsir(String slug, int surahId, int ayahId) async {
    final url = Uri.parse('$_baseUrl/$slug/$surahId/$ayahId');
    final response = await http.get(url, headers: {'Accept': 'application/json'});
    
    if (response.statusCode != 200) {
      throw Exception('Tafsir API error ${response.statusCode} ${response.reasonPhrase}');
    }
    
    final data = jsonDecode(response.body);
    return data as Map<String, dynamic>;
  }
}
