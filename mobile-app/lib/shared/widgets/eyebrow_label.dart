import 'package:flutter/material.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/app_colors.dart';

/// Small-caps-style section label — "Directory", "Ayah of the day", "On
/// this day in Islamic history". One contract for a treatment that
/// otherwise gets re-typed at every call site: uppercase, wide tracking,
/// semibold sans, gold by default since these labels sit above devotional
/// content rather than acting as controls.
class EyebrowLabel extends StatelessWidget {
  final String text;
  final Color? color;

  const EyebrowLabel(this.text, {super.key, this.color});

  @override
  Widget build(BuildContext context) {
    final nurColors = Theme.of(context).extension<NurColorsExtension>();
    return Text(
      text.toUpperCase(),
      style: AppTypography.eyebrow(color: color ?? nurColors?.brandGold),
    );
  }
}
