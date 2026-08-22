import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'app_mascot.dart';

/// Full-bleed "we're getting your content" state, shown instead of a bare
/// spinner so waiting feels alive rather than dead air.
class AppLoadingView extends StatelessWidget {
  final String message;

  const AppLoadingView({super.key, this.message = 'Getting things ready…'});

  @override
  Widget build(BuildContext context) {
    final nur = Theme.of(context).extension<NurColorsExtension>();
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const AppMascot(mood: MascotMood.loading, size: 140),
            const SizedBox(height: 20),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: nur?.foregroundSubtle,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Full-bleed error state with a retry action. Use this instead of letting a
/// failed fetch render a blank screen — the mascot + message + retry button
/// give the user somewhere to go.
class AppErrorView extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onRetry;
  final String retryLabel;

  const AppErrorView({
    super.key,
    this.title = 'Something went wrong',
    this.message = "We couldn't load this right now. Check your connection and try again.",
    this.onRetry,
    this.retryLabel = 'Try again',
  });

  @override
  Widget build(BuildContext context) {
    final nur = Theme.of(context).extension<NurColorsExtension>();
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const AppMascot(mood: MascotMood.error, size: 140),
            const SizedBox(height: 20),
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(color: nur?.foregroundSubtle),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: Text(retryLabel),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Full-bleed "nothing here" state — distinct from [AppErrorView] because
/// nothing actually failed, there's just no content to show yet.
class AppEmptyView extends StatelessWidget {
  final String title;
  final String message;
  final Widget? action;

  const AppEmptyView({
    super.key,
    this.title = 'Nothing here yet',
    this.message = '',
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    final nur = Theme.of(context).extension<NurColorsExtension>();
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const AppMascot(mood: MascotMood.empty, size: 140),
            const SizedBox(height: 20),
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            if (message.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(color: nur?.foregroundSubtle),
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
