import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'firebase_options.dart';
import 'app/routes/app_pages.dart';
import 'app/routes/app_routes.dart';
import 'features/onboarding/views/onboarding_view.dart';
import 'core/theme/app_theme.dart';
import 'features/audio/services/audio_handler.dart';
import 'features/audio/controllers/audio_controller.dart';
import 'data/datasources/remote/audio_remote_ds.dart';
import 'data/datasources/remote/quran_remote_ds.dart';
import 'data/datasources/local/quran_db.dart';
import 'data/repositories/quran_repository.dart';
import 'data/repositories/audio_repository.dart';
import 'features/account/controllers/auth_controller.dart';
import 'features/notifications/controllers/notifications_controller.dart';
import 'features/shortcuts/controllers/shortcuts_controller.dart';
import 'features/reader/controllers/reader_settings_controller.dart';

void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    // Crash reporting: only report crashes from real installs, not local dev.
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(!kDebugMode);
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };

    await _runApp();
  }, (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
  });
}

Future<void> _runApp() async {
  final dio = Dio();
  final quranRemoteDs = QuranRemoteDataSource(dio: dio);
  final quranDb = QuranDatabase();
  Get.put<QuranRemoteDataSource>(quranRemoteDs, permanent: true);
  Get.put<QuranDatabase>(quranDb, permanent: true);
  final quranRepository = QuranRepository(localDb: quranDb, remoteDs: quranRemoteDs);
  Get.put<QuranRepository>(quranRepository, permanent: true);

  // Pre-seed the offline Quran text database on first launch; the app remains
  // usable via the per-surah cache-first fetches if this fails (e.g. no network).
  unawaited(quranRepository.seedIfEmpty().catchError((_) {}));

  final audioHandler = await initAudioService();
  final audioRemoteDs = AudioRemoteDataSource();
  Get.put<QuranAudioHandler>(audioHandler, permanent: true);
  Get.put<AudioRemoteDataSource>(audioRemoteDs, permanent: true);
  Get.put<AudioRepository>(
    AudioRepository(localDb: quranDb, remoteDs: audioRemoteDs),
    permanent: true,
  );
  Get.put<AudioController>(AudioController(), permanent: true);
  Get.put<AuthController>(AuthController(), permanent: true);
  Get.put<NotificationsController>(NotificationsController(), permanent: true);
  Get.put<ShortcutsController>(ShortcutsController(), permanent: true);
  Get.put<ReaderSettingsController>(ReaderSettingsController(), permanent: true);

  final prefs = await SharedPreferences.getInstance();
  final hasSeenOnboarding = prefs.getBool(OnboardingView.prefsKey) ?? false;

  runApp(RememberQuranApp(
    initialRoute: hasSeenOnboarding ? Routes.HOME : Routes.ONBOARDING,
  ));
}

class RememberQuranApp extends StatefulWidget {
  final String initialRoute;

  const RememberQuranApp({super.key, required this.initialRoute});

  @override
  State<RememberQuranApp> createState() => _RememberQuranAppState();
}

class _RememberQuranAppState extends State<RememberQuranApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      Get.find<NotificationsController>().refreshReminder();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'RememberQuran',
      initialRoute: widget.initialRoute,
      getPages: AppPages.routes,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
    );
  }
}
