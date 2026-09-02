import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hifz_controller.dart';

import '../../../app/routes/app_routes.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../../core/theme/app_colors.dart';

class HifzView extends GetView<HifzController> {
  const HifzView({super.key});

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

              return Column(
                children: [
                  _buildDueReviewsBanner(context),
                  Expanded(
                    child: TabBarView(
                      children: [_buildSurahList(), _buildJuzList()],
                    ),
                  ),
                ],
              );
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildDueReviewsBanner(BuildContext context) {
    return Obx(() {
      final dueCount = controller.dueReviews.length;
      if (dueCount == 0) return const SizedBox.shrink();

      final theme = Theme.of(context);
      final nurColors = theme.extension<NurColorsExtension>();
      final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

      return Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 4),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: brandGold.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: brandGold.withValues(alpha: 0.35),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: brandGold.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.psychology_alt_rounded,
                color: brandGold,
                size: 26,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Spaced Repetition Review',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$dueCount ${dueCount == 1 ? 'ayah is' : 'ayahs are'} due for review today',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.textTheme.bodySmall?.color?.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: brandGold,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
              icon: const Icon(Icons.play_arrow_rounded, size: 18),
              label: const Text(
                'Review',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              onPressed: () async {
                await Get.toNamed(Routes.ACCOUNT_HIFZ_REVIEW);
                controller.loadData();
              },
            ),
          ],
        ),
      );
    });
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
