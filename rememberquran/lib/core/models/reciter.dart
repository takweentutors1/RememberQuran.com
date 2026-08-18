class Reciter {
  final int id;
  final String name;
  final String arabicName;
  final String style;
  final bool hasWordTiming;
  final String baseUrl;

  const Reciter({
    required this.id,
    required this.name,
    required this.arabicName,
    required this.style,
    required this.hasWordTiming,
    this.baseUrl = '',
  });
}

const int defaultReciterId = 7;

const List<Reciter> reciters = [
  Reciter(id: 7, name: "Mishary Rashid Alafasy", arabicName: "مشاري راشد العفاسي", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/"),
  Reciter(id: 3, name: "Abdur-Rahman as-Sudais", arabicName: "عبدالرحمن السديس", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais/"),
  Reciter(id: 97, name: "Yasser Ad-Dussary", arabicName: "ياسر الدوسري", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.yasserdussary/"),
  Reciter(id: 2, name: "AbdulBaset AbdulSamad", arabicName: "عبد الباسط عبد الصمد", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/"),
  Reciter(id: 1, name: "AbdulBaset AbdulSamad", arabicName: "عبد الباسط عبد الصمد", style: "Mujawwad", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmujawwad/"),
  Reciter(id: 4, name: "Abu Bakr al-Shatri", arabicName: "أبو بكر الشاطري", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.shaatree/"),
  Reciter(id: 5, name: "Hani ar-Rifai", arabicName: "هاني الرفاعي", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.hanirifai/"),
  Reciter(id: 6, name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.husary/"),
  Reciter(id: 12, name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري", style: "Muallim", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.husarymuallim/"),
  Reciter(id: 10, name: "Saud ash-Shuraym", arabicName: "سعود الشريم", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.saudashuraym/"),
  Reciter(id: 161, name: "Khalifah Al Tunaiji", arabicName: "خليفة الطنيجي", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.khalifaaltunaiji/"),
  Reciter(id: 9, name: "Mohamed Siddiq al-Minshawi", arabicName: "محمد صديق المنشاوي", style: "Murattal", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.minshawi/"),
  Reciter(id: 168, name: "Mohamed Siddiq al-Minshawi", arabicName: "محمد صديق المنشاوي", style: "Kids repeat", hasWordTiming: true, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.minshawimujawwad/"),
  Reciter(id: 13, name: "Saad Al-Ghamdi", arabicName: "سعد الغامدي", style: "Murattal", hasWordTiming: false, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.saadalghamidi/"),
  Reciter(id: 65, name: "Maher Al Muaiqly", arabicName: "ماهر المعيقلي", style: "Murattal", hasWordTiming: false, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/"),
  Reciter(id: 170, name: "Khalid Al-Jaleel", arabicName: "خالد الجليل", style: "Murattal", hasWordTiming: false, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.khalidaljalil/"),
  Reciter(id: 167, name: "Ali Al-Huthaifi", arabicName: "علي الحذيفي", style: "Murattal", hasWordTiming: false, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.hudhaify/"),
  Reciter(id: 163, name: "Abdullah Basfar", arabicName: "عبدالله بصفر", style: "Murattal", hasWordTiming: false, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.abdullahbasfar/"),
  Reciter(id: 91, name: "Mohammad Al-Tablawi", arabicName: "محمد الطبلاوي", style: "Murattal", hasWordTiming: false, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.altablawi/"),
  Reciter(id: 160, name: "Bandar Baleela", arabicName: "بندر بليلة", style: "Murattal", hasWordTiming: false, baseUrl: "https://cdn.islamic.network/quran/audio/128/ar.bandarbaleela/"),
];

Reciter getReciter(int id) {
  return reciters.firstWhere(
    (r) => r.id == id,
    orElse: () => reciters.firstWhere(
      (r) => r.id == defaultReciterId,
      orElse: () => reciters.first,
    ),
  );
}

const String wordAudioBaseUrl = "https://audio.qurancdn.com/";
final RegExp wordAudioFileRe = RegExp(r'(\d{3}_\d{3}_)\d{3}(\.mp3(?:\?.*)?)$');

String? getWordAudioUrl(String? audioUrl, int position) {
  if (audioUrl == null || audioUrl.isEmpty) return null;

  final positionStr = position.toString().padLeft(3, '0');
  final normalized = audioUrl.replaceFirstMapped(
    wordAudioFileRe,
    (match) => '${match.group(1)}$positionStr${match.group(2)}',
  );

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  return wordAudioBaseUrl + normalized;
}
