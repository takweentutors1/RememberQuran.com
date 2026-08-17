import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class TajweedText extends StatelessWidget {
  final String htmlText;
  final TextStyle style;

  const TajweedText({
    Key? key,
    required this.htmlText,
    required this.style,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: style,
        children: _parseTajweed(context, htmlText),
      ),
      textDirection: TextDirection.rtl,
    );
  }

  List<TextSpan> _parseTajweed(BuildContext context, String text) {
    final List<TextSpan> spans = [];
    final regex = RegExp(r'<rule class=(.*?)>(.*?)</rule>');
    int lastMatchEnd = 0;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    for (final match in regex.allMatches(text)) {
      if (match.start > lastMatchEnd) {
        spans.add(TextSpan(text: text.substring(lastMatchEnd, match.start)));
      }
      
      final className = match.group(1)?.replaceAll('"', '').replaceAll("'", '') ?? '';
      final innerText = match.group(2) ?? '';
      
      spans.add(TextSpan(
        text: innerText,
        style: TextStyle(color: _getColorForTajweedClass(className, isDark)),
      ));
      
      lastMatchEnd = match.end;
    }

    if (lastMatchEnd < text.length) {
      spans.add(TextSpan(text: text.substring(lastMatchEnd)));
    }

    return spans;
  }

  Color _getColorForTajweedClass(String className, bool isDark) {
    switch (className) {
      case 'ghunnah':
        return isDark ? AppColors.darkTajweedGhunnah : AppColors.lightTajweedGhunnah;
      case 'ikhafa':
        return isDark ? AppColors.darkTajweedIkhfa : AppColors.lightTajweedIkhfa;
      case 'madda_normal':
      case 'madda_permissible':
      case 'madda_necesssary':
      case 'madda_obligatory':
        return isDark ? AppColors.darkTajweedMadda : AppColors.lightTajweedMadda;
      case 'idgham_shafawi':
      case 'idgham_with_ghunnah':
      case 'idgham_without_ghunnah':
        return isDark ? AppColors.darkTajweedIdgham : AppColors.lightTajweedIdgham;
      case 'iqlab':
        return isDark ? AppColors.darkTajweedIqlab : AppColors.lightTajweedIqlab;
      case 'qalqalah':
        return isDark ? AppColors.darkTajweedQalqalah : AppColors.lightTajweedQalqalah;
      case 'ham_wasl':
      case 'laam_shamsiyah':
      case 'silent':
      case 'madda_drop':
        return isDark ? AppColors.darkTajweedSilent : AppColors.lightTajweedSilent;
      default:
        return style.color ?? (isDark ? Colors.white : Colors.black); // Fallback
    }
  }
}
