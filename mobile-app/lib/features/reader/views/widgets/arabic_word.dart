import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../audio/controllers/audio_controller.dart';
import '../../controllers/reader_settings_controller.dart';
import 'word_meaning_sheet.dart';
import 'tajweed_text.dart';
import '../../../../core/utils/responsive_layout.dart';

class ArabicWord extends StatelessWidget {
  final Word word;
  final String verseKey;
  final double? fontSize;

  const ArabicWord({
    super.key,
    required this.word,
    required this.verseKey,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    final settings = Get.find<ReaderSettingsController>();
    final audioController = Get.find<AudioController>();

    return Obx(() {
      final font = settings.font.value;
      final effectiveFontSize = fontSize ?? settings.fontSize.value;
      final isTajweedEnabled = settings.rxTajweedEnabled.value;
      final isActiveWord =
          audioController.rxActiveVerseKey.value == verseKey &&
          audioController.rxActiveWordPosition.value == word.position;

      final textStyle = TextStyle(
        fontFamily: font,
        fontSize: effectiveFontSize,
        height: 1.8,
        color: _getColor(Theme.of(context), word.charTypeName),
      );

      return InkWell(
        onTap: () {
          showResponsiveSheet(
            context: context,
            builder: (context) => WordMeaningSheet(word: word, verseKey: verseKey),
          );
        },
        borderRadius: BorderRadius.circular(4),
        child: Container(
          padding: isActiveWord
              ? const EdgeInsets.symmetric(horizontal: 2)
              : EdgeInsets.zero,
          decoration: isActiveWord
              ? BoxDecoration(
                  color: Theme.of(
                    context,
                  ).colorScheme.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                )
              : null,
          child:
              (isTajweedEnabled &&
                  word.textUthmaniTajweed != null &&
                  word.textUthmaniTajweed!.isNotEmpty)
              ? TajweedText(
                  htmlText: word.textUthmaniTajweed!,
                  style: textStyle,
                )
              : Text(
                  word.qpcUthmaniHafs ?? word.textUthmani,
                  textAlign: TextAlign.right,
                  style: textStyle,
                ),
        ),
      );
    });
  }

  Color _getColor(ThemeData theme, String charType) {
    if (charType == 'end') {
      return theme.colorScheme.primary;
    }
    if (charType == 'pause' ||
        charType == 'sajdah' ||
        charType == 'rubel_hizb') {
      final nurColors = theme.extension<NurColorsExtension>();
      return nurColors?.brandGold ?? theme.colorScheme.secondary;
    }

    final nurColors = theme.extension<NurColorsExtension>();
    return nurColors?.readerInk ?? theme.colorScheme.onSurface;
  }
}
