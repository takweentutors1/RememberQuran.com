import 'package:get/get.dart';
import '../../../../data/datasources/remote/tafsir_remote_ds.dart';

class TafsirController extends GetxController {
  final TafsirRemoteDataSource _tafsirRemoteDs = Get.find<TafsirRemoteDataSource>();
  
  final rxIsLoading = false.obs;
  final rxTafsirData = Rx<Map<String, dynamic>?>(null);
  final rxError = Rx<String?>(null);

  final rxCurrentSlug = 'en-tafisr-ibn-kathir'.obs;
  
  int _currentSurahId = 1;
  int _currentAyahId = 1;

  final List<Map<String, String>> availableTafsirs = [
    {"slug": "en-tafisr-ibn-kathir", "name": "Ibn Kathir (Abridged)", "lang": "English"},
    {"slug": "en-tafsir-maarif-ul-quran", "name": "Ma'arif al-Qur'an", "lang": "English"},
    {"slug": "tazkirul-quran-en", "name": "Tazkirul Quran", "lang": "English"},
    {"slug": "ar-tafseer-al-saddi", "name": "Al-Sa'di", "lang": "Arabic"},
    {"slug": "ar-tafsir-muyassar", "name": "Tafsir Muyassar", "lang": "Arabic"},
  ];

  Future<void> loadTafsir(int surahId, int ayahId, {String? slug}) async {
    _currentSurahId = surahId;
    _currentAyahId = ayahId;
    if (slug != null) {
      rxCurrentSlug.value = slug;
    }

    rxIsLoading.value = true;
    rxError.value = null;
    rxTafsirData.value = null;

    try {
      final data = await _tafsirRemoteDs.getTafsir(rxCurrentSlug.value, surahId, ayahId);
      rxTafsirData.value = data;
    } catch (e) {
      rxError.value = 'Failed to load Tafsir: $e';
    } finally {
      rxIsLoading.value = false;
    }
  }

  Future<void> changeTafsirBook(String slug) async {
    await loadTafsir(_currentSurahId, _currentAyahId, slug: slug);
  }
}
