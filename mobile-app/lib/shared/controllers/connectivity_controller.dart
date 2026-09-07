import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get/get.dart';
import '../widgets/app_feedback.dart';

/// App-wide "you're offline" / "you're back online" toasts. Previously the
/// only connectivity awareness anywhere in the app was AudioController's own
/// internal `rxIsOffline` flag (driving Radio's offline fallback, no user
/// -facing message) — nothing ever told the user their connection dropped
/// or came back, on any screen.
class ConnectivityController extends GetxController {
  StreamSubscription<List<ConnectivityResult>>? _sub;
  bool? _wasOffline;

  @override
  void onInit() {
    super.onInit();
    _init();
  }

  Future<void> _init() async {
    try {
      final initial = await Connectivity().checkConnectivity();
      // Seeds the starting state silently — only transitions after this
      // should ever produce a toast, not whatever state the app happened
      // to launch in.
      _wasOffline = initial.every((r) => r == ConnectivityResult.none);
    } catch (_) {
      _wasOffline = false;
    }

    _sub = Connectivity().onConnectivityChanged.listen((results) {
      final isOffline = results.every((r) => r == ConnectivityResult.none);
      if (isOffline == _wasOffline) return; // no actual transition
      _wasOffline = isOffline;

      if (isOffline) {
        AppFeedback.showError(
          "You're offline. Some features may not work until you reconnect.",
          title: 'No Connection',
        );
      } else {
        AppFeedback.showSuccess("You're back online.", title: 'Reconnected');
      }
    });
  }

  @override
  void onClose() {
    _sub?.cancel();
    super.onClose();
  }
}
