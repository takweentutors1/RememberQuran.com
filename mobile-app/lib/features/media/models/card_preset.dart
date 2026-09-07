import 'package:flutter/material.dart';

/// Background theme presets for the Ayah Card designer — mirrors the web
/// app's `MEDIA_PRESETS` (src/lib/media/card-presets.ts) so cards look the
/// same whichever platform someone shares from.
class CardPreset {
  final String id;
  final String label;
  final List<Color> background;
  final Color foreground;
  final Color muted;
  final Color accent;

  const CardPreset({
    required this.id,
    required this.label,
    required this.background,
    required this.foreground,
    required this.muted,
    required this.accent,
  });
}

const List<CardPreset> kCardPresets = [
  CardPreset(
    id: 'minimal',
    label: 'Minimal',
    background: [Color(0xFFFAF8F5), Color(0xFFF3EFEA)],
    foreground: Color(0xFF1C1917),
    muted: Color(0xA61C1917),
    accent: Color(0xFF8C6D38),
  ),
  CardPreset(
    id: 'gold',
    label: 'Gold Illuminated',
    background: [Color(0xFF261F14), Color(0xFF15110B)],
    foreground: Color(0xFFF7EEDB),
    muted: Color(0xBFF7EEDB),
    accent: Color(0xFFD4AF37),
  ),
  CardPreset(
    id: 'dark-modern',
    label: 'Dark Modern',
    background: [Color(0xFF18181B), Color(0xFF09090B)],
    foreground: Color(0xFFFAFAFA),
    muted: Color(0xA6FAFAFA),
    accent: Color(0xFF38BDF8),
  ),
  CardPreset(
    id: 'jade',
    label: 'Jade',
    background: [Color(0xFF0E6B57), Color(0xFF094A3C)],
    foreground: Color(0xFFFDFBF6),
    muted: Color(0xB3FDFBF6),
    accent: Color(0xFFD8BC7E),
  ),
];

CardPreset getCardPreset(String? id) {
  return kCardPresets.firstWhere(
    (p) => p.id == id,
    orElse: () => kCardPresets.first,
  );
}
