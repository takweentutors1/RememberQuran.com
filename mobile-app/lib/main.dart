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
import 'features/account/controllers/notes_controller.dart';
import 'features/notifications/controllers/notifications_controller.dart';
import 'features/shortcuts/controllers/shortcuts_controller.dart';
import 'features/reader/controllers/reader_settings_controller.dart';

void main() {
  runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      runApp(const RememberQuranApp(initialRoute: Routes.SPLASH));
    },
    (error, stack) {
      // If Firebase isn't initialized yet, this will fail safely.
      if (Firebase.apps.isNotEmpty) {
        FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      } else {
        debugPrint('Fatal error before Firebase initialized: $error');
      }
    },
  );
}

class RememberQuranApp extends StatefulWidget {
  final String initialRoute;

  const RememberQuranApp({super.key, required this.initialRoute});

  @override
  State<RememberQuranApp> createState() => _RememberQuranAppState();
}

class _RememberQuranAppState extends State<RememberQuranApp>
    with WidgetsBindingObserver {
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
      // Guard against the controller not being registered yet — this callback
      // can fire before the route that puts NotificationsController has loaded.
      if (Get.isRegistered<NotificationsController>()) {
        Get.find<NotificationsController>().refreshReminder();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'RememberQuran',
      initialRoute: widget.initialRoute,
      getPages: AppPages.routes,
      unknownRoute: AppPages.unknownRoute,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      // Without this, a user's system font-size setting can scale text
      // well past what the fixed-height rows/grids throughout this app
      // (mini player, hifz/bookmark cards, chip rows, etc.) were designed
      // to hold, causing overflow instead of just larger text.
      builder: (context, child) {
        final mediaQuery = MediaQuery.of(context);
        return MediaQuery(
          data: mediaQuery.copyWith(
            textScaler: mediaQuery.textScaler.clamp(
              minScaleFactor: 0.85,
              maxScaleFactor: 1.3,
            ),
          ),
          child: child!,
        );
      },
    );
  }
}
