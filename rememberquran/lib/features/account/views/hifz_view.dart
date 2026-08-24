import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hifz_controller.dart';

import '../../../shared/widgets/loading_skeleton.dart';
import '../../../core/theme/app_colors.dart';

class HifzView extends GetView<HifzController> {
  const HifzView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Hifz Progress'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Surah'),
              Tab(text: 'Juz'),
            ],
          ),
        ),
        body: Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Obx(() {
              if (controller.isLoading.value) {
                return AppShimmer.surahList(count: 6);
              }

              return TabBarView(children: [_buildSurahList(), _buildJuzList()]);
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildSurahList() {
    final list = controller.surahProgress;
    if (list.isEmpty) return const SizedBox.shrink();

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 500,
        mainAxisExtent: 112,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
      ),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final progress = list[index];
        final theme = Theme.of(context);
        final nurColors = theme.extension<NurColorsExtension>();

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: nurColors?.surfaceSunk ?? theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: theme.colorScheme.outline.withValues(alpha: 0.1),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${progress.surahId}',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Surah ${progress.surahId}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress.percentage,
                        minHeight: 6,
                        backgroundColor: theme.colorScheme.outline.withValues(
                          alpha: 0.1,
                        ),
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${progress.memorisedCount} / ${progress.totalCount} Ayahs',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: nurColors?.foregroundSubtle,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Text(
                '${(progress.percentage * 100).toStringAsFixed(1)}%',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: progress.percentage == 1.0
                      ? theme.colorScheme.primary
                      : null,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildJuzList() {
    final list = controller.juzProgress;
    if (list.isEmpty) return const SizedBox.shrink();

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 500,
        mainAxisExtent: 112,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
      ),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final progress = list[index];
        final theme = Theme.of(context);
        final nurColors = theme.extension<NurColorsExtension>();

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: nurColors?.surfaceSunk ?? theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: theme.colorScheme.outline.withValues(alpha: 0.1),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${progress.juz}',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Juz ${progress.juz}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress.percentage,
                        minHeight: 6,
                        backgroundColor: theme.colorScheme.outline.withValues(
                          alpha: 0.1,
                        ),
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${progress.memorisedCount} / ${progress.totalCount} Ayahs',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: nurColors?.foregroundSubtle,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Text(
                '${(progress.percentage * 100).toStringAsFixed(1)}%',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: progress.percentage == 1.0
                      ? theme.colorScheme.primary
                      : null,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
