import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../core/models/reciter.dart';

class WordMeaningSheet extends StatefulWidget {
  final Word word;

  const WordMeaningSheet({Key? key, required this.word}) : super(key: key);

  @override
  State<WordMeaningSheet> createState() => _WordMeaningSheetState();
}

class _WordMeaningSheetState extends State<WordMeaningSheet> {
  final AudioPlayer _player = AudioPlayer();
  bool _isPlaying = false;

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _playAudio() async {
    final rawUrl = widget.word.audioUrl;
    if (rawUrl == null || rawUrl.isEmpty) return;
    
    // Convert relative URL to full URL
    final fullUrl = getWordAudioUrl(rawUrl, widget.word.position);
    if (fullUrl == null) return;

    try {
      setState(() => _isPlaying = true);
      await _player.setUrl(fullUrl);
      await _player.play();
    } catch (e) {
      debugPrint('Error playing word audio: $e');
    } finally {
      if (mounted) setState(() => _isPlaying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final word = widget.word;
    
    String translationText = '';
    String transliterationText = '';
    
    try {
      final trans = jsonDecode(word.translation) as Map<String, dynamic>;
      translationText = trans['text'] ?? '';
      
      if (word.transliteration != null && word.transliteration!.isNotEmpty) {
        final transL = jsonDecode(word.transliteration!) as Map<String, dynamic>;
        transliterationText = transL['text'] ?? '';
      }
    } catch (_) {
      // Fallback if parsing fails
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle for bottom sheet
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: theme.dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            // Arabic Word
            Text(
              word.qpcUthmaniHafs ?? word.textUthmani,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'UthmanicHafs',
                fontSize: 56,
                height: 1.5,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 16),
            // Transliteration
            if (transliterationText.isNotEmpty)
              Text(
                transliterationText,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                  color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                ),
              ),
            const SizedBox(height: 8),
            // Translation
            if (translationText.isNotEmpty)
              Text(
                translationText,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            const SizedBox(height: 32),
            // Play Audio Button
            if (word.audioUrl != null && word.audioUrl!.isNotEmpty)
              ElevatedButton.icon(
                onPressed: _isPlaying ? null : _playAudio,
                icon: _isPlaying 
                    ? const SizedBox(
                        width: 20, height: 20, 
                        child: CircularProgressIndicator(strokeWidth: 2)
                      )
                    : const Icon(Icons.volume_up),
                label: Text(_isPlaying ? 'Playing...' : 'Play Word Audio'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
