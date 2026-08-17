import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rememberquran/app/routes/app_routes.dart';
import 'package:rememberquran/shared/widgets/app_state_views.dart';
import 'package:rememberquran/features/home/views/home_view.dart';
import 'package:rememberquran/features/home/controllers/home_controller.dart';
import 'package:rememberquran/shared/widgets/app_scaffold.dart';
import 'package:rememberquran/features/reader/views/surah_reader_view.dart';
import 'package:rememberquran/features/reader/controllers/reader_controller.dart';
import 'package:rememberquran/data/repositories/quran_repository.dart';
import 'package:rememberquran/features/audio/views/radio_view.dart';
import 'package:rememberquran/features/search/views/search_view.dart';
import 'package:rememberquran/features/search/controllers/search_controller.dart' as my_search;
import 'package:rememberquran/features/account/views/login_view.dart';
import 'package:rememberquran/features/account/views/register_view.dart';
import 'package:rememberquran/features/account/views/reset_view.dart';
import 'package:rememberquran/features/account/controllers/auth_controller.dart';
import 'package:rememberquran/features/account/views/account_home_view.dart';
import 'package:rememberquran/features/account/views/bookmarks_view.dart';
import 'package:rememberquran/features/account/controllers/bookmarks_controller.dart';
import 'package:rememberquran/features/account/views/collection_details_view.dart';
import 'package:rememberquran/features/account/views/goals_view.dart';
import 'package:rememberquran/features/account/controllers/goals_controller.dart';
import 'package:rememberquran/features/account/views/hifz_view.dart';
import 'package:rememberquran/features/account/views/notes_view.dart';
import 'package:rememberquran/features/account/controllers/notes_controller.dart';
import 'package:rememberquran/features/account/views/progress_view.dart';
import 'package:rememberquran/features/account/controllers/progress_controller.dart';
import 'package:rememberquran/features/account/views/settings_view.dart';
import 'package:rememberquran/features/account/middlewares/auth_middleware.dart';
import 'package:rememberquran/features/account/controllers/hifz_controller.dart';
import 'package:rememberquran/features/media/views/ayah_card_designer_view.dart';
import 'package:rememberquran/features/media/controllers/ayah_card_designer_controller.dart';
import 'package:rememberquran/features/onboarding/views/onboarding_view.dart';

/// Puts (or reuses) the [ReaderController] for the SURAH / SURAH_AYAH routes.
///
/// Both routes render the same view, so navigating between them for the same
/// chapter (e.g. jumping to a specific ayah while already reading it) reuses
/// the existing controller instead of discarding scroll state and re-fetching
/// the chapter. onInit() only runs once per instance, so the reused-instance
/// path re-triggers the ayah scroll explicitly via [ReaderController.jumpToRouteAyah].
void _bindReaderController() {
  final chapterIdStr = Get.parameters['surahId'];
  final chapterId = chapterIdStr != null ? int.tryParse(chapterIdStr) : null;

  if (Get.isRegistered<ReaderController>()) {
    final existing = Get.find<ReaderController>();
    if (chapterId != null && existing.chapter.value?.id == chapterId) {
      existing.jumpToRouteAyah();
      return;
    }
    Get.delete<ReaderController>(force: true);
  }

  Get.lazyPut(() => ReaderController(repository: Get.find<QuranRepository>()));
}

class AppPages {
  static const INITIAL = Routes.HOME;

  static final routes = [
    GetPage(
      name: Routes.ONBOARDING,
      page: () => const OnboardingView(),
    ),
    GetPage(
      name: Routes.HOME,
      page: () => const AppScaffold(),
      binding: BindingsBuilder(() {
        Get.lazyPut(() => HomeController(repository: Get.find<QuranRepository>()));
      }),
    ),
    GetPage(
      name: Routes.SURAH,
      page: () => const SurahReaderView(),
      binding: BindingsBuilder(_bindReaderController),
    ),
    GetPage(
      name: Routes.SURAH_AYAH,
      page: () => const SurahReaderView(),
      binding: BindingsBuilder(_bindReaderController),
    ),
    GetPage(
      name: Routes.RADIO,
      page: () => const RadioView(),
    ),
    GetPage(
      name: Routes.SEARCH,
      page: () => const SearchView(),
      binding: BindingsBuilder(() {
        Get.lazyPut(() => my_search.SearchController());
      }),
    ),
    GetPage(
      name: Routes.LOGIN,
      page: () => const LoginView(),
      middlewares: [GuestMiddleware()],
    ),
    GetPage(
      name: Routes.REGISTER,
      page: () => const RegisterView(),
      middlewares: [GuestMiddleware()],
    ),
    GetPage(
      name: Routes.RESET_PASSWORD,
      page: () => const ResetView(),
      middlewares: [GuestMiddleware()],
    ),
    GetPage(
      name: Routes.SHARE_AYAH,
      page: () => const AyahCardDesignerView(),
      binding: BindingsBuilder(() {
        Get.lazyPut(() => AyahCardDesignerController());
      }),
    ),
    GetPage(
      name: Routes.ACCOUNT_HOME,
      page: () => const AccountHomeView(),
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: Routes.ACCOUNT_SETTINGS,
      page: () => const SettingsView(),
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: Routes.ACCOUNT_NOTES,
      page: () => const NotesView(),
      middlewares: [AuthMiddleware()],
      binding: BindingsBuilder(() {
        Get.lazyPut(() => NotesController());
      }),
    ),
    GetPage(
      name: Routes.ACCOUNT_BOOKMARKS,
      page: () => const BookmarksView(),
      middlewares: [AuthMiddleware()],
      binding: BindingsBuilder(() {
        Get.lazyPut(() => BookmarksController());
      }),
    ),
    GetPage(
      name: Routes.ACCOUNT_COLLECTION_DETAILS,
      page: () => const CollectionDetailsView(),
      middlewares: [AuthMiddleware()],
      binding: BindingsBuilder(() {
        // BookmarksController is shared with ACCOUNT_BOOKMARKS; lazyPut is a
        // no-op if it's already registered (e.g. navigated from the bookmarks
        // list), and puts it fresh on a direct/deep-link entry.
        Get.lazyPut(() => BookmarksController());
      }),
    ),
    GetPage(
      name: Routes.ACCOUNT_GOALS,
      page: () => const GoalsView(),
      middlewares: [AuthMiddleware()],
      binding: BindingsBuilder(() {
        Get.lazyPut(() => GoalsController());
      }),
    ),
    GetPage(
      name: Routes.ACCOUNT_PROGRESS,
      page: () => const ProgressView(),
      middlewares: [AuthMiddleware()],
      binding: BindingsBuilder(() {
        Get.lazyPut(() => ProgressController());
      }),
    ),
    GetPage(
      name: Routes.ACCOUNT_HIFZ,
      page: () => const HifzView(),
      middlewares: [AuthMiddleware()],
      binding: BindingsBuilder(() {
        Get.lazyPut(() => HifzController());
      }),
    ),
  ];

  /// Fallback for unmatched/stale deep links (e.g. a renamed route reached
  /// via an old push notification or share link).
  static final unknownRoute = GetPage(
    name: '/not-found',
    page: () => const _NotFoundView(),
  );
}

class _NotFoundView extends StatelessWidget {
  const _NotFoundView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: AppErrorView(
          title: "Page not found",
          message: "That link doesn't lead anywhere in RememberQuran.",
          onRetry: () => Get.offAllNamed(Routes.HOME),
          retryLabel: 'Go home',
        ),
      ),
    );
  }
}
