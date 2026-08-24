import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('asbab decode', () {
    const jsonStr = '{"coverage":{"2":[14,21,26]}}';
    final indexCache = jsonDecode(jsonStr) as Map<String, dynamic>;
    final coverage = indexCache['coverage'] as Map<String, dynamic>?;
    final surahCoverage = coverage?['2'] as List<dynamic>?;
    print(surahCoverage);
    print(surahCoverage?.contains(14));
    print(surahCoverage?.contains(15));
  });
}
