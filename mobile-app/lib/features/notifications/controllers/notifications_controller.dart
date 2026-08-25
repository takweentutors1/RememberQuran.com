import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/notification_service.dart';
import '../../account/controllers/auth_controller.dart';
import '../../../data/repositories/goals_repository.dart';

class NotificationsController extends GetxController {
  final NotificationService _service = NotificationService();
  final GoalsRepository _goalsRepository = GoalsRepository();

  late final SharedPreferences _prefs;

  final RxBool enabled = false.obs;
  final RxInt reminderHour = 20.obs;
  final RxInt reminderMinute = 0.obs;
  final RxBool permissionDenied = false.obs;

  @override
  void onInit() {
    super.onInit();
    _initPrefs();
  }

  Future<void> _initPrefs() async {
    _prefs = await SharedPreferences.getInstance();
    enabled.value = _prefs.getBool('notif_daily_reminder_enabled') ?? false;
    reminderHour.value = _prefs.getInt('notif_daily_reminder_hour') ?? 20;
    reminderMinute.value = _prefs.getInt('notif_daily_reminder_minute') ?? 0;

    if (enabled.value) {
      await _service.init();
      await _refreshReminder();
    }
  }

  /// Turns the daily reminder on, requesting permission first. Leaves
  /// [enabled] false and sets [permissionDenied] if the user declines.
  Future<void> setEnabled(bool value) async {
    if (!value) {
      enabled.value = false;
      _prefs.setBool('notif_daily_reminder_enabled', false);
      await _service.cancelDailyReminder();
      return;
    }

    final granted = await _service.requestPermission();
    permissionDenied.value = !granted;
    if (!granted) return;

    enabled.value = true;
    _prefs.setBool('notif_daily_reminder_enabled', true);
    await _refreshReminder();
  }

  Future<void> setReminderTime(int hour, int minute) async {
    reminderHour.value = hour;
    reminderMinute.value = minute;
    _prefs.setInt('notif_daily_reminder_hour', hour);
    _prefs.setInt('notif_daily_reminder_minute', minute);
    if (enabled.value) await _refreshReminder();
  }

  /// Re-schedules the reminder with fresh streak-aware copy — call whenever
  /// the app comes back to the foreground so tonight's wording reflects
  /// today's actual progress.
  Future<void> refreshReminder() async {
    if (!enabled.value) return;
    await _refreshReminder();
  }

  Future<void> _refreshReminder() async {
    final (title, body) = await _reminderCopy();
    await _service.scheduleDailyReminder(
      hour: reminderHour.value,
      minute: reminderMinute.value,
      title: title,
      body: body,
    );
  }

  Future<(String, String)> _reminderCopy() async {
    const defaultCopy = ('Time to read', "Spend a few minutes with the Qur'an today.");
    if (!Get.isRegistered<AuthController>()) return defaultCopy;

    final userId = Get.find<AuthController>().firebaseUser.value?.uid;
    if (userId == null) return defaultCopy;

    try {
      final snapshot = await _goalsRepository.evaluateGoalAndStreak(userId);
      if (snapshot.goal == null || snapshot.metToday) return defaultCopy;
      if (snapshot.streak.currentStreak > 0) {
        return (
          "Don't lose your streak!",
          "You're on a ${snapshot.streak.currentStreak}-day streak — read today to keep it going.",
        );
      }
      return defaultCopy;
    } catch (_) {
      return defaultCopy;
    }
  }
}
