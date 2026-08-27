import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Type system: serif for voice, sans for interface.
///
/// - Newsreader (serif) — display/headings and long-form prose (translation
///   text). Headings are never bold; size carries the hierarchy.
/// - Public Sans (sans) — all UI chrome: nav, labels, buttons, metadata, at
///   500/600 weight.
/// - Noto Naskh Arabic — Arabic UI text (surah names in lists), so Uthmanic
///   Hafs stays reserved for the mushaf itself.
/// - JetBrains Mono — verse references and ayah numerals, so digits align.
///
/// Scale is a 1.20 minor third off a 15/16px base:
/// 11 / 13 / 16 / 19 / 23 / 28 / 33 / 40.
class AppTypography {
  static TextStyle serif({
    required double fontSize,
    FontWeight weight = FontWeight.w400,
    Color? color,
    double? height,
  }) => GoogleFonts.newsreader(
    fontSize: fontSize,
    fontWeight: weight,
    color: color,
    height: height,
  );

  static TextStyle sans({
    required double fontSize,
    FontWeight weight = FontWeight.w500,
    Color? color,
    double? letterSpacing,
    double? height,
  }) => GoogleFonts.publicSans(
    fontSize: fontSize,
    fontWeight: weight,
    color: color,
    letterSpacing: letterSpacing,
    height: height,
  );

  /// Arabic UI text (surah names in lists, reciter names) — never the
  /// Quranic verse text itself, which stays on Uthmanic Hafs.
  static TextStyle arabicUi({
    required double fontSize,
    FontWeight weight = FontWeight.w500,
    Color? color,
    double? height,
  }) => GoogleFonts.notoNaskhArabic(
    fontSize: fontSize,
    fontWeight: weight,
    color: color,
    height: height,
  );

  /// Verse references and numerals — digits align across list rows.
  static TextStyle mono({
    double fontSize = 13,
    FontWeight weight = FontWeight.w500,
    Color? color,
  }) => GoogleFonts.jetBrainsMono(
    fontSize: fontSize,
    fontWeight: weight,
    color: color,
  );

  /// Small-caps-style section label (Directory, Ayah of the day). Flutter
  /// has no reliable small-caps rendering across arbitrary text, so this is
  /// approximated with an uppercase transform (applied by the consuming
  /// EyebrowLabel widget) plus wide tracking — the same approximation most
  /// non-web UI toolkits use for this treatment.
  static TextStyle eyebrow({Color? color}) => sans(
    fontSize: 12,
    weight: FontWeight.w600,
    color: color,
    letterSpacing: 12 * 0.09,
  );

  static TextTheme textTheme(Color textColor, Color mutedColor) {
    return TextTheme(
      // Display/headline — serif, never bold, size carries hierarchy.
      displayLarge: serif(fontSize: 40, color: textColor),
      displayMedium: serif(fontSize: 33, color: textColor),
      displaySmall: serif(fontSize: 28, color: textColor),
      headlineLarge: serif(fontSize: 23, color: textColor),
      headlineMedium: serif(fontSize: 19, color: textColor),
      headlineSmall: serif(fontSize: 16, color: textColor),
      // Titles — sans semibold, for card/list headers and section titles.
      titleLarge: sans(fontSize: 19, weight: FontWeight.w600, color: textColor),
      titleMedium: sans(fontSize: 16, weight: FontWeight.w600, color: textColor),
      titleSmall: sans(fontSize: 13, weight: FontWeight.w600, color: textColor),
      // Body — serif for long-form prose (translations), matching the
      // reading register; bodySmall stays sans since the app already uses
      // it pervasively for compact UI/metadata text, not prose.
      bodyLarge: serif(fontSize: 16, color: textColor, height: 1.5),
      bodyMedium: serif(fontSize: 15, color: textColor, height: 1.5),
      bodySmall: sans(fontSize: 13, weight: FontWeight.w400, color: mutedColor),
      // Labels — sans, for buttons and nav.
      labelLarge: sans(fontSize: 15, weight: FontWeight.w600, color: textColor),
      labelMedium: sans(fontSize: 13, weight: FontWeight.w600, color: textColor),
      labelSmall: sans(fontSize: 11, weight: FontWeight.w600, color: mutedColor),
    );
  }
}
