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

  static const String _openPrefix = '<rule class=';
  static const String _closeTag = '</rule>';

  /// Stack-based parser so nested `<rule>` tags (e.g. `custom-alef-maksora`
  /// nested inside `madda_normal`) are consumed correctly instead of being
  /// left as literal text by a non-greedy regex.
  List<TextSpan> _parseTajweed(BuildContext context, String text) {
    final List<TextSpan> spans = [];
    final List<String> stack = [];
    final isDark = Theme.of(context).brightness == Brightness.dark;

    void emit(String chunk) {
      if (chunk.isEmpty) return;
      final color = _colorForStack(stack, isDark);
      spans.add(TextSpan(text: chunk, style: color != null ? TextStyle(color: color) : null));
    }

    int i = 0;
    while (i < text.length) {
      if (text.startsWith(_openPrefix, i)) {
        final gt = text.indexOf('>', i + _openPrefix.length);
        if (gt == -1) {
          emit(text.substring(i));
          break;
        }
        var className = text.substring(i + _openPrefix.length, gt).trim();
        if ((className.startsWith('"') && className.endsWith('"')) ||
            (className.startsWith("'") && className.endsWith("'"))) {
          className = className.substring(1, className.length - 1);
        }
        stack.add(className);
        i = gt + 1;
        continue;
      }

      if (text.startsWith(_closeTag, i)) {
        if (stack.isNotEmpty) stack.removeLast();
        i += _closeTag.length;
        continue;
      }

      int nextOpen = text.indexOf(_openPrefix, i);
      int nextClose = text.indexOf(_closeTag, i);
      int next = text.length;
      if (nextOpen != -1 && nextOpen < next) next = nextOpen;
      if (nextClose != -1 && nextClose < next) next = nextClose;

      emit(text.substring(i, next));
      i = next;
    }

    return spans;
  }

  /// Walks the active tag stack from innermost to outermost so a nested
  /// but unmapped rule (e.g. `custom-alef-maksora`) inherits its parent's
  /// colour instead of falling back to the default text colour.
  Color? _colorForStack(List<String> stack, bool isDark) {
    for (int i = stack.length - 1; i >= 0; i--) {
      final color = _getColorForTajweedClass(stack[i], isDark);
      if (color != null) return color;
    }
    return null;
  }

  Color? _getColorForTajweedClass(String className, bool isDark) {
    switch (className) {
      case 'ghunnah':
        return isDark ? AppColors.darkTajweedGhunnah : AppColors.lightTajweedGhunnah;
      case 'ikhafa':
      case 'ikhafa_shafawi':
        return isDark ? AppColors.darkTajweedIkhfa : AppColors.lightTajweedIkhfa;
      case 'madda_normal':
      case 'madda_permissible':
      case 'madda_necessary':
      case 'madda_obligatory_monfasel':
      case 'madda_obligatory_mottasel':
      case 'custom-alef-maksora':
        return isDark ? AppColors.darkTajweedMadda : AppColors.lightTajweedMadda;
      case 'idgham_shafawi':
      case 'idgham_ghunnah':
      case 'idgham_wo_ghunnah':
      case 'idgham_mutajanisayn':
      case 'idgham_mutaqaribayn':
        return isDark ? AppColors.darkTajweedIdgham : AppColors.lightTajweedIdgham;
      case 'iqlab':
        return isDark ? AppColors.darkTajweedIqlab : AppColors.lightTajweedIqlab;
      case 'qalaqah':
        return isDark ? AppColors.darkTajweedQalqalah : AppColors.lightTajweedQalqalah;
      case 'ham_wasl':
      case 'laam_shamsiyah':
      case 'slnt':
        return isDark ? AppColors.darkTajweedSilent : AppColors.lightTajweedSilent;
      default:
        return null; // Unrecognised class: inherit the surrounding TextSpan's style.
    }
  }
}
