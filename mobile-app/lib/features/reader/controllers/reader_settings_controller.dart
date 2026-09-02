import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/models/translation.dart';
import '../../../shared/widgets/app_feedback.dart';

enum DisplayMode { verseByVerse, continuous, mushaf }

class ReaderSettingsController extends GetxController {
  late final SharedPreferences _prefs;

  final RxString font = 'UthmanicHafs'.obs;
  final RxDouble fontSize = 32.0.obs;
  final Rx<DisplayMode> displayMode = DisplayMode.verseByVerse.obs;
  final Rx<ThemeMode> themeMode = ThemeMode.system.obs;

  /// Whether to show translations at all ("Arabic only" when false).
  final RxBool showTranslation = true.obs;

  /// Up to [maxActiveTranslations] resource ids shown simultaneously.
  final RxList<int> activeTranslations = <int>[...defaultTranslationIds].obs;

  final RxBool isHifzMode = false.obs;
  final RxBool rxTajweedEnabled = false.obs;
  final RxSet<String> revealedAyahs = <String>{}.obs;

  /// Optional ayah-number range (1-based, inclusive) restricting hifz
  /// hiding to a portion of the surah instead of the whole thing. Session-
  /// only — not persisted, since ayah numbers are meaningless once the
  /// user moves to a different surah (cleared on chapter load).
  final Rxn<int> hifzRangeStart = Rxn<int>();
  final Rxn<int> hifzRangeEnd = Rxn<int>();
  final Rxn<int> currentSurahId = Rxn<int>();

  final _isLoaded = false.obs;
  bool get isLoaded => _isLoaded.value;

  @override
  void onInit() {
    super.onInit();
    _initPrefs();
  }

  Future<void> _initPrefs() async {
    _prefs = await SharedPreferences.getInstance();
    
    font.value = _prefs.getString('reader_font') ?? 'UthmanicHafs';
    fontSize.value = _prefs.getDouble('reader_font_size') ?? 32.0;
    
    final dm = _prefs.getString('reader_display_mode');
    if (dm == 'mushaf') {
      displayMode.value = DisplayMode.mushaf;
    } else if (dm == 'continuous') {
      displayMode.value = DisplayMode.continuous;
    } else {
      displayMode.value = DisplayMode.verseByVerse;
    }
    
    final storedIds = _prefs.getStringList('reader_translation_ids');
    if (storedIds != null) {
      activeTranslations.assignAll(storedIds.map(int.parse));
      showTranslation.value = _prefs.getBool('reader_show_translation') ?? activeTranslations.isNotEmpty;
    } else {
      // Migrate the old single-select pref (0 meant "Arabic only").
      final legacyId = _prefs.getInt('reader_translation_id');
      if (legacyId == 0) {
        activeTranslations.clear();
        showTranslation.value = false;
      } else if (legacyId != null) {
        activeTranslations.assignAll([legacyId]);
        showTranslation.value = true;
      }
      _persistTranslations();
    }

    isHifzMode.value = _prefs.getBool('reader_hifz_mode') ?? false;
    rxTajweedEnabled.value = _prefs.getBool('reader_tajweed_enabled') ?? false;
    
    final tm = _prefs.getString('app_theme_mode');
    if (tm == 'light') {
      themeMode.value = ThemeMode.light;
    } else if (tm == 'dark') {
      themeMode.value = ThemeMode.dark;
    } else {
      themeMode.value = ThemeMode.system;
    }

    // Apply theme mode on startup
    Get.changeThemeMode(themeMode.value);

    _isLoaded.value = true;
  }

  void setFont(String newFont) {
    font.value = newFont;
    _prefs.setString('reader_font', newFont);
  }

  void setFontSize(double size) {
    fontSize.value = size;
    _prefs.setDouble('reader_font_size', size);
  }

