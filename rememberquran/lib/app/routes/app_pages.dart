import 'package:get/get.dart';
import 'package:rememberquran/app/routes/app_routes.dart';
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
import 'package:rememberquran/features/account/controllers/auth_controller.dart';
import 'package:rememberquran/features/account/views/account_home_view.dart';
import 'package:rememberquran/features/account/views/bookmarks_view.dart';
import 'package:rememberquran/features/account/controllers/bookmarks_controller.dart';
import 'package:rememberquran/features/account/views/collection_details_view.dart';
import 'package:rememberquran/features/account/views/goals_view.dart';
import 'package:rememberquran/features/account/views/hifz_view.dart';
import 'package:rememberquran/features/account/views/notes_view.dart';
import 'package:rememberquran/features/account/views/progress_view.dart';
import 'package:rememberquran/features/account/views/settings_view.dart';
import 'package:rememberquran/features/account/middlewares/auth_middleware.dart';
import 'package:rememberquran/features/account/controllers/hifz_controller.dart';
import 'package:rememberquran/features/media/views/ayah_card_designer_view.dart';
import 'package:rememberquran/features/media/controllers/ayah_card_designer_controller.dart';
import 'package:rememberquran/features/onboarding/views/onboarding_view.dart';

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
        Get.put(HomeController(repository: Get.find<QuranRepository>()));
      }),
    ),
    GetPage(
      name: Routes.SURAH,
      page: () => const SurahReaderView(),
      binding: BindingsBuilder(() {
        Get.put(ReaderController(repository: Get.find<QuranRepository>()));
      }),
    ),
    GetPage(
      name: Routes.SURAH_AYAH,
      page: () => const SurahReaderView(),
      binding: BindingsBuilder(() {
        Get.put(ReaderController(repository: Get.find<QuranRepository>()));
      }),
    ),
    GetPage(
      name: Routes.RADIO,
      page: () => const RadioView(),
    ),
    GetPage(
      name: Routes.SEARCH,
      page: () => const SearchView(),
      binding: BindingsBuilder(() {
        Get.put(my_search.SearchController());
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
        Get.put(AyahCardDesignerController());
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
    ),
    GetPage(
      name: Routes.ACCOUNT_GOALS,
      page: () => const GoalsView(),
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: Routes.ACCOUNT_PROGRESS,
      page: () => const ProgressView(),
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: Routes.ACCOUNT_HIFZ,
      page: () => const HifzView(),
      middlewares: [AuthMiddleware()],
      binding: BindingsBuilder(() {
        Get.put(HifzController());
      }),
    ),
  ];
}
