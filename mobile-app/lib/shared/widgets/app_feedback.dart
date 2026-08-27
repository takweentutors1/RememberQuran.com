import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/app_motion.dart';
import '../../core/theme/app_radius.dart';
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
      background: isDark
          ? AppColors.darkBrandGoldSoft.withOpacity(0.2)
          : AppColors.lightBrandGoldSoft.withOpacity(0.4),
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
      background: isDark
          ? AppColors.darkDestructive.withOpacity(0.15)
          : AppColors.lightDestructive.withOpacity(0.15),
      foreground: isDark
          ? AppColors.darkDestructive
          : AppColors.lightDestructive,
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
      duration: AppMotion.durSlow,
      reverseDuration: AppMotion.durBase,
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
                child: _buildAnimatedCard(context),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Calm, no bounce/overshoot — a fade plus a small translation and scale,
  /// all on the same easeOut curve. (This used to end on Curves.easeOutBack,
  /// which overshoots past 1.0 before settling back — motion the rest of
  /// the app deliberately avoids.)
  Widget _buildAnimatedCard(BuildContext context) {
    final curved = CurvedAnimation(parent: _controller, curve: AppMotion.easeOut);
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween(begin: const Offset(0, -0.04), end: Offset.zero).animate(curved),
        child: ScaleTransition(
          scale: Tween(begin: 0.96, end: 1.0).animate(curved),
          child: _buildCard(context),
        ),
      ),
    );
  }

  Widget _buildCard(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 340),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: AppRadius.xl2Radius,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 40,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: AppRadius.xl2Radius,
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 16.0, sigmaY: 16.0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                decoration: BoxDecoration(
                  color: widget.background,
                  borderRadius: AppRadius.xl2Radius,
                  border: Border.all(
                    color: widget.foreground.withOpacity(0.15),
                    width: 1,
                  ),
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
                      style: AppTypography.sans(
                        fontSize: 16,
                        weight: FontWeight.w700,
                        color: widget.foreground,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      widget.message,
                      textAlign: TextAlign.center,
                      style: AppTypography.sans(
                        fontSize: 13,
                        weight: FontWeight.w400,
                        color: widget.foreground.withOpacity(0.9),
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
    );
  }
}
