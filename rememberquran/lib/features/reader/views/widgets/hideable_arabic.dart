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

  @override
  Widget build(BuildContext context) {
    final settingsController = Get.find<ReaderSettingsController>();

    return Obx(() {
      final isHifzMode = settingsController.isHifzMode.value;
      if (!isHifzMode) return child;

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
