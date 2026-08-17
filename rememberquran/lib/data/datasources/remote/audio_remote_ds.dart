import 'dart:convert';
import 'package:http/http.dart' as http;

class AudioRemoteDataSource {
  final String _baseUrl = 'https://api.qurancdn.com/api/qdc';

  Future<Map<String, dynamic>> getChapterAudio(int reciterId, int chapterId) async {
    final url = Uri.parse('$_baseUrl/audio/reciters/$reciterId/audio_files?chapter=$chapterId&segments=true');
    final response = await http.get(url, headers: {'Accept': 'application/json'});
    
    if (response.statusCode != 200) {
      throw Exception('Audio API error ${response.statusCode} ${response.reasonPhrase}');
    }
    
    final data = jsonDecode(response.body);
    final files = data['audio_files'] as List<dynamic>?;
    if (files == null || files.isEmpty) {
      throw Exception('No audio available for reciter $reciterId, chapter $chapterId');
    }
    
    return files.first as Map<String, dynamic>;
  }
}
