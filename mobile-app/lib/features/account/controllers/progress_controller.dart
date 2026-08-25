import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../data/repositories/goals_repository.dart';
import 'auth_controller.dart';

class DailyProgressData {
  final DateTime date;
  final int ayahsRead;

  DailyProgressData(this.date, this.ayahsRead);
}

class ProgressController extends GetxController {
  final GoalsRepository _goalsRepository = GoalsRepository();
  final AuthController _authController = Get.find<AuthController>();

  final RxList<DailyProgressData> last30Days = <DailyProgressData>[].obs;
  final RxInt totalAyahs30Days = 0.obs;
  final RxDouble avgAyahsPerDay = 0.0.obs;
  final RxString mostActiveDay = ''.obs;
  final RxBool isLoading = false.obs;

  StreamSubscription? _authSubscription;

  @override
  void onInit() {
    super.onInit();
    _loadProgress();
    
    _authSubscription = _authController.firebaseUser.listen((user) {
      _loadProgress();
    });
  }

  @override
  void onClose() {
    _authSubscription?.cancel();
    super.onClose();
  }

  Future<void> _loadProgress() async {
    final userId = _authController.firebaseUser.value?.uid;
    if (userId == null) {
      last30Days.clear();
      return;
    }

    isLoading.value = true;
    try {
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      
      final days = List.generate(30, (i) => today.subtract(Duration(days: 29 - i)));
      
      // Fetch concurrently for speed
      final futures = days.map((day) => _goalsRepository.sumAyahsForDay(userId, day)).toList();
      final results = await Future.wait(futures);
      
      final data = <DailyProgressData>[];
      int total = 0;
      int maxRead = -1;
      String maxDay = 'N/A';
      
      for (int i = 0; i < days.length; i++) {
        final ayahs = results[i];
        data.add(DailyProgressData(days[i], ayahs));
        total += ayahs;
        
        if (ayahs > maxRead && ayahs > 0) {
          maxRead = ayahs;
          maxDay = DateFormat('EEEE').format(days[i]); // e.g., "Monday"
        }
      }
      
      last30Days.assignAll(data);
      totalAyahs30Days.value = total;
      avgAyahsPerDay.value = total / 30.0;
      mostActiveDay.value = maxRead > 0 ? maxDay : 'N/A';
      
    } catch (e) {
      debugPrint('Error loading progress: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshProgress() async {
    await _loadProgress();
  }
}
