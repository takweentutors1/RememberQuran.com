/**
 * Ayah of the day.
 *
 * Deliberately a static, curated table rather than an API call:
 *
 *  - The home page is the most-hit route on the site. Adding a network hop to
 *    render its hero would put a third-party API on the critical path for
 *    first paint, and a failure there would blank the most important element
 *    on the page.
 *  - The text never changes, so there is nothing to keep fresh.
 *  - Selection is pure and deterministic, so the whole page stays statically
 *    renderable and CDN-cacheable — no `dynamic`, no `no-store`.
 *
 * Text follows the Madani mushaf (Hafs). Translations are Dr. Mustafa
 * Khattab, The Clear Quran — the same edition used throughout the reader, so
 * the voice is consistent wherever a user lands.
 */

export interface DailyAyah {
  /** Canonical verse key, e.g. "54:17". */
  verseKey: string
  surahId: number
  ayahId: number
  /** Surah name, transliterated. */
  surah: string
  arabic: string
  translation: string
}

const AYAHS: readonly DailyAyah[] = [
  {
    verseKey: "54:17",
    surahId: 54,
    ayahId: 17,
    surah: "Al-Qamar",
    arabic: "وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    translation:
      "And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?",
  },
  {
    verseKey: "20:114",
    surahId: 20,
    ayahId: 114,
    surah: "Ta-Ha",
    arabic: "وَقُل رَّبِّ زِدْنِى عِلْمًا",
    translation: "And say, “My Lord, increase me in knowledge.”",
  },
  {
    verseKey: "2:286",
    surahId: 2,
    ayahId: 286,
    surah: "Al-Baqarah",
    arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not require of any soul more than what it can bear.",
  },
  {
    verseKey: "94:6",
    surahId: 94,
    ayahId: 6,
    surah: "Ash-Sharh",
    arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    translation: "Surely with hardship comes ease.",
  },
  {
    verseKey: "13:28",
    surahId: 13,
    ayahId: 28,
    surah: "Ar-Ra'd",
    arabic: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
    translation: "Surely in the remembrance of Allah do hearts find comfort.",
  },
  {
    verseKey: "2:153",
    surahId: 2,
    ayahId: 153,
    surah: "Al-Baqarah",
    arabic:
      "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ",
    translation: "O believers! Seek help through patience and prayer.",
  },
  {
    verseKey: "3:139",
    surahId: 3,
    ayahId: 139,
    surah: "Ali 'Imran",
    arabic: "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ",
    translation: "Do not falter or grieve, for you will have the upper hand.",
  },
  {
    verseKey: "65:3",
    surahId: 65,
    ayahId: 3,
    surah: "At-Talaq",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ",
    translation:
      "And whoever puts their trust in Allah, then He alone is sufficient for them.",
  },
  {
    verseKey: "40:60",
    surahId: 40,
    ayahId: 60,
    surah: "Ghafir",
    arabic: "وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ",
    translation: "Your Lord has proclaimed, “Call upon Me, I will respond to you.”",
  },
  {
    verseKey: "39:53",
    surahId: 39,
    ayahId: 53,
    surah: "Az-Zumar",
    arabic: "لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ",
    translation: "Do not despair of Allah’s mercy.",
  },
  {
    verseKey: "16:128",
    surahId: 16,
    ayahId: 128,
    surah: "An-Nahl",
    arabic:
      "إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ",
    translation:
      "Surely Allah is with those who are mindful of Him and who do good.",
  },
  {
    verseKey: "29:69",
    surahId: 29,
    ayahId: 69,
    surah: "Al-'Ankabut",
    arabic: "وَٱلَّذِينَ جَـٰهَدُوا۟ فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    translation:
      "As for those who struggle in Our cause, We will surely guide them along Our ways.",
  },
  {
    verseKey: "14:7",
    surahId: 14,
    ayahId: 7,
    surah: "Ibrahim",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    translation: "If you are grateful, I will certainly give you more.",
  },
  {
    verseKey: "17:82",
    surahId: 17,
    ayahId: 82,
    surah: "Al-Isra",
    arabic:
      "وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    translation:
      "We send down the Quran as a healing and mercy for the believers.",
  },
  {
    verseKey: "103:3",
    surahId: 103,
    ayahId: 3,
    surah: "Al-'Asr",
    arabic:
      "وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
    translation:
      "…and urge each other to the truth, and urge each other to patience.",
  },
  {
    verseKey: "2:152",
    surahId: 2,
    ayahId: 152,
    surah: "Al-Baqarah",
    arabic: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
    translation:
      "So remember Me; I will remember you. And be grateful to Me and never ungrateful.",
  },
  {
    verseKey: "3:159",
    surahId: 3,
    ayahId: 159,
    surah: "Ali 'Imran",
    arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى ٱللَّهِ",
    translation: "Then when you make a decision, put your trust in Allah.",
  },
  {
    verseKey: "7:56",
    surahId: 7,
    ayahId: 56,
    surah: "Al-A'raf",
    arabic: "إِنَّ رَحْمَتَ ٱللَّهِ قَرِيبٌ مِّنَ ٱلْمُحْسِنِينَ",
    translation: "Indeed, Allah’s mercy is always close to the good-doers.",
  },
  {
    verseKey: "93:5",
    surahId: 93,
    ayahId: 5,
    surah: "Ad-Duha",
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    translation:
      "And your Lord will certainly give to you so much that you will be pleased.",
  },
  {
    verseKey: "57:4",
    surahId: 57,
    ayahId: 4,
    surah: "Al-Hadid",
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translation: "And He is with you wherever you are.",
  },
  {
    verseKey: "50:16",
    surahId: 50,
    ayahId: 16,
    surah: "Qaf",
    arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ",
    translation: "We are closer to them than their jugular vein.",
  },
] as const

export const AYAH_OF_THE_DAY_COUNT = AYAHS.length

/**
 * Days since the Unix epoch, in UTC.
 *
 * UTC deliberately: the value must be identical on the server that renders
 * the page and on any client that later hydrates it, regardless of the
 * reader's timezone. A local-time day boundary would produce a hydration
 * mismatch for anyone east or west of the build machine.
 */
function utcDayIndex(now: Date): number {
  return Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  )
}

/**
 * The ayah for a given day. Pure — same input, same output, always.
 *
 * @param now Defaults to the current time. Injectable so this is testable and
 *            so callers can render a specific day if they ever need to.
 */
export function getAyahOfTheDay(now: Date = new Date()): DailyAyah {
  const index = ((utcDayIndex(now) % AYAHS.length) + AYAHS.length) % AYAHS.length
  return AYAHS[index]
}
