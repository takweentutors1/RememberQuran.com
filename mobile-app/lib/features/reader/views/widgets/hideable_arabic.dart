import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/reader_settings_controller.dart';

class HideableArabic extends StatelessWidget {
  final String verseKey;
  final Widget child;

  const HideableArabic({
    Key? key,
    required this.verseKey,
    required this.child,
  }) : super(key: key);

  /// Whether [verseKey] is currently blurred-and-tap-to-reveal under Hifz
  /// mode — the same rule [build] uses, exposed so word-level widgets (e.g.
  /// [ArabicWord]) can disable their own tap handling while an ayah is still
  /// hidden, instead of competing with the reveal tap here.
  static bool isHidden(ReaderSettingsController settings, String verseKey) {
    if (!settings.isHifzMode.value) return false;
    if (!_belongsToActiveSurah(settings, verseKey)) return false;

    final rangeStart = settings.hifzRangeStart.value;
    final rangeEnd = settings.hifzRangeEnd.value;
    if (rangeStart != null && rangeEnd != null) {
      final ayahNumber = int.tryParse(verseKey.split(':').last);
      if (ayahNumber == null || ayahNumber < rangeStart || ayahNumber > rangeEnd) {
        return false; // Outside the selected range — shown normally.
      }
    }

    return !settings.revealedAyahs.contains(verseKey);
  }

  /// A Mushaf boundary page can mix in verses from a neighbouring surah
  /// (see [QuranRepository.getVersesForPage]) that isn't the one Hifz mode
  /// is currently scoped to. Those verses' ayah numbers can coincidentally
  /// fall inside the active surah's hifz range too (every surah restarts
  /// numbering at 1), so without this check they'd get blurred/hidden right
  /// alongside the surah actually being memorised. [verseKey] is
  /// "chapterId:verseNumber" — [ReaderSettingsController.currentSurahId] is
  /// kept in sync with whichever chapter the reader has loaded, via
  /// [ReaderSettingsController.loadHifzRange] on every chapter load.
  static bool _belongsToActiveSurah(
    ReaderSettingsController settings,
    String verseKey,
  ) {
    final chapterId = int.tryParse(verseKey.split(':').first);
    return chapterId != null && chapterId == settings.currentSurahId.value;
  }

  @override
  Widget build(BuildContext context) {
    final settingsController = Get.find<ReaderSettingsController>();

    return Obx(() {
      final isHifzMode = settingsController.isHifzMode.value;
      if (!isHifzMode) return child;
      if (!_belongsToActiveSurah(settingsController, verseKey)) return child;

      final rangeStart = settingsController.hifzRangeStart.value;
      final rangeEnd = settingsController.hifzRangeEnd.value;
      if (rangeStart != null && rangeEnd != null) {
        final ayahNumber = int.tryParse(verseKey.split(':').last);
        if (ayahNumber == null || ayahNumber < rangeStart || ayahNumber > rangeEnd) {
          return child; // Outside the selected range — show normally.
        }
      }

      final isRevealed = settingsController.revealedAyahs.contains(verseKey);

      return GestureDetector(
        onTap: () {
          if (!isRevealed) {
            settingsController.revealAyah(verseKey);
          }
        },
        behavior: HitTestBehavior.opaque,
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: isRevealed
              ? child
              : ImageFiltered(
                  key: const ValueKey('blurred'),
                  imageFilter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                  child: Opacity(
                    opacity: 0.3,
                    child: child,
                  ),
                ),
        ),
      );
    });
  }
}
