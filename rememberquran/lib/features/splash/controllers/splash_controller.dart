import 'dart:async';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../firebase_options.dart';
import '../../../app/routes/app_routes.dart';
import '../../onboarding/views/onboarding_view.dart';
import '../../audio/services/audio_handler.dart';
import '../../audio/controllers/audio_controller.dart';
import '../../../data/datasources/remote/audio_remote_ds.dart';
import '../../../data/datasources/remote/quran_remote_ds.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/repositories/audio_repository.dart';
import '../../account/controllers/auth_controller.dart';
import '../../account/controllers/notes_controller.dart';
import '../../notifications/controllers/notifications_controller.dart';
import '../../shortcuts/controllers/shortcuts_controller.dart';
import '../../reader/controllers/reader_settings_controller.dart';

class SplashController extends GetxController {
  final RxDouble loadingProgress = 0.0.obs;
  final RxString loadingText = 'Starting...'.obs;
  final RxString errorMsg = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // Step 1: Firebase
      loadingText.value = 'Bismillah... Starting with the Name of Allah';
      loadingProgress.value = 0.2;
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(!kDebugMode);
      FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
      PlatformDispatcher.instance.onError = (error, stack) {
        FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
        return true;
      };

      // Step 2: Database & Data Sources
      loadingText.value = 'Preparing the Noble Verses...';
      loadingProgress.value = 0.4;
      final dio = Dio();
      final quranRemoteDs = QuranRemoteDataSource(dio: dio);
      final quranDb = QuranDatabase();
      Get.put<QuranRemoteDataSource>(quranRemoteDs, permanent: true);
      Get.put<QuranDatabase>(quranDb, permanent: true);
      final quranRepository = QuranRepository(localDb: quranDb, remoteDs: quranRemoteDs);
      Get.put<QuranRepository>(quranRepository, permanent: true);
      unawaited(quranRepository.seedIfEmpty().catchError((Object e, StackTrace st) {
        FirebaseCrashlytics.instance.recordError(e, st, fatal: false);
      }));

      // Step 3: Audio Services
      loadingText.value = 'Tuning the beautiful recitations...';
      loadingProgress.value = 0.6;
      final audioHandler = await initAudioService();
      final audioRemoteDs = AudioRemoteDataSource();
      Get.put<QuranAudioHandler>(audioHandler, permanent: true);
      Get.put<AudioRemoteDataSource>(audioRemoteDs, permanent: true);
      Get.put<AudioRepository>(
        AudioRepository(localDb: quranDb, remoteDs: audioRemoteDs),
        permanent: true,
      );

      // Step 4: Controllers
      loadingText.value = 'Setting up your personal journey...';
      loadingProgress.value = 0.8;
      Get.put<AudioController>(AudioController(), permanent: true);
      Get.put<AuthController>(AuthController(), permanent: true);
      Get.put<NotesController>(NotesController(), permanent: true);
      Get.put<NotificationsController>(NotificationsController(), permanent: true);
      Get.put<ShortcutsController>(ShortcutsController(), permanent: true);
      Get.put<ReaderSettingsController>(ReaderSettingsController(), permanent: true);

      // Step 5: Final Check & Navigate
      loadingText.value = 'Alhamdulillah, ready to begin.';
      loadingProgress.value = 1.0;
      final prefs = await SharedPreferences.getInstance();
      final hasSeenOnboarding = prefs.getBool(OnboardingView.prefsKey) ?? false;
      
      await Future.delayed(const Duration(milliseconds: 600)); // slight pause for UX
      Get.offAllNamed(hasSeenOnboarding ? Routes.HOME : Routes.ONBOARDING);

    } catch (e, stack) {
      if (Firebase.apps.isNotEmpty) {
        FirebaseCrashlytics.instance.recordError(e, stack, fatal: true);
      }
      errorMsg.value = 'Failed to initialize app: $e';
    }
  }
}
