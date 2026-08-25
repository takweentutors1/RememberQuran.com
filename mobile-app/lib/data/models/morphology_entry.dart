/// Per-word morphology from the Quranic Arabic Corpus (root, lemma, part of
/// speech, grammatical features) — bundled locally as JSON assets, not
/// fetched over the network. See MorphologyLocalDataSource.
class MorphologyEntry {
  final String pos;
  final String lemma;
  final String root;
  final String rootLatin;
  final List<String> features;

  const MorphologyEntry({
    required this.pos,
    required this.lemma,
    required this.root,
    required this.rootLatin,
    required this.features,
  });

  factory MorphologyEntry.fromJson(Map<String, dynamic> json) {
    return MorphologyEntry(
      pos: json['pos'] as String? ?? '',
      lemma: json['lemma'] as String? ?? '',
      root: json['root'] as String? ?? '',
      rootLatin: json['rootLatin'] as String? ?? '',
      features:
          (json['features'] as List<dynamic>? ?? const [])
              .map((f) => f.toString())
              .toList(),
    );
  }
}
