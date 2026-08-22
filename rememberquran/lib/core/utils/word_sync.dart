class Segment {
  final int position;
  final int startMs;
  final int endMs;

  const Segment(this.position, this.startMs, this.endMs);
}

class CleanVerseTiming {
  final String verseKey;
  final int verseNumber;
  final int from;
  final int to;
  final List<Segment> segments;

  const CleanVerseTiming({
    required this.verseKey,
    required this.verseNumber,
    required this.from,
    required this.to,
    required this.segments,
  });
}

/// The API returns real-world dirt (verified 2026-07): interleaved
/// single-element arrays (Alafasy 1:3), float timestamps (Sudais), and first
/// segments starting slightly before the verse's own timestamp_from. Keep only
/// well-formed [position, start, end] triples with position >= 1.
List<CleanVerseTiming> sanitizeTimings(List<dynamic> timings) {
  return timings.map((dynamic t) {
    final Map<String, dynamic> timingMap = t as Map<String, dynamic>;
    
    final rawSegments = timingMap['segments'] as List<dynamic>? ?? [];
    
    final List<Segment> segments = [];
    for (var s in rawSegments) {
      if (s is List && s.length >= 3) {
        final num1 = s[0] as num?;
        final num2 = s[1] as num?;
        final num3 = s[2] as num?;
        
        if (num1 != null && num2 != null && num3 != null) {
          final pos = num1.toInt();
          final start = num2.toInt();
          final end = num3.toInt();
          
          if (pos >= 1 && end > start) {
            segments.add(Segment(pos, start, end));
          }
        }
      }
    }
    
    segments.sort((a, b) => a.startMs.compareTo(b.startMs));
    
    final verseKey = timingMap['verse_key'] as String? ?? '';
    final verseParts = verseKey.split(':');
    final verseNumber = verseParts.length > 1 ? int.tryParse(verseParts[1]) ?? 0 : 0;
    
    return CleanVerseTiming(
      verseKey: verseKey,
      verseNumber: verseNumber,
      from: (timingMap['timestamp_from'] as num?)?.toInt() ?? 0,
      to: (timingMap['timestamp_to'] as num?)?.toInt() ?? 0,
      segments: segments,
    );
  }).toList();
}

/// Index of the verse whose [from, to) window contains timeMs, clamped to
/// [0, length - 1]. Segments can start slightly before their verse window, so
/// always resolve the verse first and only then the word within it.
int findVerseIndex(List<CleanVerseTiming> timings, int timeMs) {
  if (timings.isEmpty) return -1;
  int lo = 0;
  int hi = timings.length - 1;
  while (lo < hi) {
    int mid = (lo + hi + 1) >> 1;
    if (timings[mid].from <= timeMs) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}

/// Word position recited at timeMs within one verse, or null during gaps
/// (pauses, madd tails) — callers keep the previous highlight on null to
/// avoid flicker.
int? findWordPosition(CleanVerseTiming timing, int timeMs) {
  final segs = timing.segments;
  if (segs.isEmpty) return null;
  int lo = 0;
  int hi = segs.length - 1;
  while (lo < hi) {
    int mid = (lo + hi + 1) >> 1;
    if (segs[mid].startMs <= timeMs) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  final seg = segs[lo];
  return (seg.startMs <= timeMs && timeMs < seg.endMs) ? seg.position : null;
}
