import 'package:flutter/material.dart';

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
        children: _parseTajweed(htmlText),
      ),
      textDirection: TextDirection.rtl,
    );
  }

  List<TextSpan> _parseTajweed(String text) {
    final List<TextSpan> spans = [];
    final regex = RegExp(r'<rule class=(.*?)>(.*?)</rule>');
    int lastMatchEnd = 0;

    for (final match in regex.allMatches(text)) {
      if (match.start > lastMatchEnd) {
        spans.add(TextSpan(text: text.substring(lastMatchEnd, match.start)));
      }
      
      final className = match.group(1)?.replaceAll('"', '').replaceAll("'", '') ?? '';
      final innerText = match.group(2) ?? '';
      
      spans.add(TextSpan(
        text: innerText,
        style: TextStyle(color: _getColorForTajweedClass(className)),
      ));
      
      lastMatchEnd = match.end;
    }

    if (lastMatchEnd < text.length) {
      spans.add(TextSpan(text: text.substring(lastMatchEnd)));
    }

    return spans;
  }

  Color _getColorForTajweedClass(String className) {
    switch (className) {
      case 'ghunnah':
        return const Color(0xFFFF7E1E); // Orange
      case 'ikhafa':
        return const Color(0xFF9400A8); // Purple
      case 'madda_normal':
      case 'madda_permissible':
      case 'madda_necesssary':
      case 'madda_obligatory':
        return const Color(0xFF537FFF); // Blue/Magenta
      case 'idgham_shafawi':
      case 'idgham_with_ghunnah':
      case 'idgham_without_ghunnah':
        return const Color(0xFF169200); // Green
      case 'iqlab':
        return const Color(0xFF26BFFF); // Light Blue
      case 'qalqalah':
        return const Color(0xFFDD0008); // Red
      case 'ham_wasl':
      case 'laam_shamsiyah':
      case 'silent':
      case 'madda_drop':
        return const Color(0xFFAAAAAA); // Grey
      default:
        return style.color ?? Colors.black; // Fallback
    }
  }
}
