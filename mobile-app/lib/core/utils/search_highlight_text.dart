import 'package:flutter/material.dart';

class SearchHighlightText {
  /// Split a translation string containing <em>…</em> highlights into a TextSpan.
  /// Edge cases:
  /// - No <em> tags → single segment
  /// - Consecutive <em> tags → each becomes its own highlight segment
  /// - Empty string → returns empty TextSpan
  /// - Malformed/unclosed tag → rest of string treated as plain text
  static TextSpan buildHighlights({
    required String text,
    TextStyle? defaultStyle,
    TextStyle? highlightStyle,
  }) {
    if (text.isEmpty) {
      return TextSpan(text: '', style: defaultStyle);
    }

    final re = RegExp(r'<em>(.*?)<\/em>|([^<]+)|<[^>]*>');
    final matches = re.allMatches(text);
    final spans = <InlineSpan>[];

    for (final match in matches) {
      if (match.group(1) != null) {
        // <em>…</em> group
        spans.add(TextSpan(text: match.group(1), style: highlightStyle));
      } else if (match.group(2) != null) {
        // plain text (no angle brackets)
        spans.add(TextSpan(text: match.group(2), style: defaultStyle));
      }
      // Unknown tags (group 0 starts with <) are silently dropped
    }

    if (spans.isEmpty) {
      spans.add(TextSpan(text: text, style: defaultStyle));
    }

    return TextSpan(children: spans);
  }
}
