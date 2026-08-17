import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/theme/app_colors.dart';
import 'app_mascot.dart';

/// Centralised success/error toast styling so every part of the app reports
/// outcomes the same way — a small reacting mascot instead of a bare
/// `Get.snackbar('Error', ...)` string.
class AppFeedback {
  AppFeedback._();

  static void showSuccess(String message, {String title = 'Done'}) {
    final isDark = Get.isDarkMode;
    _show(
      title: title,
      message: message,
      mood: MascotMood.success,
      background: isDark ? AppColors.darkBrandGoldSoft : AppColors.lightBrandGoldSoft,
      foreground: isDark ? AppColors.darkForeground : AppColors.lightForeground,
    );
  }

  static void showError(
    String message, {
    String title = 'Something went wrong',
    VoidCallback? onRetry,
    String retryLabel = 'Retry',
  }) {
    final isDark = Get.isDarkMode;
    _show(
      title: title,
      message: message,
      mood: MascotMood.error,
      background: isDark ? AppColors.darkDestructive.withOpacity(0.16) : AppColors.lightDestructive.withOpacity(0.10),
      foreground: isDark ? AppColors.darkDestructive : AppColors.lightDestructive,
      mainButton: onRetry == null
          ? null
          : TextButton(
              onPressed: () {
                Get.closeCurrentSnackbar();
                onRetry();
              },
              child: Text(retryLabel),
            ),
    );
  }

  static void _show({
    required String title,
    required String message,
    required MascotMood mood,
    required Color background,
    required Color foreground,
    Widget? mainButton,
  }) {
    Get.rawSnackbar(
      titleText: Text(title, style: TextStyle(color: foreground, fontWeight: FontWeight.w700, fontSize: 15)),
      messageText: Text(message, style: TextStyle(color: foreground.withOpacity(0.9), fontSize: 13)),
      icon: SizedBox(width: 44, height: 44, child: AppMascot(mood: mood, size: 44)),
      shouldIconPulse: false,
      mainButton: mainButton,
      backgroundColor: background,
      borderRadius: 16,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      snackPosition: SnackPosition.BOTTOM,
      snackStyle: SnackStyle.FLOATING,
      duration: const Duration(seconds: 4),
      isDismissible: true,
      forwardAnimationCurve: Curves.easeOutBack,
    );
  }
}
