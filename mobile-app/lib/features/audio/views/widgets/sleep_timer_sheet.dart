import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../controllers/audio_controller.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/responsive_layout.dart';

/// Bottom sheet allowing users to set or cancel an audio sleep timer.
/// Offers [Off, 15 min, 30 min, 45 min, 60 min, End of Surah] options,
/// with live countdown display when a timer is currently active.
class SleepTimerSheet extends StatelessWidget {
  const SleepTimerSheet({super.key});

  static void show(BuildContext context) {
    showResponsiveSheet(
      context: context,
      builder: (_) => const SleepTimerSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
    final controller = Get.find<AudioController>();

    return Container(
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Obx(() {
          final mode = controller.rxSleepTimerMode.value;
          final remainingText = controller.rxSleepTimerRemaining.value;
          final endsAt = controller.rxSleepTimerEnd.value;
          final isDurationActive =
              mode == SleepTimerMode.duration && endsAt != null;

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.outline.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isDurationActive || mode == SleepTimerMode.endOfSurah
                          ? Icons.bedtime_rounded
                          : Icons.bedtime_outlined,
                      size: 22,
                      color: brandGold,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Sleep Timer',
                      style: TextStyle(
                        fontSize: context.responsiveBaseTextSize * 1.15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              if (remainingText != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: brandGold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: brandGold.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      mode == SleepTimerMode.endOfSurah
                          ? 'Stopping at end of Surah'
                          : '$remainingText remaining',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: brandGold,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              _buildOption(
                context,
                label: 'Off',
                icon: Icons.timer_off_outlined,
                selected: mode == SleepTimerMode.off,
                brandGold: brandGold,
                onTap: () => controller.setSleepTimer(null),
              ),
              _buildOption(
                context,
                label: '15 minutes',
                icon: Icons.bedtime_rounded,
                selected: isDurationActive &&
                    endsAt.difference(DateTime.now()).inMinutes >= 10 &&
                    endsAt.difference(DateTime.now()).inMinutes <= 15,
                brandGold: brandGold,
                onTap: () => controller.setSleepTimer(const Duration(minutes: 15)),
              ),
              _buildOption(
                context,
                label: '30 minutes',
                icon: Icons.bedtime_rounded,
                selected: isDurationActive &&
                    endsAt.difference(DateTime.now()).inMinutes > 15 &&
                    endsAt.difference(DateTime.now()).inMinutes <= 30,
                brandGold: brandGold,
                onTap: () => controller.setSleepTimer(const Duration(minutes: 30)),
              ),
              _buildOption(
                context,
                label: '45 minutes',
                icon: Icons.bedtime_rounded,
                selected: isDurationActive &&
                    endsAt.difference(DateTime.now()).inMinutes > 30 &&
                    endsAt.difference(DateTime.now()).inMinutes <= 45,
                brandGold: brandGold,
                onTap: () => controller.setSleepTimer(const Duration(minutes: 45)),
              ),
              _buildOption(
                context,
                label: '60 minutes',
                icon: Icons.bedtime_rounded,
                selected: isDurationActive &&
                    endsAt.difference(DateTime.now()).inMinutes > 45 &&
                    endsAt.difference(DateTime.now()).inMinutes <= 60,
                brandGold: brandGold,
                onTap: () => controller.setSleepTimer(const Duration(minutes: 60)),
              ),
              _buildOption(
                context,
                label: 'End of Surah',
                icon: Icons.hourglass_bottom_rounded,
                selected: mode == SleepTimerMode.endOfSurah,
                brandGold: brandGold,
                onTap: () => controller.setSleepTimerEndOfSurah(),
              ),
              const SizedBox(height: 12),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildOption(
    BuildContext context, {
    required String label,
    required IconData icon,
    required bool selected,
    required Color brandGold,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);

    return ListTile(
      leading: Icon(
        icon,
        color: selected ? brandGold : theme.iconTheme.color,
      ),
      title: Text(
        label,
        style: theme.textTheme.bodyLarge?.copyWith(
          fontWeight: selected ? FontWeight.bold : FontWeight.normal,
          color: selected ? brandGold : null,
        ),
      ),
      trailing: selected
          ? Icon(Icons.check_circle_rounded, color: brandGold, size: 20)
          : null,
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
    );
  }
}
