import 'package:flutter/material.dart';

class TajweedRule {
  final String label;
  final String description;

  const TajweedRule({required this.label, required this.description});
}

class TajweedText {
  static const Map<String, TajweedRule> rules = {
    'ham_wasl': TajweedRule(label: "Hamzat al-Wasl", description: "Connecting hamza — silent when preceded by another word"),
    'laam_shamsiyah': TajweedRule(label: "Laam Shamsiyyah", description: "The laam is assimilated into the following sun letter"),
    'madda_normal': TajweedRule(label: "Madd Normal", description: "Natural elongation of two counts"),
    'madda_permissible': TajweedRule(label: "Madd Permissible", description: "Permissible elongation of 2, 4 or 6 counts"),
    'madda_necessary': TajweedRule(label: "Madd Necessary", description: "Obligatory elongation of 6 counts"),
    'madda_obligatory': TajweedRule(label: "Madd Obligatory", description: "Obligatory elongation — must be 4 or 5 counts"),
    'ghunnah': TajweedRule(label: "Ghunnah", description: "Nasalisation — 2-count nasal sound through the nose"),
    'qalaqah': TajweedRule(label: "Qalqalah", description: "Echoing sound on a stopped consonant (ق ط ب ج د)"),
    'ikhafa': TajweedRule(label: "Ikhfāʾ", description: "Concealment — nasal nun/tanwin before 15 letters"),
    'ikhafa_shafawi': TajweedRule(label: "Ikhfāʾ Shafawī", description: "Lip concealment — meem saakin before ba"),
    'idgham_ghunnah': TajweedRule(label: "Idghām with Ghunnah", description: "Merging with nasalisation into the next letter"),
    'idgham_wo_ghunnah': TajweedRule(label: "Idghām without Ghunnah", description: "Merging without nasalisation"),
    'idgham_mutajanisayn': TajweedRule(label: "Idghām Mutajānisayn", description: "Merging of two letters sharing the same articulation point"),
    'idgham_mutaqaribayn': TajweedRule(label: "Idghām Mutaqāribayn", description: "Merging of two letters with adjacent articulation points"),
    'iqlab': TajweedRule(label: "Iqlāb", description: "Conversion — noon saakin/tanwin becomes meem before ba"),
    'slnt': TajweedRule(label: "Silent", description: "Letter is written but not pronounced"),
    'custom-alef-maksora': TajweedRule(label: "Alef Maqsura", description: "Superscript alef on alef maqsura — elongated like a regular alef"),
  };

  static final Set<String> knownRules = rules.keys.toSet();

  static const String _openPrefix = "<rule class=";
  static const String _closeTag = "</rule>";
  static const String _tatweel = "\u0640";

  /// Split a `text_uthmani_tajweed` word string into colourable segments.
  static List<TajweedToken> _parseTajweedWord(String text) {
    List<TajweedToken> tokens = [];
    List<String> stack = [];

    String? activeRule() {
      for (int i = stack.length - 1; i >= 0; i--) {
        if (knownRules.contains(stack[i])) return stack[i];
      }
      return null;
    }

    void emit(String chunk) {
      if (chunk.isEmpty) return;
      final rule = activeRule();
      if (tokens.isNotEmpty && tokens.last.rule == rule) {
        tokens.last = TajweedToken(tokens.last.text + chunk, rule);
      } else {
        tokens.add(TajweedToken(chunk, rule));
      }
    }

    int i = 0;
    while (i < text.length) {
      if (text.startsWith(_openPrefix, i)) {
        int gt = text.indexOf(">", i + _openPrefix.length);
        if (gt == -1) {
          emit(text.substring(i));
          break;
        }
        String className = text.substring(i + _openPrefix.length, gt).trim();
        // Remove quotes if present
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

    if (tokens.isEmpty) {
      tokens.add(TajweedToken(text, null));
    }
    return tokens;
  }

  static void _pushSpan(List<TajweedToken> spans, String ch, String? rule) {
    if (spans.isNotEmpty && spans.last.rule == rule) {
      spans.last = TajweedToken(spans.last.text + ch, rule);
    } else {
      spans.add(TajweedToken(ch, rule));
    }
  }

  static List<TajweedToken> _spansFromRules(List<String> plainChars, List<String?> rules) {
    List<TajweedToken> spans = [];
    for (int i = 0; i < plainChars.length; i++) {
      _pushSpan(spans, plainChars[i], rules[i]);
    }
    return spans.isNotEmpty ? spans : [TajweedToken(plainChars.join(""), null)];
  }

  /// Converts a string into a list of unicode code points (like JS [...str])
  static List<String> _getCodePoints(String str) {
    return str.runes.map((r) => String.fromCharCode(r)).toList();
  }

  static List<TajweedToken> _buildTajweedTokens(String plainText, String tajweedMarkup) {
    List<TajweedToken> parsed = _parseTajweedWord(tajweedMarkup);
    List<_MarkedChar> marked = [];
    for (var token in parsed) {
      var points = _getCodePoints(token.text);
      for (var ch in points) {
        marked.add(_MarkedChar(ch, token.rule));
      }
    }

    List<String> plainChars = _getCodePoints(plainText);
    List<String?> alignedRules = [];
    int mi = 0;
    bool aligned = true;

    for (int pi = 0; pi < plainChars.length; pi++) {
      String pch = plainChars[pi];

      while (mi < marked.length && marked[mi].ch == _tatweel && pch != _tatweel) {
        mi++;
      }

      if (mi >= marked.length) {
        alignedRules.add(null);
        continue;
      }

      var m = marked[mi];

      if (pch == m.ch) {
        alignedRules.add(m.rule);
        mi++;
        continue;
      }

      if (pch == _tatweel && m.ch != _tatweel) {
        alignedRules.add(m.rule);
        continue;
      }

      aligned = false;
      break;
    }

    if (aligned && alignedRules.length == plainChars.length) {
      return _spansFromRules(plainChars, alignedRules);
    }

    List<_MarkedChar> markedNoTat = marked.where((m) => m.ch != _tatweel).toList();
    if (markedNoTat.length == plainChars.length) {
      return _spansFromRules(plainChars, markedNoTat.map((m) => m.rule).toList());
    }

    return [TajweedToken(plainText, null)];
  }

  /// Parses tajweed markup and applies colours to the plainText glyphs,
  /// ensuring word shape (and tatweels) match the plainText exactly,
  /// but colours reflect the tajweed rules.
  static TextSpan buildTextSpan({
    required String plainText,
    required String tajweedMarkup,
    TextStyle? defaultStyle,
    Map<String, TextStyle>? ruleStyles,
  }) {
    if (plainText.isEmpty) {
      return TextSpan(text: '', style: defaultStyle);
    }
    if (tajweedMarkup.isEmpty) {
      return TextSpan(text: plainText, style: defaultStyle);
    }

    List<TajweedToken> tokens = _buildTajweedTokens(plainText, tajweedMarkup);
    
    List<InlineSpan> spans = tokens.map((t) {
      TextStyle? style = defaultStyle;
      if (t.rule != null && ruleStyles != null && ruleStyles.containsKey(t.rule)) {
        style = (style ?? const TextStyle()).merge(ruleStyles[t.rule]);
      }
      return TextSpan(text: t.text, style: style);
    }).toList();

    return TextSpan(children: spans);
  }
}

class TajweedToken {
  final String text;
  final String? rule;

  TajweedToken(this.text, this.rule);
}

class _MarkedChar {
  final String ch;
  final String? rule;

  _MarkedChar(this.ch, this.rule);
}
