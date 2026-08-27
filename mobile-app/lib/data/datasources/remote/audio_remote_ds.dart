import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class AudioRemoteDataSource {
  final String _baseUrl = 'https://api.qurancdn.com/api/qdc';

  Future<Map<String, dynamic>> getChapterAudio(int reciterId, int chapterId) async {
    final url = Uri.parse('$_baseUrl/audio/reciters/$reciterId/audio_files?chapter=$chapterId&segments=true');
    // Without a timeout, a stalled request (flaky network, DNS hiccup) leaves
    // the caller's "loading" state spinning forever instead of failing.
    final response = await http
        .get(url, headers: {'Accept': 'application/json'})
        .timeout(const Duration(seconds: 10));

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

  /// True if the qdc API confirms this reciter has no audio for this
  /// chapter (a 200 response with an empty `audio_files` array). Used for
  /// availability probing, which needs to tell "confirmed absent" apart
  /// from "request failed" (timeout, DNS hiccup, 5xx) — the latter must
  /// never be treated as absent, so this returns null on any failure
  /// instead of throwing, letting the caller fail open exactly like a
  /// timed-out HEAD probe would.
  Future<bool?> isChapterAudioMissing(int reciterId, int chapterId) async {
    final url = Uri.parse('$_baseUrl/audio/reciters/$reciterId/audio_files?chapter=$chapterId');
    try {
      final response = await http
          .get(url, headers: {'Accept': 'application/json'})
          .timeout(const Duration(seconds: 5));
      if (response.statusCode != 200) return null;
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final files = data['audio_files'] as List<dynamic>?;
      return files == null || files.isEmpty;
    } catch (_) {
      return null;
    }
  }
}
