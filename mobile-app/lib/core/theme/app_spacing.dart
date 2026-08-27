/// 4px base spacing scale — token name N maps to N × 4px (e.g. space16 = 64px),
/// matching the design system's --space-N custom properties.
class AppSpacing {
  static const double space1 = 4;
  static const double space2 = 8;
  static const double space3 = 12;
  static const double space4 = 16;
  static const double space5 = 20;
  static const double space6 = 24;
  static const double space8 = 32;
  static const double space10 = 40; // mobile section rhythm
  static const double space16 = 64; // desktop section rhythm

  /// Reading-column measure caps (logical pixels — Flutter has no ch unit,
  /// so these are a reasonable font-size-16 approximation of 66ch/44rem).
  static const double measureProse = 620;
  static const double measureQuran = 700;

  /// Content container caps.
  static const double containerXl = 1240;
  static const double containerMd = 820;
}
