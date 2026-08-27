import 'package:flutter/material.dart';

/// RememberQuran design system palette — jade green (brand/primary action),
/// gold (decoration and reverence, never a button), warm cream paper, and a
/// warm (never blue-grey) ink neutral ramp. See the design system's
/// Colour section for the source tokens this file mirrors.
class AppColors {
  // Brand ramp — shared across light/dark, referenced directly by
  // components that need the raw brand colour rather than a semantic role
  // (e.g. a medallion border, a gradient stop).
  static const Color jade400 = Color(0xFF3FC09B); // dark-mode primary (lifted for contrast)
  static const Color jade500 = Color(0xFF2AA583);
  static const Color jade700 = Color(0xFF0E6B57); // light-mode primary button
  static const Color jade800 = Color(0xFF0C5F4D); // hover / deep ink inside the mark
  static const Color jade900 = Color(0xFF0A4F40); // active/pressed

  static const Color gold300 = Color(0xFFE6C982);
  static const Color gold600 = Color(0xFFB58A45);

  static const Color cream50 = Color(0xFFFDFBF6); // page
  static const Color cream200 = Color(0xFFF4EEDE); // tinted hero/band

  // Warm ink ramp — never blue-grey, never pure black.
  static const Color ink200 = Color(0xFFE4DFD3);
  static const Color ink500 = Color(0xFF7A7568);
  static const Color ink800 = Color(0xFF3A352C);
  static const Color ink900 = Color(0xFF241F17); // mushaf text
  static const Color ink950 = Color(0xFF17140F); // dark-mode ground

  // Semantic hues — deliberately desaturated so no status competes with jade.
  static const Color info500 = Color(0xFF3D7EA6);
  static const Color success500 = Color(0xFF2F8F5B);
  static const Color warn500 = Color(0xFFB8801F);
  static const Color danger500 = Color(0xFFB04437);

  // Light Mode Colors
  static const Color lightBackground = cream50;
  static const Color lightForeground = ink800;
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightCardForeground = ink800;
  static const Color lightPopover = Color(0xFFFFFFFF);
  static const Color lightPopoverForeground = ink800;
  static const Color lightPrimary = jade700;
  static const Color lightPrimaryForeground = Color(0xFFFFFFFF);
  static const Color lightSecondary = cream200;
  static const Color lightSecondaryForeground = ink800;
  static const Color lightMuted = cream200;
  static const Color lightMutedForeground = ink500;
  static const Color lightAccent = Color(0xFFE3F3EE); // surface-accent-soft (jade tint)
  static const Color lightAccentForeground = jade700;
  static const Color lightDestructive = danger500;
  static const Color lightBorder = ink200;
  static const Color lightInput = ink200;
  static const Color lightRing = jade700; // focus ring is jade, not gold

  // Nur extensions (Light)
  static const Color lightSurfaceSunk = cream200;
  static const Color lightForegroundSubtle = ink500;
  static const Color lightForegroundFaint = Color(0xFFA79F8E);
  static const Color lightBorderStrong = Color(0xFFC9C2B0);
  static const Color lightBrandGold = gold600; // readable gold-on-cream
  static const Color lightBrandGoldStrong = Color(0xFF96702E);
  static const Color lightBrandGoldSoft = Color(0xFFF7EDD9);
  static const Color lightReaderInk = ink900;

  // Dark Mode Colors — a reading mode, not an inverted UI.
  static const Color darkBackground = ink950;
  static const Color darkForeground = Color(0xFFF7F4EC);
  static const Color darkCard = Color(0xFF211D17);
  static const Color darkCardForeground = Color(0xFFF7F4EC);
  static const Color darkPopover = Color(0xFF211D17);
  static const Color darkPopoverForeground = Color(0xFFF7F4EC);
  static const Color darkPrimary = jade400; // jade lifted for contrast on dark ground
  static const Color darkPrimaryForeground = ink950;
  static const Color darkSecondary = Color(0xFF2A251D);
  static const Color darkSecondaryForeground = Color(0xFFF7F4EC);
  static const Color darkMuted = Color(0xFF2A251D);
  static const Color darkMutedForeground = Color(0xFFB7AE9C);
  static const Color darkAccent = Color(0xFF16302A); // dark jade tint
  static const Color darkAccentForeground = jade400;
  static const Color darkDestructive = Color(0xFFD0685A); // lightened danger for dark contrast
  static const Color darkBorder = Color(0xFF332D23);
  static const Color darkInput = Color(0xFF332D23);
  static const Color darkRing = jade400;

  // Tajweed Colors - Light (pedagogical colour-coding, unrelated to brand
  // palette — left as-is; each rule must stay visually distinct regardless
  // of the surrounding rebrand).
  static const Color lightTajweedGhunnah = Color(0xFFD97706); // Amber/Orange
  static const Color lightTajweedIkhfa = Color(0xFF9333EA); // Purple
  static const Color lightTajweedIdgham = Color(0xFF16A34A); // Green
  static const Color lightTajweedIqlab = Color(0xFF0284C7); // Light Blue
  static const Color lightTajweedQalqalah = Color(0xFFDC2626); // Red
  static const Color lightTajweedMadda = Color(0xFF2563EB); // Blue
  static const Color lightTajweedSilent = Color(0xFF9CA3AF); // Gray

  // Nur extensions (Dark)
  static const Color darkSurfaceSunk = Color(0xFF100E0A);
  static const Color darkForegroundSubtle = Color(0xFF9C9380);
  static const Color darkForegroundFaint = Color(0xFF6E6656);
  static const Color darkBorderStrong = Color(0xFF453D30);
  static const Color darkBrandGold = gold300; // gold kept at --gold-300 in dark mode
  static const Color darkBrandGoldStrong = Color(0xFFF0DBA8);
  static const Color darkBrandGoldSoft = Color(0xFF2E2716);
  static const Color darkReaderInk = Color(0xFFF7F4EC);

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
