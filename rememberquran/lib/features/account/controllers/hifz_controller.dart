import 'package:get/get.dart';
import '../../../data/repositories/hifz_repository.dart';
import '../../account/controllers/auth_controller.dart';

class SurahProgress {
  final int surahId;
  final int memorisedCount;
  final int totalCount;
  
  double get percentage => totalCount > 0 ? memorisedCount / totalCount : 0.0;
  
  SurahProgress(this.surahId, this.memorisedCount, this.totalCount);
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
  
  final RxBool isLoading = true.obs;
  final RxList<MemorisedAyahRecord> memorisedAyahs = <MemorisedAyahRecord>[].obs;
  
  final RxList<SurahProgress> surahProgress = <SurahProgress>[].obs;
  final RxList<JuzProgress> juzProgress = <JuzProgress>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadData();
  }

  Future<void> _loadData() async {
    final authController = Get.find<AuthController>();
    final user = authController.firebaseUser.value;
    
    if (user == null) {
      isLoading.value = false;
      return;
    }

    try {
      isLoading.value = true;
      final ayahs = await repository.listMemorisedAyahs(user.uid);
      memorisedAyahs.assignAll(ayahs);
      
      _calculateProgress(ayahs);
    } finally {
      isLoading.value = false;
    }
  }
  
  void _calculateProgress(List<MemorisedAyahRecord> ayahs) {
    // 1. Calculate Surah Progress
    final Map<int, int> surahCounts = {};
    for (final ayah in ayahs) {
      surahCounts[ayah.surahId] = (surahCounts[ayah.surahId] ?? 0) + 1;
    }
    
    final List<SurahProgress> sProgress = [];
    for (int i = 1; i <= 114; i++) {
      final total = HifzRepository.getAyahCount(i);
      final memorised = surahCounts[i] ?? 0;
      sProgress.add(SurahProgress(i, memorised, total));
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
