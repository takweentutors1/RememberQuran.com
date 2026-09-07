import 'dart:async';
import 'package:get/get.dart';
import '../../../data/repositories/hifz_repository.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../account/controllers/auth_controller.dart';

class SurahProgress {
  final int surahId;
  final String surahName;
  final int memorisedCount;
  final int totalCount;

  double get percentage => totalCount > 0 ? memorisedCount / totalCount : 0.0;

  SurahProgress(this.surahId, this.surahName, this.memorisedCount, this.totalCount);
}

class JuzProgress {
  final int juz;
  final int memorisedCount;
  final int totalCount;
  
  double get percentage => totalCount > 0 ? memorisedCount / totalCount : 0.0;
  
  JuzProgress(this.juz, this.memorisedCount, this.totalCount);
}

class HifzController extends GetxController {
  final HifzRepository repository = HifzRepository();
  final QuranRepository _quranRepository = Get.find<QuranRepository>();

  final RxBool isLoading = true.obs;
  final RxList<MemorisedAyahRecord> memorisedAyahs = <MemorisedAyahRecord>[].obs;
  final RxList<MemorisedAyahRecord> dueReviews = <MemorisedAyahRecord>[].obs;
  
  final RxList<SurahProgress> surahProgress = <SurahProgress>[].obs;
  final RxList<JuzProgress> juzProgress = <JuzProgress>[].obs;

  StreamSubscription? _authSub;

  @override
  void onInit() {
    super.onInit();
    loadData();

    if (Get.isRegistered<AuthController>()) {
      _authSub = Get.find<AuthController>().firebaseUser.listen((user) {
        if (user == null) {
          memorisedAyahs.clear();
          dueReviews.clear();
          surahProgress.clear();
          juzProgress.clear();
        } else {
          loadData();
        }
      });
    }
  }

  @override
  void onClose() {
    _authSub?.cancel();
    super.onClose();
  }

  Future<void> loadData() async {
    final authController = Get.find<AuthController>();
    final user = authController.firebaseUser.value;
    
    if (user == null) {
      memorisedAyahs.clear();
      dueReviews.clear();
      surahProgress.clear();
      juzProgress.clear();
      isLoading.value = false;
      return;
    }

    try {
      isLoading.value = true;
      final ayahs = await repository.listMemorisedAyahs(user.uid);
      memorisedAyahs.assignAll(ayahs);
      
      final due = await repository.getDueReviews(user.uid);
      dueReviews.assignAll(due);

      // Names come from the local Drift DB (seeded at splash), so this is a
      // single fast local query, not a network round trip — previously the
      // tracker only ever showed "Surah 2", never the actual surah name.
      final chapters = await _quranRepository.getChapters();
      final chapterNames = {for (final c in chapters) c.id: c.nameSimple};

      _calculateProgress(ayahs, chapterNames);
    } finally {
      isLoading.value = false;
    }
  }

  void _calculateProgress(
    List<MemorisedAyahRecord> ayahs,
    Map<int, String> chapterNames,
  ) {
    // 1. Calculate Surah Progress
    final Map<int, int> surahCounts = {};
    for (final ayah in ayahs) {
      surahCounts[ayah.surahId] = (surahCounts[ayah.surahId] ?? 0) + 1;
    }

    final List<SurahProgress> sProgress = [];
    for (int i = 1; i <= 114; i++) {
      final total = HifzRepository.getAyahCount(i);
      final memorised = surahCounts[i] ?? 0;
      sProgress.add(
        SurahProgress(i, chapterNames[i] ?? 'Surah $i', memorised, total),
      );
    }
    surahProgress.assignAll(sProgress);
    
    // 2. Calculate Juz Progress
    final Map<int, int> juzCounts = {};
    for (final ayah in ayahs) {
      final juz = HifzRepository.getJuzForVerse(ayah.surahId, ayah.ayahId);
      if (juz != null) {
        juzCounts[juz] = (juzCounts[juz] ?? 0) + 1;
      }
    }
    
    final List<JuzProgress> jProgress = [];
    for (int i = 1; i <= 30; i++) {
      final total = HifzRepository.getJuzAyahCount(i);
      final memorised = juzCounts[i] ?? 0;
      jProgress.add(JuzProgress(i, memorised, total));
    }
    juzProgress.assignAll(jProgress);
  }
}
