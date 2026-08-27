import 'package:flutter/material.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/app_colors.dart';

/// The surah number chip used in directory rows, pickers, and cards. Not an
/// icon — a typographic element: a gold-bordered rounded square with the
/// numeral set in mono type so digits align down a list.
class SurahMedallion extends StatelessWidget {
  final int number;
  final double size;

  const SurahMedallion({super.key, required this.number, this.size = 32});

  @override
  Widget build(BuildContext context) {
    final nurColors = Theme.of(context).extension<NurColorsExtension>();
    final gold = nurColors?.brandGold ?? AppColors.gold600;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.28),
        border: Border.all(color: gold.withOpacity(0.55), width: 1.5),
      ),
      child: Text(
        '$number',
        style: AppTypography.mono(fontSize: size * 0.4, weight: FontWeight.w600, color: gold),
      ),
    );
  }
}
