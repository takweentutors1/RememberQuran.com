import 'package:flutter/material.dart';
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
import '../../../../data/datasources/remote/asbab_remote_ds.dart';
import 'note_sheet.dart';
import '../../../../core/models/translation.dart';
import '../../../audio/controllers/audio_controller.dart';
import '../../controllers/reader_controller.dart';
import '../../../account/controllers/auth_controller.dart';
import '../../../account/views/collection_picker_sheet.dart';
import '../../../../shared/widgets/surah_medallion.dart';

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
    final readerController = Get.find<ReaderController>();

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

      // The ayah actually being recited gets the jade "now playing" wash —
      // distinct from merely-active-but-paused (kept on the softer gold
      // wash), so "this is what's sounding right now" reads at a glance
      // instead of every visited/selected ayah looking the same.
      final jade = theme.colorScheme.primary;

      return Container(
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
        decoration: BoxDecoration(
          color: isPlayingThisVerse
              ? jade.withOpacity(0.10)
              : isVerseActive
                  ? (nurColors?.brandGoldSoft ??
                        theme.colorScheme.primary.withOpacity(0.05))
                  : null,
          border: Border(
            bottom: BorderSide(
              color: isPlayingThisVerse
                  ? jade.withOpacity(0.3)
                  : (nurColors?.borderStrong ?? theme.dividerColor.withOpacity(0.1)),
            ),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SurahMedallion(number: verse.verseNumber, size: 28),
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
                        FutureBuilder<bool>(
                          future: AsbabRemoteDataSource().hasAsbab(verse.chapterId, verse.verseNumber),
                          builder: (context, snapshot) {
                            if (snapshot.data == true) {
                              return AnimatedActionButton(
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
                              );
                            }
                            return const SizedBox.shrink();
                          },
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
                                '${verse.qpcUthmaniHafs ?? verse.textUthmani}\n\n$shareTranslationText\n\n— Quran ${verse.verseKey} (https://rememberquran.com/surah/${verse.chapterId}/${verse.verseNumber})';
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
                            onPressed: () async {
                              if (isBookmarked) {
                                await readerController.toggleBookmark(verseKey);
                                return;
                              }
                              final userId = Get.find<AuthController>()
                                  .firebaseUser
                                  .value
                                  ?.uid;
                              if (userId == null) {
                                // No account yet — let toggleBookmark's own
                                // check surface the sign-in prompt rather
                                // than duplicating that logic here.
                                await readerController.toggleBookmark(verseKey);
                                return;
                              }
                              final collectionId =
                                  await CollectionPickerSheet.show(context, userId);
                              if (collectionId == null) return; // cancelled
                              await readerController.toggleBookmark(
                                verseKey,
                                collectionId: collectionId,
                              );
                            },
                            iconSize: 20,
                            tooltip: isBookmarked
                                ? 'Remove Bookmark'
                                : 'Bookmark',
                          );
                        }),
                        Obx(() {
                          final readerController = Get.find<ReaderController>();
                          final verseKey =
                              '${verse.chapterId}:${verse.verseNumber}';
                          final isMemorised = readerController.memorisedVerses
                              .contains(verseKey);
                          return AnimatedActionButton(
                            icon: Icon(
                              isMemorised
                                  ? Icons.psychology
                                  : Icons.psychology_outlined,
                            ),
                            onPressed: () async {
                              await readerController.toggleMemorised(
                                verseKey,
                                verse.chapterId,
                                verse.verseNumber,
                              );
                            },
                            iconSize: 20,
                            tooltip: isMemorised
                                ? 'Unmark as Memorised'
                                : 'Mark as Memorised',
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
              _buildTranslationRow(context, theme, nurColors, readerController, t),
            if (settings.isHifzMode.value &&
                settings.hifzRangeStart.value != null &&
                settings.hifzRangeEnd.value != null &&
                verse.verseNumber ==
                    (settings.hifzRangeEnd.value! >= settings.hifzRangeStart.value!
                        ? settings.hifzRangeEnd.value!
                        : settings.hifzRangeStart.value!))
              _buildBulkHifzActionRow(
                context,
                theme,
                readerController,
                settings.hifzRangeStart.value! <= settings.hifzRangeEnd.value!
                    ? settings.hifzRangeStart.value!
                    : settings.hifzRangeEnd.value!,
                settings.hifzRangeEnd.value! >= settings.hifzRangeStart.value!
                    ? settings.hifzRangeEnd.value!
                    : settings.hifzRangeStart.value!,
              ),
          ],
        ),
      );
    });
  }

  Widget _buildBulkHifzActionRow(
    BuildContext context,
    ThemeData theme,
    ReaderController readerController,
    int from,
    int to,
  ) {
    return Padding(
      padding: const EdgeInsets.only(top: 20.0),
      child: Obx(() {
        final isBusy = readerController.isBulkMarking.value;
        final progress = readerController.bulkMarkProgress.value;

        return Center(
          child: FilledButton.tonalIcon(
            onPressed: isBusy
                ? null
                : () => readerController.markRangeMemorised(
                      verse.chapterId,
                      from,
                      to,
                    ),
            icon: isBusy
                ? SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      value: progress > 0 ? progress / 100.0 : null,
                    ),
                  )
                : const Icon(Icons.check_circle_outline, size: 18),
            label: Text(
              isBusy
                  ? 'Marking ($progress%)…'
                  : 'Mark Ayat $from–$to as memorised',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        );
      }),
    );
  }

  /// "Surah N:N · Translator" — matches the attribution format used
  /// elsewhere for quoted verses (e.g. the Ayah of the Day card), rather
  /// than the bare "— Translator" this used to show on its own.
  Widget _buildTranslationRow(
    BuildContext context,
    ThemeData theme,
    NurColorsExtension? nurColors,
    ReaderController readerController,
    VerseTranslation t,
  ) {
    final surahName = readerController.chapter.value?.nameSimple;
    final reference = (surahName == null || surahName.isEmpty)
        ? verse.verseKey
        : '$surahName ${verse.verseKey}';

    return Padding(
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
          textDirection: (getTranslationResource(t.resourceId)?.isRtl ?? false)
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
                  color: nurColors?.foregroundSubtle ??
                      theme.textTheme.bodyLarge?.color?.withOpacity(0.9),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '$reference · ${getTranslationName(t.resourceId)}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: nurColors?.foregroundFaint ?? theme.textTheme.bodySmall?.color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
