import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../data/datasources/remote/morphology_local_ds.dart';
import '../../../../data/models/morphology_entry.dart';
import '../../../../core/models/reciter.dart';
import '../../../../core/utils/morphology_labels.dart';

class WordMeaningSheet extends StatefulWidget {
  final Word word;
  final String verseKey;

  const WordMeaningSheet({Key? key, required this.word, required this.verseKey})
      : super(key: key);

  @override
  State<WordMeaningSheet> createState() => _WordMeaningSheetState();
}

class _WordMeaningSheetState extends State<WordMeaningSheet> {
  final AudioPlayer _player = AudioPlayer();
  final MorphologyLocalDataSource _morphologyDs = MorphologyLocalDataSource();
  bool _isPlaying = false;
  MorphologyEntry? _morphology;

  @override
  void initState() {
    super.initState();
    _loadMorphology();
  }

  Future<void> _loadMorphology() async {
    final parts = widget.verseKey.split(':');
    if (parts.length != 2) return;
    final surahId = int.tryParse(parts[0]);
    final ayahNumber = int.tryParse(parts[1]);
    if (surahId == null || ayahNumber == null) return;

    final entry = await _morphologyDs.getEntry(
      surahId: surahId,
      ayahNumber: ayahNumber,
      wordPosition: widget.word.position,
    );
    if (!mounted || entry == null) return;
    setState(() => _morphology = entry);
  }

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
            if (_morphology != null) ...[
              const SizedBox(height: 20),
              _buildMorphologySection(theme, _morphology!),
            ],
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

  Widget _buildMorphologySection(ThemeData theme, MorphologyEntry morphology) {
    const arabicLabels = {'Lemma', 'Root'};
    final rows = <MapEntry<String, String>>[
      if (morphology.pos.isNotEmpty)
        MapEntry('Part of Speech', MorphologyLabels.humanizePOS(morphology.pos)),
      if (morphology.lemma.isNotEmpty) MapEntry('Lemma', morphology.lemma),
      if (morphology.root.isNotEmpty) MapEntry('Root', morphology.root),
      if (morphology.features.isNotEmpty)
        MapEntry(
          'Grammar',
          MorphologyLabels.humanizeFeatures(morphology.features).join(' · '),
        ),
    ];
    if (rows.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          for (final row in rows)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    row.key,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      row.value,
                      textAlign: TextAlign.end,
                      textDirection: arabicLabels.contains(row.key)
                          ? TextDirection.rtl
                          : TextDirection.ltr,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        fontFamily:
                            arabicLabels.contains(row.key) ? 'UthmanicHafs' : null,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