  void setDisplayMode(DisplayMode mode) {
    displayMode.value = mode;
    String modeStr = 'verseByVerse';
    if (mode == DisplayMode.continuous) modeStr = 'continuous';
    if (mode == DisplayMode.mushaf) modeStr = 'mushaf';
    _prefs.setString('reader_display_mode', modeStr);
  }

  void _persistTranslations() {
    _prefs.setStringList('reader_translation_ids', activeTranslations.map((e) => e.toString()).toList());
    _prefs.setBool('reader_show_translation', showTranslation.value);
  }

  void setShowTranslation(bool value) {
    showTranslation.value = value;
    _persistTranslations();
  }

  /// Toggles a translation on/off, mirroring the web reader's selection rules:
  /// switching on from "Arabic only" replaces the selection with just this
  /// translation; deselecting the last active one falls back to Arabic only;
  /// selecting beyond [maxActiveTranslations] is a no-op.
  void selectTranslation(int translationId) {
    final arabicOnly = !showTranslation.value || activeTranslations.isEmpty;

    if (arabicOnly) {
      activeTranslations.assignAll([translationId]);
      showTranslation.value = true;
      _persistTranslations();
      return;
    }

    if (activeTranslations.contains(translationId)) {
      activeTranslations.remove(translationId);
      if (activeTranslations.isEmpty) {
        showTranslation.value = false;
      }
      _persistTranslations();
      return;
    }

    if (activeTranslations.length >= maxActiveTranslations) {
      AppFeedback.showInfo(
        'Maximum of $maxActiveTranslations translations active. Deselect one to add another.',
      );
      return;
    }
    activeTranslations.add(translationId);
    _persistTranslations();
  }

  void toggleHifzMode() {
    isHifzMode.value = !isHifzMode.value;
    _prefs.setBool('reader_hifz_mode', isHifzMode.value);
    if (!isHifzMode.value) {
      revealedAyahs.clear();
      clearHifzRange();
    }
  }

  Future<void> loadHifzRange(int surahId) async {
    currentSurahId.value = surahId;
    final start = _prefs.getInt('hifz_range_start_$surahId');
    final end = _prefs.getInt('hifz_range_end_$surahId');
    hifzRangeStart.value = start;
    hifzRangeEnd.value = end;
  }

  void saveHifzRange(int surahId, int? start, int? end) {
    if (start != null) {
      _prefs.setInt('hifz_range_start_$surahId', start);
    } else {
      _prefs.remove('hifz_range_start_$surahId');
    }

    if (end != null) {
      _prefs.setInt('hifz_range_end_$surahId', end);
    } else {
      _prefs.remove('hifz_range_end_$surahId');
    }
  }

  /// Restricts hifz hiding to ayahs [start]..[end] (inclusive) instead of
  /// the whole surah. Pass null for both to go back to hiding everything.
  void setHifzRange(int? start, int? end) {
    hifzRangeStart.value = start;
    hifzRangeEnd.value = end;
    final sid = currentSurahId.value;
    if (sid != null) {
      saveHifzRange(sid, start, end);
    }
  }

  void clearHifzRange() {
    hifzRangeStart.value = null;
    hifzRangeEnd.value = null;
    final sid = currentSurahId.value;
    if (sid != null) {
      saveHifzRange(sid, null, null);
    }
  }

  void toggleTajweed() {
    rxTajweedEnabled.value = !rxTajweedEnabled.value;
    _prefs.setBool('reader_tajweed_enabled', rxTajweedEnabled.value);
  }

  void revealAyah(String verseKey) {
    revealedAyahs.add(verseKey);
  }

  void clearRevealedAyahs() {
    revealedAyahs.clear();
  }

  void setThemeMode(ThemeMode mode) {
    themeMode.value = mode;
    String modeStr = 'system';
    if (mode == ThemeMode.light) modeStr = 'light';
    if (mode == ThemeMode.dark) modeStr = 'dark';
    
    _prefs.setString('app_theme_mode', modeStr);
    Get.changeThemeMode(mode);
  }
}
