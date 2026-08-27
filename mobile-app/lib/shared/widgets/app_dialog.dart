import 'package:flutter/material.dart';
import '../../core/theme/app_motion.dart';

/// Modern, consistently-styled confirmation dialog — replaces the several
/// separate hand-rolled `showDialog(... AlertDialog(...))` call sites that
/// had drifted into inconsistent copy ("Are you sure..." repeated with
/// slightly different wording each time), a hardcoded `Colors.red` instead
/// of the theme's actual error color, and no shared entrance animation.
/// Shape/typography come from ThemeData.dialogTheme automatically (AlertDialog
/// reads it by default) — this only owns the animation and the confirm/
/// cancel button contract.
class AppDialog {
  AppDialog._();

  /// Shows a calm fade + scale confirmation dialog — no bounce/overshoot,
  /// matching the rest of the app's motion. Returns true if the user
  /// confirmed, false/null if they cancelled or dismissed it.
  static Future<bool?> confirm(
    BuildContext context, {
    required String title,
    required String message,
    String confirmLabel = 'Confirm',
    String cancelLabel = 'Cancel',
    bool isDestructive = false,
  }) {
    return showGeneralDialog<bool>(
      context: context,
      barrierDismissible: true,
      barrierLabel: title,
      barrierColor: Colors.black54,
      transitionDuration: AppMotion.durBase,
      pageBuilder: (context, animation, secondaryAnimation) {
        final theme = Theme.of(context);
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(cancelLabel),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: isDestructive
                  ? FilledButton.styleFrom(backgroundColor: theme.colorScheme.error)
                  : null,
              child: Text(confirmLabel),
            ),
          ],
        );
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final curved = CurvedAnimation(parent: animation, curve: AppMotion.easeOut);
        return FadeTransition(
          opacity: curved,
          child: ScaleTransition(
            scale: Tween(begin: 0.96, end: 1.0).animate(curved),
            child: child,
          ),
        );
      },
    );
  }
}
