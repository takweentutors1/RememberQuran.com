class DailyAyah {
  final String verseKey;
  final int surahId;
  final int ayahId;
  final String surah;
  final String arabic;
  final String translation;

  const DailyAyah({
    required this.verseKey,
    required this.surahId,
    required this.ayahId,
    required this.surah,
    required this.arabic,
    required this.translation,
  });
}

const List<DailyAyah> _ayahs = [
  DailyAyah(
    verseKey: "54:17",
    surahId: 54,
    ayahId: 17,
    surah: "Al-Qamar",
    arabic: "وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    translation:
      "And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?",
  ),
  DailyAyah(
    verseKey: "20:114",
    surahId: 20,
    ayahId: 114,
    surah: "Ta-Ha",
    arabic: "وَقُل رَّبِّ زِدْنِى عِلْمًا",
    translation: "And say, “My Lord, increase me in knowledge.”",
  ),
  DailyAyah(
    verseKey: "2:286",
    surahId: 2,
    ayahId: 286,
    surah: "Al-Baqarah",
    arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not require of any soul more than what it can bear.",
  ),
  DailyAyah(
    verseKey: "94:6",
    surahId: 94,
    ayahId: 6,
    surah: "Ash-Sharh",
    arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    translation: "Surely with hardship comes ease.",
  ),
  DailyAyah(
    verseKey: "13:28",
    surahId: 13,
    ayahId: 28,
    surah: "Ar-Ra'd",
    arabic: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
    translation: "Surely in the remembrance of Allah do hearts find comfort.",
  ),
  DailyAyah(
    verseKey: "2:153",
    surahId: 2,
    ayahId: 153,
    surah: "Al-Baqarah",
    arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ",
    translation: "O believers! Seek help through patience and prayer.",
  ),
  DailyAyah(
    verseKey: "3:139",
    surahId: 3,
    ayahId: 139,
    surah: "Ali 'Imran",
    arabic: "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ",
    translation: "Do not falter or grieve, for you will have the upper hand.",
  ),
  DailyAyah(
    verseKey: "65:3",
    surahId: 65,
    ayahId: 3,
    surah: "At-Talaq",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ",
    translation: "And whoever puts their trust in Allah, then He alone is sufficient for them.",
  ),
  DailyAyah(
    verseKey: "40:60",
    surahId: 40,
    ayahId: 60,
    surah: "Ghafir",
    arabic: "وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ",
    translation: "Your Lord has proclaimed, “Call upon Me, I will respond to you.”",
  ),
  DailyAyah(
    verseKey: "39:53",
    surahId: 39,
    ayahId: 53,
    surah: "Az-Zumar",
    arabic: "لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ",
    translation: "Do not despair of Allah’s mercy.",
  ),
  DailyAyah(
    verseKey: "16:128",
    surahId: 16,
    ayahId: 128,
    surah: "An-Nahl",
    arabic: "إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ",
    translation: "Surely Allah is with those who are mindful of Him and who do good.",
  ),
  DailyAyah(
    verseKey: "29:69",
    surahId: 29,
    ayahId: 69,
    surah: "Al-'Ankabut",
    arabic: "وَٱلَّذِينَ جَـٰهَدُوا۟ فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    translation: "As for those who struggle in Our cause, We will surely guide them along Our ways.",
  ),
  DailyAyah(
    verseKey: "14:7",
    surahId: 14,
    ayahId: 7,
    surah: "Ibrahim",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    translation: "If you are grateful, I will certainly give you more.",
  ),
  DailyAyah(
    verseKey: "17:82",
    surahId: 17,
    ayahId: 82,
    surah: "Al-Isra",
    arabic: "وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    translation: "We send down the Quran as a healing and mercy for the believers.",
  ),
  DailyAyah(
    verseKey: "103:3",
    surahId: 103,
    ayahId: 3,
    surah: "Al-'Asr",
    arabic: "وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
    translation: "…and urge each other to the truth, and urge each other to patience.",
  ),
  DailyAyah(
    verseKey: "2:152",
    surahId: 2,
    ayahId: 152,
    surah: "Al-Baqarah",
    arabic: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
    translation: "So remember Me; I will remember you. And be grateful to Me and never ungrateful.",
  ),
  DailyAyah(
    verseKey: "3:159",
    surahId: 3,
    ayahId: 159,
    surah: "Ali 'Imran",
    arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى ٱللَّهِ",
    translation: "Then when you make a decision, put your trust in Allah.",
  ),
  DailyAyah(
    verseKey: "7:56",
    surahId: 7,
    ayahId: 56,
    surah: "Al-A'raf",
    arabic: "إِنَّ رَحْمَتَ ٱللَّهِ قَرِيبٌ مِّنَ ٱلْمُحْسِنِينَ",
    translation: "Indeed, Allah’s mercy is always close to the good-doers.",
  ),
  DailyAyah(
    verseKey: "93:5",
    surahId: 93,
    ayahId: 5,
    surah: "Ad-Duha",
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    translation: "And your Lord will certainly give to you so much that you will be pleased.",
  ),
  DailyAyah(
    verseKey: "57:4",
    surahId: 57,
    ayahId: 4,
    surah: "Al-Hadid",
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translation: "And He is with you wherever you are.",
  ),
  DailyAyah(
    verseKey: "50:16",
    surahId: 50,
    ayahId: 16,
    surah: "Qaf",
    arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ",
    translation: "We are closer to them than their jugular vein.",
  ),
];

int _utcDayIndex(DateTime now) {
  final utcNow = now.toUtc();
  final epoch = DateTime.utc(1970, 1, 1);
  final current = DateTime.utc(utcNow.year, utcNow.month, utcNow.day);
  return current.difference(epoch).inDays;
}

DailyAyah getAyahOfTheDay([DateTime? now]) {
  now ??= DateTime.now();
  final index = ((_utcDayIndex(now) % _ayahs.length) + _ayahs.length) % _ayahs.length;
  return _ayahs[index];
}
