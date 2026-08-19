import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/responsive_layout.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../shared/widgets/animated_action_button.dart';
import 'arabic_word.dart';
import 'hideable_arabic.dart';
import '../../controllers/reader_settings_controller.dart';
import '../../../study/views/widgets/tafsir_sheet.dart';
import '../../../study/views/widgets/asbab_sheet.dart';
import 'note_sheet.dart';
import '../../../../core/models/translation.dart';
import '../../../audio/controllers/audio_controller.dart';
import '../../controllers/reader_controller.dart';

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
    final nurColors = theme.extension<NurColorsExtension>();
    final settings = Get.find<ReaderSettingsController>();
    final audioController = Get.find<AudioController>();

    return Obx(() {
      final isVerseActive =
          audioController.rxActiveVerseKey.value == verse.verseKey;
      final isPlayingThisVerse =
          isVerseActive && audioController.rxIsPlaying.value;

      final showTranslation = settings.showTranslation.value;
      final activeTranslationRows = showTranslation
          ? [for (final id in settings.activeTranslations) _findTranslation(id)]
                .whereType<VerseTranslation>()
                .toList()
          : <VerseTranslation>[];

      // Text used for share/copy/card actions — the first active translation,
      // or blank when reading Arabic-only.
      final shareTranslationText = activeTranslationRows.isNotEmpty
          ? activeTranslationRows.first.translationText
          : '';

      return Container(
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
        decoration: BoxDecoration(
          color: isVerseActive
              ? (nurColors?.brandGoldSoft ??
                    theme.colorScheme.primary.withOpacity(0.05))
              : null,
          border: Border(
            bottom: BorderSide(
              color:
                  nurColors?.borderStrong ??
                  theme.dividerColor.withOpacity(0.1),
            ),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color:
                        nurColors?.surfaceSunk ??
                        theme.colorScheme.surfaceVariant,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    verse.verseKey,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color:
                          nurColors?.brandGoldStrong ??
                          theme.colorScheme.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                AnimatedActionButton(
                  icon: Icon(
                    isPlayingThisVerse
                        ? Icons.pause_circle_outline
                        : Icons.play_circle_outline,
                  ),
                  onPressed: () async {
                    if (isPlayingThisVerse) {
                      audioController.pause();
                    } else if (isVerseActive) {
                      audioController.play();
                    } else {
                      audioController.playVerse(
                        verse.chapterId,
                        verse.verseNumber,
                      );
                    }
                  },
                  iconSize: 20,
                  tooltip: isPlayingThisVerse ? 'Pause' : 'Play from here',
                ),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    reverse: true,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        AnimatedActionButton(
                          icon: const Icon(Icons.menu_book_outlined),
                          onPressed: () async {
                            TafsirSheet.show(
                              context,
                              verse.chapterId,
                              verse.verseNumber,
                            );
                          },
                          iconSize: 20,
                          tooltip: 'Tafsir',
                        ),
                        AnimatedActionButton(
                          icon: const Icon(Icons.history_edu),
                          onPressed: () async {
                            AsbabSheet.show(
                              context,
                              verse.chapterId,
                              verse.verseNumber,
                            );
                          },
                          iconSize: 20,
                          tooltip: 'Asbab al-Nuzul',
                        ),
                        AnimatedActionButton(
                          icon: const Icon(Icons.edit_note),
                          onPressed: () async {
                            NoteSheet.show(
                              context,
                              verse.chapterId,
                              verse.verseNumber,
                            );
                          },
                          iconSize: 20,
                          tooltip: 'Add Note',
                        ),
                        AnimatedActionButton(
                          icon: const Icon(Icons.share_outlined),
                          onPressed: () async {
                            final text =
                                '${verse.qpcUthmaniHafs ?? verse.textUthmani}\n\n$shareTranslationText\n\n— Quran ${verse.verseKey} (https://remember-quran-com.vercel.app/surah/${verse.chapterId}/${verse.verseNumber})';
                            await Share.share(text);
                          },
                          iconSize: 20,
                          tooltip: 'Share text',
                        ),
                        AnimatedActionButton(
                          icon: const Icon(Icons.image_outlined),
                          onPressed: () async {
                            Get.toNamed(
                              Routes.SHARE_AYAH,
                              arguments: {
                                'textUthmani':
                                    verse.qpcUthmaniHafs ?? verse.textUthmani,
                                'translation': shareTranslationText,
                                'reference': 'Quran ${verse.verseKey}',
                              },
                            );
                          },
                          iconSize: 20,
                          tooltip: 'Design & Share Card',
                        ),
                        AnimatedActionButton(
                          icon: const Icon(Icons.copy_outlined),
                          onPressed: () async {
                            final text =
                                '${verse.qpcUthmaniHafs ?? verse.textUthmani}\n\n$shareTranslationText\n\n— Quran ${verse.verseKey}';
                            await Clipboard.setData(ClipboardData(text: text));
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Ayah copied to clipboard'),
                                ),
                              );
                            }
                          },
                          iconSize: 20,
                          tooltip: 'Copy',
                        ),
                        Obx(() {
                          final readerController = Get.find<ReaderController>();
                          final verseKey =
                              '${verse.chapterId}:${verse.verseNumber}';
                          final isBookmarked = readerController.bookmarkedVerses
                              .contains(verseKey);
                          return AnimatedActionButton(
                            icon: Icon(
                              isBookmarked
                                  ? Icons.bookmark
                                  : Icons.bookmark_border,
                            ),
                            onPressed: () async =>
                                await readerController.toggleBookmark(verseKey),
                            iconSize: 20,
                            tooltip: isBookmarked
                                ? 'Remove Bookmark'
                                : 'Bookmark',
                          );
                        }),
                      ],
                    ),
                  ),
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
                  children: words
                      .map((w) => ArabicWord(word: w, verseKey: verse.verseKey))
                      .toList(),
                ),
              ),
            ),
            if (activeTranslationRows.isNotEmpty) const SizedBox(height: 24),
            for (final t in activeTranslationRows)
              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Container(
                  padding: const EdgeInsets.only(left: 16.0),
                  decoration: BoxDecoration(
                    border: Border(
                      left: BorderSide(
                        color: nurColors?.brandGoldSoft ?? theme.dividerColor,
                        width: 3,
                      ),
                    ),
                  ),
                  child: Directionality(
                    textDirection:
                        (getTranslationResource(t.resourceId)?.isRtl ?? false)
                        ? TextDirection.rtl
                        : TextDirection.ltr,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          t.translationText,
                          style: TextStyle(
                            fontSize: context.responsiveBaseTextSize,
                            height: 1.6,
                            color:
                                nurColors?.foregroundSubtle ??
                                theme.textTheme.bodyLarge?.color?.withOpacity(
                                  0.9,
                                ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '— ${getTranslationName(t.resourceId)}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color:
                                nurColors?.foregroundFaint ??
                                theme.textTheme.bodySmall?.color,
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
