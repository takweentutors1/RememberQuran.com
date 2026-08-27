import 'package:get/get.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../core/utils/ayah_of_the_day.dart';

class HomeController extends GetxController {
  final QuranRepository repository;

  HomeController({required this.repository});

  final chapters = <Chapter>[].obs;
  final isLoading = true.obs;

  /// Directory filter — one of 'All', 'Makki', 'Madani'.
  final RxString directoryFilter = 'All'.obs;

  late final DailyAyah ayahOfTheDay;

  @override
  void onInit() {
    super.onInit();
    ayahOfTheDay = getAyahOfTheDay();
    loadChapters();
  }

  /// Chapters matching the current directory filter — reactive so the
  /// surah list rebuilds whenever [directoryFilter] or [chapters] changes.
  List<Chapter> get filteredChapters {
    final filter = directoryFilter.value;
    if (filter == 'All') return chapters;
    final wantsMakki = filter == 'Makki';
    return chapters.where((c) {
      final isMakki = c.revelationPlace.toLowerCase() == 'makkah';
      return wantsMakki ? isMakki : !isMakki;
    }).toList();
  }

  void setDirectoryFilter(String filter) => directoryFilter.value = filter;

  Future<void> loadChapters() async {
    isLoading.value = true;
    try {
      final data = await repository.getChapters();
      chapters.value = data;
    } catch (e) {
      // Handle error gracefully if needed
    } finally {
      isLoading.value = false;
    }
  }

  void onSurahTapped(Chapter chapter) {
    Get.toNamed('/surah/${chapter.id}');
  }
}
