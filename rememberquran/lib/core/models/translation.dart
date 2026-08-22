/// Mirrors src/lib/translations.ts (the web app's translation registry) so
/// both clients agree on ids, the multi-select cap, and which translations
/// are CDN-only vs served by the QDC API.
enum TranslationSource { api, cdn }

class TranslationResource {
  final int id;
  final String name;
  final String language;
  final String lang;
  final bool isRtl;
  final TranslationSource source;
  final String? author;

  const TranslationResource({
    required this.id,
    required this.name,
    required this.language,
    required this.lang,
    required this.isRtl,
    required this.source,
    this.author,
  });
}

/// Soft cap for simultaneous active translations in the reader.
const int maxActiveTranslations = 3;

class TranslationIds {
  static const int saheehInternational = 20;

  /// CDN-sourced — never send this id to the quran.com / QDC API.
  static const int clearQuran = 131;
  static const int abdelHaleem = 85;
  static const int pickthall = 19;
  static const int yusufAli = 22;
  static const int taqiUsmani = 84;
  static const int hilaliKhan = 203;
  static const int maududi = 95;
  static const int bridges = 149;
  static const int junagarhi = 54;
}

const List<TranslationResource> allTranslations = [
  TranslationResource(
    id: TranslationIds.saheehInternational,
    name: 'Saheeh International',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Saheeh International',
  ),
  TranslationResource(
    id: TranslationIds.clearQuran,
    name: 'The Clear Quran — Dr Mustafa Khattab',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.cdn,
    author: 'Dr Mustafa Khattab',
  ),
  TranslationResource(
    id: TranslationIds.abdelHaleem,
    name: 'M.A.S. Abdel Haleem',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Abdul Haleem',
  ),
  TranslationResource(
    id: TranslationIds.pickthall,
    name: 'M. Pickthall',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Mohammed Marmaduke William Pickthall',
  ),
  TranslationResource(
    id: TranslationIds.yusufAli,
    name: 'A. Yusuf Ali',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Abdullah Yusuf Ali',
  ),
  TranslationResource(
    id: TranslationIds.taqiUsmani,
    name: 'T. Usmani',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Mufti Taqi Usmani',
  ),
  TranslationResource(
    id: TranslationIds.hilaliKhan,
    name: 'Al-Hilali & Khan',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Muhammad Taqi-ud-Din al-Hilali & Muhammad Muhsin Khan',
  ),
  TranslationResource(
    id: TranslationIds.maududi,
    name: 'A. Maududi (Tafhim)',
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Sayyid Abul Ala Maududi',
  ),
  TranslationResource(
    id: TranslationIds.bridges,
    name: "Bridges' translation",
    language: 'English',
    lang: 'en',
    isRtl: false,
    source: TranslationSource.api,
    author: 'Fadel Soliman',
  ),
  TranslationResource(
    id: TranslationIds.junagarhi,
    name: 'Maulana Muhammad Junagarhi',
    language: 'Urdu',
    lang: 'ur',
    isRtl: true,
    source: TranslationSource.api,
    author: 'Maulana Muhammad Junagarhi',
  ),
];

const List<int> defaultTranslationIds = [
  TranslationIds.saheehInternational,
  TranslationIds.clearQuran,
];

/// Full registry ids requested when loading a surah so the reader can switch
/// translations client-side without another network round-trip.
final List<int> bundleTranslationIds = allTranslations.map((t) => t.id).toList();

final Map<int, TranslationResource> _translationsById = {
  for (final t in allTranslations) t.id: t,
};

TranslationResource? getTranslationResource(int id) => _translationsById[id];

String getTranslationName(int id) => _translationsById[id]?.name ?? 'Translation';

/// Ids safe to pass to QDC / quran.com translation query params.
List<int> toApiTranslationIds(List<int> ids) =>
    ids.where((id) => _translationsById[id]?.source == TranslationSource.api).toList();

List<MapEntry<String, List<TranslationResource>>> translationsByLanguage() {
  final order = <String>[];
  final map = <String, List<TranslationResource>>{};
  for (final t in allTranslations) {
    if (!map.containsKey(t.language)) {
      map[t.language] = [];
      order.add(t.language);
    }
    map[t.language]!.add(t);
  }
  return [for (final language in order) MapEntry(language, map[language]!)];
}
