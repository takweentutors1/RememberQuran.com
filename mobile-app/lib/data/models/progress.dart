class AyahRange {
  int from;
  int to;

  AyahRange({required this.from, required this.to});

  factory AyahRange.fromMap(Map<String, dynamic> map) {
    return AyahRange(
      from: map['from'] as int,
      to: map['to'] as int,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'from': from,
      'to': to,
    };
  }
}

class ProgressEventRecord {
  final int surah;
  final List<AyahRange> ranges;
  final DateTime date;

  ProgressEventRecord({
    required this.surah,
    required this.ranges,
    required this.date,
  });
}
