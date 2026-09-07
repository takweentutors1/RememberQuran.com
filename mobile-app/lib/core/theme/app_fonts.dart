/// Font family names used across the app. Uthmanic Hafs/Amiri Quran/King
/// Fahd Complex are bundled TTF assets (see pubspec.yaml) reserved for the
/// mushaf itself and the reader's font-choice setting. Arabic UI chrome
/// (surah names in lists) and the Latin UI/prose faces come from
/// google_fonts — see AppTypography.
class AppFonts {
  static const String amiriQuran = 'AmiriQuran';
  static const String uthmanicHafs = 'UthmanicHafs';

  /// King Fahd Glorious Quran Printing Complex's official Hafs font, as
  /// served by quran.com — same asset as [uthmanicHafs], registered under
  /// its own family name (see pubspec.yaml) for a distinct reader font
  /// choice.
  static const String kingFahdComplex = 'KingFahdComplex';
}
