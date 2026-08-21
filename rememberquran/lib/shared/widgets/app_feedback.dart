import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/theme/app_colors.dart';
import 'app_mascot.dart';

/// Centralised success/error toast styling so every part of the app reports
/// outcomes the same way — a small reacting mascot instead of a bare
/// `Get.snackbar('Error', ...)` string.
///
/// Rendered as a centered overlay rather than GetX's built-in snackbar
/// (which only supports top/bottom positioning) so it lands in the middle
/// of the screen where it can't be missed, and stays up long enough to
/// actually read before it clears itself.
class AppFeedback {
  AppFeedback._();

  static const Duration _displayDuration = Duration(seconds: 6);

  static OverlayEntry? _entry;

  static void showSuccess(String message, {String title = 'Done'}) {
    final isDark = Get.isDarkMode;
    _show(
      title: title,
      message: message,
      mood: MascotMood.success,
      background: isDark ? AppColors.darkBrandGoldSoft : AppColors.lightBrandGoldSoft,
      foreground: isDark ? AppColors.darkForeground : AppColors.lightForeground,
    );
  }

  static void showError(
    String message, {
    String title = 'Something went wrong',
    VoidCallback? onRetry,
    String retryLabel = 'Retry',
  }) {
    final isDark = Get.isDarkMode;
    _show(
      title: title,
      message: message,
      mood: MascotMood.error,
      background: isDark ? AppColors.darkDestructive.withOpacity(0.16) : AppColors.lightDestructive.withOpacity(0.10),
      foreground: isDark ? AppColors.darkDestructive : AppColors.lightDestructive,
      onRetry: onRetry,
      retryLabel: retryLabel,
    );
  }

  static void _show({
    required String title,
    required String message,
    required MascotMood mood,
    required Color background,
    required Color foreground,
    VoidCallback? onRetry,
    String retryLabel = 'Retry',
  }) {
    // Matches how GetX's own SnackbarController locates the root overlay
    // (Get.key.currentState?.overlay) rather than Overlay.of(context), which
    // needs a context that's already a descendant of an Overlay.
    final overlay = Get.key.currentState?.overlay;
    if (overlay == null) return;

    // A new toast replaces whatever's already up, immediately — no point
    // animating out a message the user is already looking away from.
    _entry?.remove();
    _entry = null;

    late final OverlayEntry entry;
    entry = OverlayEntry(
      builder: (context) => _CenteredToast(
        title: title,
        message: message,
        mood: mood,
        background: background,
        foreground: foreground,
        displayDuration: _displayDuration,
        retryLabel: retryLabel,
        onRetry: onRetry == null
            ? null
            : () {
                _dismiss(entry);
                onRetry();
              },
        onDismissed: () => _dismiss(entry),
      ),
    );
    _entry = entry;
    overlay.insert(entry);
  }

  static void _dismiss(OverlayEntry entry) {
    if (identical(_entry, entry)) {
      _entry = null;
    }
    if (entry.mounted) entry.remove();
  }
}

class _CenteredToast extends StatefulWidget {
  final String title;
  final String message;
  final MascotMood mood;
  final Color background;
  final Color foreground;
  final Duration displayDuration;
  final VoidCallback? onRetry;
  final String retryLabel;
  final VoidCallback onDismissed;

  const _CenteredToast({
    required this.title,
    required this.message,
    required this.mood,
    required this.background,
    required this.foreground,
    required this.displayDuration,
    required this.onDismissed,
    this.onRetry,
    this.retryLabel = 'Retry',
  });

  @override
  State<_CenteredToast> createState() => _CenteredToastState();
}

class _CenteredToastState extends State<_CenteredToast>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  Timer? _autoDismissTimer;
  bool _dismissing = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 220),
      reverseDuration: const Duration(milliseconds: 160),
    );
    _controller.forward();
    _autoDismissTimer = Timer(widget.displayDuration, _dismiss);
  }

  Future<void> _dismiss() async {
    if (_dismissing) return;
    _dismissing = true;
    _autoDismissTimer?.cancel();
    if (mounted) {
      await _controller.reverse();
    }
    widget.onDismissed();
  }

  @override
  void dispose() {
    _autoDismissTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        ignoring: true,
        child: SafeArea(
          child: Align(
            alignment: Alignment.center,
            child: IgnorePointer(
              ignoring: false,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _dismiss,
                child: FadeTransition(
                  opacity: CurvedAnimation(parent: _controller, curve: Curves.easeOut),
                  child: ScaleTransition(
                    scale: Tween(begin: 0.9, end: 1.0).animate(
                      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
                    ),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 340),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 32),
                        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 20),
                        decoration: BoxDecoration(
                          color: widget.background,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.18),
                              blurRadius: 28,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: 44,
                              height: 44,
                              child: AppMascot(mood: widget.mood, size: 44),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              widget.title,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: widget.foreground,
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              widget.message,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: widget.foreground.withOpacity(0.9),
                                fontSize: 13,
                                height: 1.4,
                              ),
                            ),
                            if (widget.onRetry != null) ...[
                              const SizedBox(height: 12),
                              TextButton(
                                onPressed: widget.onRetry,
                                child: Text(widget.retryLabel),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
