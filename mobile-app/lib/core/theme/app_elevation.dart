import 'package:flutter/material.dart';

/// Paper shadows — warm-tinted (rgba(43,41,37,…)), very low contrast. Never
/// pure black. shadowLg is reserved for dialogs; shadowPlayer is the one
/// upward-cast shadow, used by the docked audio player.
class AppElevation {
  static const Color _tint = Color(0xFF2B2925);

  static List<BoxShadow> get shadowSm => [
    BoxShadow(color: _tint.withOpacity(0.06), blurRadius: 6, offset: const Offset(0, 1)),
  ];

  static List<BoxShadow> get shadowMd => [
    BoxShadow(color: _tint.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, 4)),
  ];

  static List<BoxShadow> get shadowLg => [
    BoxShadow(color: _tint.withOpacity(0.12), blurRadius: 24, offset: const Offset(0, 8)),
  ];

  /// The docked audio player's shadow casts upward, away from the bottom edge.
  static List<BoxShadow> get shadowPlayer => [
    BoxShadow(color: _tint.withOpacity(0.10), blurRadius: 16, offset: const Offset(0, -4)),
  ];

  /// A 1px inset ring used only where a border would break layout — never a
  /// generic "sunken field" look; fields are bordered, not inset.
  static List<BoxShadow> get shadowInsetHairline => [
    BoxShadow(color: _tint.withOpacity(0.14), blurRadius: 0, spreadRadius: 0.5),
  ];
}
