import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../data/datasources/remote/asbab_remote_ds.dart';
import '../../../../shared/widgets/app_feedback.dart';
import '../../../../shared/widgets/surah_medallion.dart';
import '../../../account/controllers/auth_controller.dart';
import '../../../account/views/collection_picker_sheet.dart';
import '../../../audio/controllers/audio_controller.dart';
import '../../controllers/reader_controller.dart';
import '../../controllers/reader_settings_controller.dart';
import '../../../study/views/widgets/asbab_sheet.dart';
import '../../../study/views/widgets/tafsir_sheet.dart';
import 'note_sheet.dart';

/// The full menu of ayah-level actions (play, tafsir, share, bookmark, ...),
/// opened by tapping an ayah's end marker. Tapping the marker used to fall
/// through to [WordMeaningSheet] — built for real words, so for the marker
/// (whose "translation" field is just the ayah number) it rendered an
/// almost-empty sheet. This shows the same actions already available as an
/// icon row in [AyahBlock] (Verse mode), as an actual labeled menu, so the
/// same options are reachable from Mushaf mode too.
class AyahActionsSheet extends StatelessWidget {
  final String verseKey;

  const AyahActionsSheet({super.key, required this.verseKey});

  static void show(BuildContext context, String verseKey) {
    showResponsiveSheet(
      context: context,
      builder: (_) => AyahActionsSheet(verseKey: verseKey),
    );
  }

  VerseTranslation? _findTranslation(
    List<VerseTranslation> translations,
    int resourceId,
  ) {
    for (final t in translations) {
      if (t.resourceId == resourceId) return t;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final readerController = Get.find<ReaderController>();
    final settings = Get.find<ReaderSettingsController>();
    final audioController = Get.find<AudioController>();

    final verse = readerController.verses.firstWhereOrNull(
      (v) => v.verseKey == verseKey,
    );
    if (verse == null) return const SizedBox.shrink();

    final translations = readerController.verseTranslations[verse.id] ?? [];
    final activeTranslationRows = settings.showTranslation.value
        ? [
            for (final id in settings.activeTranslations)
              _findTranslation(translations, id),
          ].whereType<VerseTranslation>().toList()
        : <VerseTranslation>[];
    final shareTranslationText = activeTranslationRows.isNotEmpty
        ? activeTranslationRows.first.translationText
        : '';
    final arabicText = verse.qpcUthmaniHafs ?? verse.textUthmani;

    return Obx(() {
      final isVerseActive =
          audioController.rxActiveVerseKey.value == verse.verseKey;
      final isPlayingThisVerse =
          isVerseActive && audioController.rxIsPlaying.value;
      final isBookmarked = readerController.bookmarkedVerses.contains(
        verseKey,
      );
      final isMemorised = readerController.memorisedVerses.contains(
        verseKey,
      );

      return SafeArea(
        child: Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 4),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Theme.of(context).dividerColor.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              ListTile(
                leading: SurahMedallion(number: verse.verseNumber, size: 32),
                title: Text(
                  readerController.chapter.value?.nameSimple ?? 'Ayah',
                ),
                subtitle: Text('Ayah ${verse.verseNumber}'),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(
                  isPlayingThisVerse
                      ? Icons.pause_circle_outline
                      : Icons.play_circle_outline,
                ),
                title: Text(isPlayingThisVerse ? 'Pause' : 'Play from here'),
                onTap: () {
                  Navigator.of(context).pop();
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
              ),
              ListTile(
                leading: const Icon(Icons.menu_book_outlined),
                title: const Text('Tafsir'),
                onTap: () {
                  Navigator.of(context).pop();
                  TafsirSheet.show(context, verse.chapterId, verse.verseNumber);
                },
              ),
              FutureBuilder<bool>(
                future: AsbabRemoteDataSource().hasAsbab(
                  verse.chapterId,
                  verse.verseNumber,
                ),
                builder: (context, snapshot) {
                  if (snapshot.data != true) return const SizedBox.shrink();
                  return ListTile(
                    leading: const Icon(Icons.history_edu),
                    title: const Text('Asbab al-Nuzul'),
                    onTap: () {
                      Navigator.of(context).pop();
                      AsbabSheet.show(
                        context,
                        verse.chapterId,
                        verse.verseNumber,
                      );
                    },
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.edit_note),
                title: const Text('Add Note'),
                onTap: () {
                  Navigator.of(context).pop();
                  final userId = Get.find<AuthController>().firebaseUser.value?.uid;
                  if (userId == null) {
                    AppFeedback.showError('Please sign in to save your notes.');
                    return;
                  }
                  NoteSheet.show(context, verse.chapterId, verse.verseNumber);
                },
              ),
              ListTile(
                leading: const Icon(Icons.share_outlined),
                title: const Text('Share text'),
                onTap: () async {
                  Navigator.of(context).pop();
                  final text =
                      '$arabicText\n\n$shareTranslationText\n\n— Quran ${verse.verseKey} (https://rememberquran.com/${verse.chapterId}/${verse.verseNumber})';
                  await SharePlus.instance.share(ShareParams(text: text));
                },
              ),
              ListTile(
                leading: const Icon(Icons.image_outlined),
                title: const Text('Design & Share Card'),
                onTap: () {
                  Navigator.of(context).pop();
                  Get.toNamed(
                    Routes.SHARE_AYAH,
                    arguments: {
                      'textUthmani': arabicText,
                      'translation': shareTranslationText,
                      'reference': 'Quran ${verse.verseKey}',
                      'chapterId': verse.chapterId,
                      'verseNumber': verse.verseNumber,
                    },
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.copy_outlined),
                title: const Text('Copy'),
                onTap: () async {
                  Navigator.of(context).pop();
                  final text =
                      '$arabicText\n\n$shareTranslationText\n\n— Quran ${verse.verseKey}';
                  await Clipboard.setData(ClipboardData(text: text));
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Ayah copied to clipboard')),
                    );
                  }
                },
              ),
              ListTile(
                leading: Icon(
                  isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                ),
                title: Text(isBookmarked ? 'Remove Bookmark' : 'Bookmark'),
                onTap: () async {
                  Navigator.of(context).pop();
                  if (isBookmarked) {
                    await readerController.toggleBookmark(verseKey);
                    return;
                  }
                  final userId = Get.find<AuthController>().firebaseUser.value?.uid;
                  if (userId == null) {
                    await readerController.toggleBookmark(verseKey);
                    return;
                  }
                  final collectionId = await CollectionPickerSheet.show(
                    context,
                    userId,
                  );
                  if (collectionId == null) return; // cancelled
                  await readerController.toggleBookmark(
                    verseKey,
                    collectionId: collectionId,
                  );
                },
              ),
              ListTile(
                leading: Icon(
                  isMemorised ? Icons.psychology : Icons.psychology_outlined,
                ),
                title: Text(
                  isMemorised ? 'Unmark as Memorised' : 'Mark as Memorised',
                ),
                onTap: () async {
                  Navigator.of(context).pop();
                  await readerController.toggleMemorised(
                    verseKey,
                    verse.chapterId,
                    verse.verseNumber,
                  );
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      );
    });
  }
}
