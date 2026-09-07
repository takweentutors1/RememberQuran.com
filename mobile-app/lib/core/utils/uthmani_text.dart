import 'package:flutter/material.dart';

/// Small-High Quranic annotation marks that UthmanicHafs — every version,
/// including the King Fahd Complex's own v2.2 (confirmed by inspecting its
/// actual glyph table) — classifies as full spacing glyphs instead of small
/// combining marks, so they render at near-full letter size instead of a
/// small raised mark. Isolating one in its own span lets it be shrunk and
/// raised independently.
///
/// Ported from the web app's `renderUthmaniText`
/// (src/lib/quran/uthmani-text.tsx), which only isolates U+06DF (silent
/// alif, e.g. وَتَوَاصَوْا۟). Extended here to also cover U+06E1 (small high
/// dotless head of khah, e.g. in 2:152's فَٱذۡكُرُونِيٓ) — the character
/// actually reported as rendering as an oversized circle. Add further
/// Small High marks to this list if they turn out to need the same
/// treatment (the general range is U+0610–U+061A and U+06D6–U+06E4).
const List<String> smallHighMarks = ['\u06DF', '\u06E1'];

/// Only safe to isolate where nothing needs to cursively join through it.
/// Most occurrences in the mushaf are word-final (followed by whitespace) —
/// mid-word cases (most commonly أُو۟لَـٰٓئِكَ) are left untouched, since
/// splitting the run there risks breaking Arabic letter-joining shaping
/// across the boundary. Matches the web behaviour exactly.
final RegExp _safeToIsolate = RegExp(
  '([${smallHighMarks.join()}])(?=\\s|\$)',
);

/// Builds the spans for a [Text.rich]/[RichText] that renders [text] with
/// every safely-isolatable small-high mark shrunk and raised, and
/// everything else rendered normally in [style].
List<InlineSpan> buildUthmaniSpans(String text, TextStyle style) {
  final matches = _safeToIsolate.allMatches(text).toList();
  if (matches.isEmpty) {
    return [TextSpan(text: text, style: style)];
  }

  final fontSize = style.fontSize ?? 16;
  final spans = <InlineSpan>[];
  var cursor = 0;

  for (final match in matches) {
    if (match.start > cursor) {
      spans.add(TextSpan(text: text.substring(cursor, match.start), style: style));
    }
    spans.add(
      WidgetSpan(
        alignment: PlaceholderAlignment.baseline,
        baseline: TextBaseline.alphabetic,
        child: Transform.translate(
          // Mirrors the web fix's `vertical-align: 0.6em` — raises the mark
          // above the baseline instead of sitting on it like a normal letter.
          offset: Offset(0, -fontSize * 0.6),
          child: Text(
            match.group(1)!,
            style: style.copyWith(fontSize: fontSize * 0.42, height: 1),
          ),
        ),
      ),
    );
    cursor = match.end;
  }

  if (cursor < text.length) {
    spans.add(TextSpan(text: text.substring(cursor), style: style));
  }

  return spans;
}

/// Drop-in replacement for `Text(text, style: style, ...)` that also fixes
/// the small-high-mark rendering bug described above.
class UthmaniText extends StatelessWidget {
  final String text;
  final TextStyle style;
  final TextAlign? textAlign;
  final TextDirection? textDirection;

  const UthmaniText(
    this.text, {
    super.key,
    required this.style,
    this.textAlign,
    this.textDirection = TextDirection.rtl,
  });

  @override
  Widget build(BuildContext context) {
    return Text.rich(
      TextSpan(children: buildUthmaniSpans(text, style)),
      textAlign: textAlign,
      textDirection: textDirection,
    );
  }
}
