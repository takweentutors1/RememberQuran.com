import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:quick_actions/quick_actions.dart';
import '../../../app/routes/app_routes.dart';
import '../../account/controllers/auth_controller.dart';

/// Android App Shortcuts / iOS Home Screen Quick Actions.
///
/// "Search" and "Radio" are static — always present. "Continue Reading" is
/// dynamic: it only appears once the user has a reading position, shows the
/// actual surah:ayah, and is kept in sync as that position changes.
class ShortcutsController extends GetxController {
  static const _typeSearch = 'action_search';
  static const _typeRadio = 'action_radio';
  static const _typeContinueReading = 'action_continue_reading';

  final QuickActions _quickActions = const QuickActions();

  @override
  void onInit() {
    super.onInit();
    _quickActions.initialize(_handleShortcut);
    _setShortcuts();

    if (Get.isRegistered<AuthController>()) {
      ever(Get.find<AuthController>().lastPosition, (_) => _setShortcuts());
    }
  }

  /// Android drawables were authored for these shortcuts; iOS has no
  /// matching Assets.xcassets template images yet, so icons are Android-only
  /// for now — quick_actions ignores an icon name it can't resolve, but
  /// being explicit avoids passing a meaningless value on iOS.
  static String? _iconFor(String androidIconName) =>
      defaultTargetPlatform == TargetPlatform.android ? androidIconName : null;

  void _setShortcuts() {
    final items = <ShortcutItem>[];

    if (Get.isRegistered<AuthController>()) {
      final pos = Get.find<AuthController>().lastPosition.value;
      if (pos != null) {
        items.add(ShortcutItem(
          type: _typeContinueReading,
          localizedTitle: 'Continue Reading',
          localizedSubtitle: 'Surah ${pos.surahId}, Ayah ${pos.ayahId}',
          icon: _iconFor('ic_shortcut_continue'),
        ));
      }
    }

    items.addAll([
      ShortcutItem(
        type: _typeRadio,
        localizedTitle: 'Quran Radio',
        icon: _iconFor('ic_shortcut_radio'),
      ),
      ShortcutItem(
        type: _typeSearch,
        localizedTitle: 'Search',
        icon: _iconFor('ic_shortcut_search'),
      ),
    ]);

    _quickActions.setShortcutItems(items);
  }

  Future<void> _handleShortcut(String type) async {
    // Defers navigation until the navigator is guaranteed mounted — matters
    // for a cold start launched directly from a shortcut tap.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      switch (type) {
        case _typeSearch:
          Get.toNamed(Routes.SEARCH);
        case _typeRadio:
          Get.toNamed(Routes.RADIO);
        case _typeContinueReading:
          final pos = Get.isRegistered<AuthController>()
              ? Get.find<AuthController>().lastPosition.value
              : null;
          if (pos != null) {
            Get.toNamed('/surah/${pos.surahId}?ayahId=${pos.ayahId}');
          }
      }
    });
  }
}
