import 'package:flutter/material.dart';

class AppColors {
  // Light Mode Colors
  static const Color lightBackground = Color(0xFFFBFAF7);
  static const Color lightForeground = Color(0xFF15161A);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightCardForeground = Color(0xFF15161A);
  static const Color lightPopover = Color(0xFFFFFFFF);
  static const Color lightPopoverForeground = Color(0xFF15161A);
  static const Color lightPrimary = Color(0xFF15161A);
  static const Color lightPrimaryForeground = Color(0xFFFFFFFF);
  static const Color lightSecondary = Color(0xFFF2F0EA);
  static const Color lightSecondaryForeground = Color(0xFF15161A);
  static const Color lightMuted = Color(0xFFF2F0EA);
  static const Color lightMutedForeground = Color(0xFF53565E);
  static const Color lightAccent = Color(0xFFEEEDE8);
  static const Color lightAccentForeground = Color(0xFF15161A);
  static const Color lightDestructive = Color(0xFFC0392B); // Approx oklch(0.52 0.16 27)
  static const Color lightBorder = Color(0xFFE8E5DD);
  static const Color lightInput = Color(0xFFD3CFC4);
  static const Color lightRing = Color(0xFFB07C22);
  
  // Nur extensions (Light)
  static const Color lightSurfaceSunk = Color(0xFFE9E6DE);
  static const Color lightForegroundSubtle = Color(0xFF8A8D95);
  static const Color lightForegroundFaint = Color(0xFFB4B6BC);
  static const Color lightBorderStrong = Color(0xFFD3CFC4);
  static const Color lightBrandGold = Color(0xFFB07C22);
  static const Color lightBrandGoldStrong = Color(0xFF8A5F16);
  static const Color lightBrandGoldSoft = Color(0xFFFAF0DC);
  static const Color lightReaderInk = Color(0xFF0D0E11);

  // Dark Mode Colors
  static const Color darkBackground = Color(0xFF0C0C0E);
  static const Color darkForeground = Color(0xFFF2F1ED);
  static const Color darkCard = Color(0xFF151618);
  static const Color darkCardForeground = Color(0xFFF2F1ED);
  static const Color darkPopover = Color(0xFF151618);
  static const Color darkPopoverForeground = Color(0xFFF2F1ED);
  static const Color darkPrimary = Color(0xFFF2F1ED);
  static const Color darkPrimaryForeground = Color(0xFF0C0C0E);
  static const Color darkSecondary = Color(0xFF1D1E22);
  static const Color darkSecondaryForeground = Color(0xFFF2F1ED);
  static const Color darkMuted = Color(0xFF1D1E22);
  static const Color darkMutedForeground = Color(0xFFA6A8AE);
  static const Color darkAccent = Color(0xFF1C1D20);
  static const Color darkAccentForeground = Color(0xFFF2F1ED);
  static const Color darkDestructive = Color(0xFFE74C3C); // Approx oklch(0.65 0.17 27)
  static const Color darkBorder = Color(0xFF232427);
  static const Color darkInput = Color(0xFF33353A);
  static const Color darkRing = Color(0xFFE0AE55);

  // Tajweed Colors - Light
  static const Color lightTajweedGhunnah = Color(0xFFD97706); // Amber/Orange
  static const Color lightTajweedIkhfa = Color(0xFF9333EA); // Purple
  static const Color lightTajweedIdgham = Color(0xFF16A34A); // Green
  static const Color lightTajweedIqlab = Color(0xFF0284C7); // Light Blue
  static const Color lightTajweedQalqalah = Color(0xFFDC2626); // Red
  static const Color lightTajweedMadda = Color(0xFF2563EB); // Blue
  static const Color lightTajweedSilent = Color(0xFF9CA3AF); // Gray

  // Nur extensions (Dark)
  static const Color darkSurfaceSunk = Color(0xFF08080A);
  static const Color darkForegroundSubtle = Color(0xFF74767C);
  static const Color darkForegroundFaint = Color(0xFF54565C);
  static const Color darkBorderStrong = Color(0xFF33353A);
  static const Color darkBrandGold = Color(0xFFE0AE55);
  static const Color darkBrandGoldStrong = Color(0xFFF0C378);
  static const Color darkBrandGoldSoft = Color(0xFF221A0C);
  static const Color darkReaderInk = Color(0xFFF7F5F0);

  // Tajweed Colors - Dark
  static const Color darkTajweedGhunnah = Color(0xFFF59E0B);
  static const Color darkTajweedIkhfa = Color(0xFFA855F7);
  static const Color darkTajweedIdgham = Color(0xFF22C55E);
  static const Color darkTajweedIqlab = Color(0xFF38BDF8);
  static const Color darkTajweedQalqalah = Color(0xFFEF4444);
  static const Color darkTajweedMadda = Color(0xFF3B82F6);
  static const Color darkTajweedSilent = Color(0xFF6B7280);
}

class NurColorsExtension extends ThemeExtension<NurColorsExtension> {
  final Color surfaceSunk;
  final Color foregroundSubtle;
  final Color foregroundFaint;
  final Color borderStrong;
  final Color brandGold;
  final Color brandGoldStrong;
  final Color brandGoldSoft;
  final Color readerInk;

  const NurColorsExtension({
    required this.surfaceSunk,
    required this.foregroundSubtle,
    required this.foregroundFaint,
    required this.borderStrong,
    required this.brandGold,
    required this.brandGoldStrong,
    required this.brandGoldSoft,
    required this.readerInk,
  });

  @override
  ThemeExtension<NurColorsExtension> copyWith({
    Color? surfaceSunk,
    Color? foregroundSubtle,
    Color? foregroundFaint,
    Color? borderStrong,
    Color? brandGold,
    Color? brandGoldStrong,
    Color? brandGoldSoft,
    Color? readerInk,
  }) {
    return NurColorsExtension(
      surfaceSunk: surfaceSunk ?? this.surfaceSunk,
      foregroundSubtle: foregroundSubtle ?? this.foregroundSubtle,
      foregroundFaint: foregroundFaint ?? this.foregroundFaint,
      borderStrong: borderStrong ?? this.borderStrong,
      brandGold: brandGold ?? this.brandGold,
      brandGoldStrong: brandGoldStrong ?? this.brandGoldStrong,
      brandGoldSoft: brandGoldSoft ?? this.brandGoldSoft,
      readerInk: readerInk ?? this.readerInk,
    );
  }

  @override
  ThemeExtension<NurColorsExtension> lerp(ThemeExtension<NurColorsExtension>? other, double t) {
    if (other is! NurColorsExtension) return this;
    return NurColorsExtension(
      surfaceSunk: Color.lerp(surfaceSunk, other.surfaceSunk, t)!,
      foregroundSubtle: Color.lerp(foregroundSubtle, other.foregroundSubtle, t)!,
      foregroundFaint: Color.lerp(foregroundFaint, other.foregroundFaint, t)!,
      borderStrong: Color.lerp(borderStrong, other.borderStrong, t)!,
      brandGold: Color.lerp(brandGold, other.brandGold, t)!,
      brandGoldStrong: Color.lerp(brandGoldStrong, other.brandGoldStrong, t)!,
      brandGoldSoft: Color.lerp(brandGoldSoft, other.brandGoldSoft, t)!,
      readerInk: Color.lerp(readerInk, other.readerInk, t)!,
    );
  }
}
