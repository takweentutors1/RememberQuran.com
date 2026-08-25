abstract class Routes {
  static const SPLASH = '/splash';
  static const ONBOARDING = '/onboarding';
  static const HOME = '/';
  static const SURAH = '/surah/:surahId';
  static const SURAH_AYAH = '/surah/:surahId/:ayahId';
  static const RADIO = '/radio';
  static const SEARCH = '/search';
  static const LOGIN = '/login';
  static const REGISTER = '/register';
  static const RESET_PASSWORD = '/reset-password';
  static const SHARE_AYAH = '/share-ayah';

  // Account Routes
  static const ACCOUNT_HOME = '/account';
  static const ACCOUNT_SETTINGS = '/account/settings';
  static const ACCOUNT_NOTES = '/account/notes';
  static const ACCOUNT_BOOKMARKS = '/account/bookmarks';
  static const ACCOUNT_COLLECTION_DETAILS = '/account/bookmarks/collection';
  static const ACCOUNT_GOALS = '/account/goals';
  static const ACCOUNT_PROGRESS = '/account/progress';
  static const ACCOUNT_HIFZ = '/account/hifz';
}
