/// Canonical definitions for the 30 Ajza' and 60 Ahzab / Quarters of the Quran.
/// Matches standard Hafs / King Fahd Complex Quran boundaries.
library;

class JuzDefinition {
  final int juz;
  final int startSurah;
  final int startAyah;
  final int endSurah;
  final int endAyah;
  final String nameArabic;

  const JuzDefinition({
    required this.juz,
    required this.startSurah,
    required this.startAyah,
    required this.endSurah,
    required this.endAyah,
    required this.nameArabic,
  });
}

class HizbDefinition {
  final int hizb;
  final int correspondingJuz;
  final int startSurah;
  final int startAyah;
  final String nameArabic;

  const HizbDefinition({
    required this.hizb,
    required this.correspondingJuz,
    required this.startSurah,
    required this.startAyah,
    required this.nameArabic,
  });
}

const List<int> kSurahAyahCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
];

/// 30 canonical Juz definitions
const List<JuzDefinition> kJuzDefinitions = [
  JuzDefinition(juz: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141, nameArabic: 'الم'),
  JuzDefinition(juz: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252, nameArabic: 'سَيَقُولُ'),
  JuzDefinition(juz: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92, nameArabic: 'تِلْكَ الرُّسُلُ'),
  JuzDefinition(juz: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23, nameArabic: 'لَنْ تَنَالُوا'),
  JuzDefinition(juz: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147, nameArabic: 'وَالْمُحْصَنَاتُ'),
  JuzDefinition(juz: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81, nameArabic: 'لَا يُحِبُّ اللَّهُ'),
  JuzDefinition(juz: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110, nameArabic: 'وَإِذَا سَمِعُوا'),
  JuzDefinition(juz: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87, nameArabic: 'وَلَوْ أَنَّنَا'),
  JuzDefinition(juz: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40, nameArabic: 'قَالَ الْمَلَأُ'),
  JuzDefinition(juz: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92, nameArabic: 'وَاعْلَمُوا'),
  JuzDefinition(juz: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5, nameArabic: 'يَعْتَذِرُونَ'),
  JuzDefinition(juz: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52, nameArabic: 'وَمَا مِنْ دَابَّةٍ'),
  JuzDefinition(juz: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52, nameArabic: 'وَمَا أُبَرِّئُ'),
  JuzDefinition(juz: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128, nameArabic: 'رُبَمَا'),
  JuzDefinition(juz: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74, nameArabic: 'سُبْحَانَ الَّذِي'),
  JuzDefinition(juz: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135, nameArabic: 'قَالَ أَلَمْ'),
  JuzDefinition(juz: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78, nameArabic: 'اقْتَرَبَ'),
  JuzDefinition(juz: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20, nameArabic: 'قَدْ أَفْلَحَ'),
  JuzDefinition(juz: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55, nameArabic: 'وَقَالَ الَّذِينَ'),
  JuzDefinition(juz: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45, nameArabic: 'فَمَا كَانَ جَوَابَ'),
  JuzDefinition(juz: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30, nameArabic: 'وَلَا تُجَادِلُوا'),
  JuzDefinition(juz: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27, nameArabic: 'وَمَنْ يَقْنُتْ'),
  JuzDefinition(juz: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31, nameArabic: 'وَمَا أَنْزَلْنَا'),
  JuzDefinition(juz: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46, nameArabic: 'فَمَنْ أَظْلَمُ'),
  JuzDefinition(juz: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37, nameArabic: 'إِلَيْهِ يُرَدُّ'),
  JuzDefinition(juz: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30, nameArabic: 'حم'),
  JuzDefinition(juz: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29, nameArabic: 'قَالَ فَمَا خَطْبُكُمْ'),
  JuzDefinition(juz: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12, nameArabic: 'قَدْ سَمِعَ اللَّهُ'),
  JuzDefinition(juz: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50, nameArabic: 'تَبَارَكَ الَّذِي'),
  JuzDefinition(juz: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6, nameArabic: 'عَمَّ'),
];

