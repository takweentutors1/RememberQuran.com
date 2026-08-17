import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../data/datasources/local/quran_db.dart';
import 'arabic_word.dart';
import 'hideable_arabic.dart';
import '../../controllers/reader_settings_controller.dart';
import '../../../study/views/widgets/tafsir_sheet.dart';
import '../../../study/views/widgets/asbab_sheet.dart';
import '../../../../core/models/translation.dart';
import '../../../audio/controllers/audio_controller.dart';

class AyahBlock extends StatelessWidget {
  final Verse verse;
  final List<Word> words;
  final List<VerseTranslation> translations;

  const AyahBlock({
    Key? key,
    required this.verse,
    required this.words,
    required this.translations,
  }) : super(key: key);

  VerseTranslation? _findTranslation(int resourceId) {
    for (final t in translations) {
      if (t.resourceId == resourceId) return t;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final settings = Get.find<ReaderSettingsController>();
    final audioController = Get.find<AudioController>();

    return Obx(() {
      final isVerseActive = audioController.rxActiveVerseKey.value == verse.verseKey;
      final isPlayingThisVerse = isVerseActive && audioController.rxIsPlaying.value;

      final showTranslation = settings.showTranslation.value;
      final activeTranslationRows = showTranslation
          ? [
              for (final id in settings.activeTranslations)
                _findTranslation(id),
            ].whereType<VerseTranslation>().toList()
          : <VerseTranslation>[];

      // Text used for share/copy/card actions — the first active translation,
      // or blank when reading Arabic-only.
      final shareTranslationText =
          activeTranslationRows.isNotEmpty ? activeTranslationRows.first.translationText : '';

      return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: isVerseActive ? theme.colorScheme.primary.withOpacity(0.04) : null,
        border: Border(bottom: BorderSide(color: theme.dividerColor.withOpacity(0.2))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                verse.verseKey,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(isPlayingThisVerse ? Icons.pause_circle_outline : Icons.play_circle_outline),
                    onPressed: () {
                      if (isPlayingThisVerse) {
                        audioController.pause();
                      } else if (isVerseActive) {
                        audioController.play();
                      } else {
                        audioController.playVerse(verse.chapterId, verse.verseNumber);
                      }
                    },
                    iconSize: 20,
                    color: isVerseActive ? theme.colorScheme.primary : null,
                    tooltip: isPlayingThisVerse ? 'Pause' : 'Play from here',
                  ),
                  IconButton(
                    icon: const Icon(Icons.menu_book_outlined),
                    onPressed: () {
                      TafsirSheet.show(context, verse.chapterId, verse.verseNumber);
                    },
                    iconSize: 20,
                    tooltip: 'Tafsir',
                  ),
                  IconButton(
                    icon: const Icon(Icons.history_edu),
                    onPressed: () {
                      AsbabSheet.show(context, verse.chapterId, verse.verseNumber);
                    },
                    iconSize: 20,
                    tooltip: 'Asbab al-Nuzul',
                  ),
                  IconButton(
                    icon: const Icon(Icons.share_outlined),
                    onPressed: () {
                      final text = '${verse.qpcUthmaniHafs ?? verse.textUthmani}\n\n$shareTranslationText\n\n— Quran ${verse.verseKey} (https://remember-quran-com.vercel.app/surah/${verse.chapterId}/${verse.verseNumber})';
                      Share.share(text);
                    },
                    iconSize: 20,
                    tooltip: 'Share text',
                  ),
                  IconButton(
                    icon: const Icon(Icons.image_outlined),
                    onPressed: () {
                      Get.toNamed(
                        Routes.SHARE_AYAH,
                        arguments: {
                          'textUthmani': verse.qpcUthmaniHafs ?? verse.textUthmani,
                          'translation': shareTranslationText,
                          'reference': 'Quran ${verse.verseKey}',
                        },
                      );
                    },
                    iconSize: 20,
                    tooltip: 'Design & Share Card',
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy_outlined),
                    onPressed: () {
                      final text = '${verse.qpcUthmaniHafs ?? verse.textUthmani}\n\n$shareTranslationText\n\n— Quran ${verse.verseKey}';
                      Clipboard.setData(ClipboardData(text: text));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Ayah copied to clipboard')),
                      );
                    },
                    iconSize: 20,
                    tooltip: 'Copy',
                  ),
                  IconButton(
                    icon: const Icon(Icons.bookmark_border),
                    onPressed: () {},
                    iconSize: 20,
                    tooltip: 'Bookmark',
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          HideableArabic(
            verseKey: verse.verseKey,
            child: Directionality(
              textDirection: TextDirection.rtl,
              child: Wrap(
                spacing: 6.0,
                runSpacing: 16.0,
                children: words.map((w) => ArabicWord(word: w, verseKey: verse.verseKey)).toList(),
              ),
            ),
          ),
          if (activeTranslationRows.isNotEmpty) const SizedBox(height: 24),
          for (final t in activeTranslationRows)
            Padding(
              padding: const EdgeInsets.only(top: 12.0),
              child: Container(
                padding: const EdgeInsets.only(left: 12.0),
                decoration: BoxDecoration(
                  border: Border(left: BorderSide(color: theme.dividerColor.withOpacity(0.4), width: 2)),
                ),
                child: Directionality(
                  textDirection: (getTranslationResource(t.resourceId)?.isRtl ?? false)
                      ? TextDirection.rtl
                      : TextDirection.ltr,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        t.translationText,
                        style: TextStyle(
                          fontSize: 18,
                          height: 1.6,
                          color: theme.textTheme.bodyLarge?.color?.withOpacity(0.9),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '— ${getTranslationName(t.resourceId)}',
                        style: TextStyle(
                          fontSize: 11,
                          color: theme.textTheme.bodySmall?.color,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
    });
  }
}
