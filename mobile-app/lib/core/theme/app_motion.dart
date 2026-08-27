import 'package:flutter/material.dart';

/// Calm and short. Fades and small translations only — no bounce, no
/// spring, no overshoot, no parallax, no auto-playing animation. The one
/// ambient exception (the audio player's playing-indicator pulse) sets its
/// own duration where it's used.
class AppMotion {
  static const Duration durFast = Duration(milliseconds: 140); // colour changes
  static const Duration durBase = Duration(milliseconds: 220); // movement/elevation
  static const Duration durSlow = Duration(milliseconds: 360); // panel/sheet entry

  static const Curve easeStandard = Curves.easeInOut; // state changes
  static const Curve easeOut = Curves.easeOut; // entrances

  /// Press "settle" — darken one step + this scale. Not a squash, no
  /// overshoot.
  static const double pressScale = 0.985;
}