/// 60 canonical Hizb boundaries (2 Ahzab per Juz)
const List<HizbDefinition> kHizbDefinitions = [
  HizbDefinition(hizb: 1, correspondingJuz: 1, startSurah: 1, startAyah: 1, nameArabic: 'الحزب ١'),
  HizbDefinition(hizb: 2, correspondingJuz: 1, startSurah: 2, startAyah: 75, nameArabic: 'الحزب ٢'),
  HizbDefinition(hizb: 3, correspondingJuz: 2, startSurah: 2, startAyah: 142, nameArabic: 'الحزب ٣'),
  HizbDefinition(hizb: 4, correspondingJuz: 2, startSurah: 2, startAyah: 203, nameArabic: 'الحزب ٤'),
  HizbDefinition(hizb: 5, correspondingJuz: 3, startSurah: 2, startAyah: 253, nameArabic: 'الحزب ٥'),
  HizbDefinition(hizb: 6, correspondingJuz: 3, startSurah: 3, startAyah: 15, nameArabic: 'الحزب ٦'),
  HizbDefinition(hizb: 7, correspondingJuz: 4, startSurah: 3, startAyah: 93, nameArabic: 'الحزب ٧'),
  HizbDefinition(hizb: 8, correspondingJuz: 4, startSurah: 3, startAyah: 171, nameArabic: 'الحزب ٨'),
  HizbDefinition(hizb: 9, correspondingJuz: 5, startSurah: 4, startAyah: 24, nameArabic: 'الحزب ٩'),
  HizbDefinition(hizb: 10, correspondingJuz: 5, startSurah: 4, startAyah: 88, nameArabic: 'الحزب ١٠'),
  HizbDefinition(hizb: 11, correspondingJuz: 6, startSurah: 4, startAyah: 148, nameArabic: 'الحزب ١١'),
  HizbDefinition(hizb: 12, correspondingJuz: 6, startSurah: 5, startAyah: 27, nameArabic: 'الحزب ١٢'),
  HizbDefinition(hizb: 13, correspondingJuz: 7, startSurah: 5, startAyah: 82, nameArabic: 'الحزب ١٣'),
  HizbDefinition(hizb: 14, correspondingJuz: 7, startSurah: 6, startAyah: 36, nameArabic: 'الحزب ١٤'),
  HizbDefinition(hizb: 15, correspondingJuz: 8, startSurah: 6, startAyah: 111, nameArabic: 'الحزب ١٥'),
  HizbDefinition(hizb: 16, correspondingJuz: 8, startSurah: 7, startAyah: 1, nameArabic: 'الحزب ١٦'),
  HizbDefinition(hizb: 17, correspondingJuz: 9, startSurah: 7, startAyah: 88, nameArabic: 'الحزب ١٧'),
  HizbDefinition(hizb: 18, correspondingJuz: 9, startSurah: 7, startAyah: 171, nameArabic: 'الحزب ١٨'),
  HizbDefinition(hizb: 19, correspondingJuz: 10, startSurah: 8, startAyah: 41, nameArabic: 'الحزب ١٩'),
  HizbDefinition(hizb: 20, correspondingJuz: 10, startSurah: 9, startAyah: 34, nameArabic: 'الحزب ٢٠'),
  HizbDefinition(hizb: 21, correspondingJuz: 11, startSurah: 9, startAyah: 93, nameArabic: 'الحزب ٢١'),
  HizbDefinition(hizb: 22, correspondingJuz: 11, startSurah: 10, startAyah: 26, nameArabic: 'الحزب ٢٢'),
  HizbDefinition(hizb: 23, correspondingJuz: 12, startSurah: 11, startAyah: 6, nameArabic: 'الحزب ٢٣'),
  HizbDefinition(hizb: 24, correspondingJuz: 12, startSurah: 11, startAyah: 84, nameArabic: 'الحزب ٢٤'),
  HizbDefinition(hizb: 25, correspondingJuz: 13, startSurah: 12, startAyah: 53, nameArabic: 'الحزب ٢٥'),
  HizbDefinition(hizb: 26, correspondingJuz: 13, startSurah: 13, startAyah: 19, nameArabic: 'الحزب ٢٦'),
  HizbDefinition(hizb: 27, correspondingJuz: 14, startSurah: 15, startAyah: 1, nameArabic: 'الحزب ٢٧'),
  HizbDefinition(hizb: 28, correspondingJuz: 14, startSurah: 16, startAyah: 51, nameArabic: 'الحزب ٢٨'),
  HizbDefinition(hizb: 29, correspondingJuz: 15, startSurah: 17, startAyah: 1, nameArabic: 'الحزب ٢٩'),
  HizbDefinition(hizb: 30, correspondingJuz: 15, startSurah: 17, startAyah: 99, nameArabic: 'الحزب ٣٠'),
  HizbDefinition(hizb: 31, correspondingJuz: 16, startSurah: 18, startAyah: 75, nameArabic: 'الحزب ٣١'),
  HizbDefinition(hizb: 32, correspondingJuz: 16, startSurah: 19, startAyah: 59, nameArabic: 'الحزب ٣٢'),
  HizbDefinition(hizb: 33, correspondingJuz: 17, startSurah: 21, startAyah: 1, nameArabic: 'الحزب ٣٣'),
  HizbDefinition(hizb: 34, correspondingJuz: 17, startSurah: 22, startAyah: 19, nameArabic: 'الحزب ٣٤'),
  HizbDefinition(hizb: 35, correspondingJuz: 18, startSurah: 23, startAyah: 1, nameArabic: 'الحزب ٣٥'),
  HizbDefinition(hizb: 36, correspondingJuz: 18, startSurah: 24, startAyah: 21, nameArabic: 'الحزب ٣٦'),
  HizbDefinition(hizb: 37, correspondingJuz: 19, startSurah: 25, startAyah: 21, nameArabic: 'الحزب ٣٧'),
  HizbDefinition(hizb: 38, correspondingJuz: 19, startSurah: 26, startAyah: 111, nameArabic: 'الحزب ٣٨'),
  HizbDefinition(hizb: 39, correspondingJuz: 20, startSurah: 27, startAyah: 56, nameArabic: 'الحزب ٣٩'),
  HizbDefinition(hizb: 40, correspondingJuz: 20, startSurah: 28, startAyah: 51, nameArabic: 'الحزب ٤٠'),
  HizbDefinition(hizb: 41, correspondingJuz: 21, startSurah: 29, startAyah: 46, nameArabic: 'الحزب ٤١'),
  HizbDefinition(hizb: 42, correspondingJuz: 21, startSurah: 31, startAyah: 22, nameArabic: 'الحزب ٤٢'),
  HizbDefinition(hizb: 43, correspondingJuz: 22, startSurah: 33, startAyah: 31, nameArabic: 'الحزب ٤٣'),
  HizbDefinition(hizb: 44, correspondingJuz: 22, startSurah: 34, startAyah: 24, nameArabic: 'الحزب ٤٤'),
  HizbDefinition(hizb: 45, correspondingJuz: 23, startSurah: 36, startAyah: 28, nameArabic: 'الحزب ٤٥'),
  HizbDefinition(hizb: 46, correspondingJuz: 23, startSurah: 37, startAyah: 145, nameArabic: 'الحزب ٤٦'),
  HizbDefinition(hizb: 47, correspondingJuz: 24, startSurah: 39, startAyah: 32, nameArabic: 'الحزب ٤٧'),
  HizbDefinition(hizb: 48, correspondingJuz: 24, startSurah: 40, startAyah: 41, nameArabic: 'الحزب ٤٨'),
  HizbDefinition(hizb: 49, correspondingJuz: 25, startSurah: 41, startAyah: 47, nameArabic: 'الحزب ٤٩'),
  HizbDefinition(hizb: 50, correspondingJuz: 25, startSurah: 43, startAyah: 24, nameArabic: 'الحزب ٥٠'),
  HizbDefinition(hizb: 51, correspondingJuz: 26, startSurah: 46, startAyah: 1, nameArabic: 'الحزب ٥١'),
  HizbDefinition(hizb: 52, correspondingJuz: 26, startSurah: 48, startAyah: 18, nameArabic: 'الحزب ٥٢'),
  HizbDefinition(hizb: 53, correspondingJuz: 27, startSurah: 51, startAyah: 31, nameArabic: 'الحزب ٥٣'),
  HizbDefinition(hizb: 54, correspondingJuz: 27, startSurah: 54, startAyah: 9, nameArabic: 'الحزب ٥٤'),
  HizbDefinition(hizb: 55, correspondingJuz: 28, startSurah: 58, startAyah: 1, nameArabic: 'الحزب ٥٥'),
  HizbDefinition(hizb: 56, correspondingJuz: 28, startSurah: 62, startAyah: 1, nameArabic: 'الحزب ٥٦'),
  HizbDefinition(hizb: 57, correspondingJuz: 29, startSurah: 67, startAyah: 1, nameArabic: 'الحزب ٥٧'),
  HizbDefinition(hizb: 58, correspondingJuz: 29, startSurah: 72, startAyah: 1, nameArabic: 'الحزب ٥٨'),
  HizbDefinition(hizb: 59, correspondingJuz: 30, startSurah: 78, startAyah: 1, nameArabic: 'الحزب ٥٩'),
  HizbDefinition(hizb: 60, correspondingJuz: 30, startSurah: 87, startAyah: 1, nameArabic: 'الحزب ٦٠'),
];

/// Count the number of total ayahs in a given Juz range
int countAyahsInJuz(JuzDefinition juz) {
  int total = 0;
  for (int s = juz.startSurah; s <= juz.endSurah; s++) {
    final count = kSurahAyahCounts[s - 1];
    final from = s == juz.startSurah ? juz.startAyah : 1;
    final to = s == juz.endSurah ? juz.endAyah : count;
    if (to >= from) total += (to - from + 1);
  }
  return total;
}
