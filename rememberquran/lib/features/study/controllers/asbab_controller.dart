import 'package:get/get.dart';
import '../../../../data/datasources/remote/asbab_remote_ds.dart';

class AsbabController extends GetxController {
  final AsbabRemoteDataSource _asbabRemoteDs = AsbabRemoteDataSource();
  
  final rxIsLoading = false.obs;
  final rxAsbabData = Rx<Map<String, dynamic>?>(null);
  final rxError = Rx<String?>(null);

  Future<void> loadAsbab(int surahId, int ayahId) async {
    rxIsLoading.value = true;
    rxError.value = null;
    rxAsbabData.value = null;

    try {
      final hasAsbab = await _asbabRemoteDs.hasAsbab(surahId, ayahId);
      if (!hasAsbab) {
        rxError.value = 'No Asbab al-Nuzul recorded for this verse.';
        return;
      }

      final data = await _asbabRemoteDs.getAsbab(surahId, ayahId);
      rxAsbabData.value = data;
    } catch (e) {
      rxError.value = 'Failed to load Asbab al-Nuzul: $e';
    } finally {
      rxIsLoading.value = false;
    }
  }
}
