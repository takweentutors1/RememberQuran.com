import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.lightBackground,
    colorScheme: const ColorScheme.light(
      primary: AppColors.lightPrimary,
      onPrimary: AppColors.lightPrimaryForeground,
      secondary: AppColors.lightSecondary,
      onSecondary: AppColors.lightSecondaryForeground,
      surface: AppColors.lightCard,
      onSurface: AppColors.lightForeground,
      error: AppColors.lightDestructive,
      onError: Colors.white,
      outline: AppColors.lightBorder,
    ),
    dividerColor: AppColors.lightBorder,
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.lightBrandGold,
    ),
    extensions: const <ThemeExtension<dynamic>>[
      NurColorsExtension(
        surfaceSunk: AppColors.lightSurfaceSunk,
        foregroundSubtle: AppColors.lightForegroundSubtle,
        foregroundFaint: AppColors.lightForegroundFaint,
        borderStrong: AppColors.lightBorderStrong,
        brandGold: AppColors.lightBrandGold,
        brandGoldStrong: AppColors.lightBrandGoldStrong,
        brandGoldSoft: AppColors.lightBrandGoldSoft,
        readerInk: AppColors.lightReaderInk,
      ),
    ],
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.darkBackground,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.darkPrimary,
      onPrimary: AppColors.darkPrimaryForeground,
      secondary: AppColors.darkSecondary,
      onSecondary: AppColors.darkSecondaryForeground,
      surface: AppColors.darkCard,
      onSurface: AppColors.darkForeground,
      error: AppColors.darkDestructive,
      onError: Colors.white,
      outline: AppColors.darkBorder,
    ),
    dividerColor: AppColors.darkBorder,
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.darkBrandGold,
    ),
    extensions: const <ThemeExtension<dynamic>>[
      NurColorsExtension(
        surfaceSunk: AppColors.darkSurfaceSunk,
        foregroundSubtle: AppColors.darkForegroundSubtle,
        foregroundFaint: AppColors.darkForegroundFaint,
        borderStrong: AppColors.darkBorderStrong,
        brandGold: AppColors.darkBrandGold,
        brandGoldStrong: AppColors.darkBrandGoldStrong,
        brandGoldSoft: AppColors.darkBrandGoldSoft,
        readerInk: AppColors.darkReaderInk,
      ),
    ],
  );
}
