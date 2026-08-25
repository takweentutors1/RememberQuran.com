import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/home_controller.dart';
import '../../../app/routes/app_routes.dart';
import '../widgets/continue_reading_card.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/responsive_layout.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'RememberQuran',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            tooltip: 'Search',
            onPressed: () => Get.toNamed(Routes.SEARCH),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'Settings',
            onPressed: () => Get.toNamed(Routes.ACCOUNT_HOME),
          ),
        ],
      ),
      body: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 900),
          child: Obx(() {
            if (controller.isLoading.value && controller.chapters.isEmpty) {
              return ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  AppShimmer.card(height: 120), // Continue reading mock
                  const SizedBox(height: 16),
                  AppShimmer.card(height: 180), // Ayah of the day mock
                  const SizedBox(height: 24),
                  AppShimmer.block(width: 100, height: 24), // Title mock
                  const SizedBox(height: 12),
                  AppShimmer.surahList(count: 8),
                ],
              );
            }

            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const ContinueReadingCard(),
                      const SizedBox(height: 16),
                      _buildAyahOfTheDayCard(context),
                      const SizedBox(height: 24),
                      const Text(
                        'Surahs',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      if (constraints.maxWidth >= 600) {
                        final crossAxisCount = constraints.maxWidth >= 900
                            ? 3
                            : 2;
                        return GridView.builder(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16.0,
                          ).copyWith(bottom: 16.0),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxisCount,
                                mainAxisSpacing: 12,
                                crossAxisSpacing: 12,
                                mainAxisExtent: 80,
                              ),
                          itemCount: controller.chapters.length,
                          itemBuilder: (context, index) {
                            final chapter = controller.chapters[index];
                            return _buildSurahTile(context, chapter);
                          },
                        );
                      }
                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16.0,
                        ).copyWith(bottom: 16.0),
                        itemCount: controller.chapters.length,
                        itemBuilder: (context, index) {
                          final chapter = controller.chapters[index];
                          return _buildSurahTile(context, chapter);
                        },
                      );
                    },
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _buildAyahOfTheDayCard(BuildContext context) {
    final ayah = controller.ayahOfTheDay;
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();

    return Container(
      padding: EdgeInsets.all(
        context.rv(mobile: 20.0, tablet: 24.0, desktop: 28.0),
      ),
      decoration: BoxDecoration(
        color:
            nurColors?.brandGoldSoft ??
            theme.colorScheme.primaryContainer.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: (nurColors?.brandGold ?? theme.colorScheme.primary).withValues(
            alpha: 0.2,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(
                Icons.wb_sunny_rounded,
                size: 16,
                color: nurColors?.brandGold ?? theme.colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Text(
                'AYAH OF THE DAY',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: nurColors?.brandGold ?? theme.colorScheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            ayah.arabic,
            textAlign: TextAlign.right,
            style: TextStyle(
              fontFamily: 'UthmanicHafs',
              fontSize: context.rv(mobile: 28.0, tablet: 32.0, desktop: 34.0),
              height: 1.8,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            ayah.translation,
            style: TextStyle(
              fontSize: context.rv(mobile: 16.0, tablet: 17.0, desktop: 18.0),
              color:
                  nurColors?.foregroundSubtle ??
                  theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.9),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '${ayah.surah} ${ayah.verseKey}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: nurColors?.brandGold ?? theme.colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSurahTile(BuildContext context, chapter) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color:
              nurColors?.borderStrong ??
              theme.dividerColor.withValues(alpha: 0.5),
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => controller.onSurahTapped(chapter),
        child: Padding(
          padding: EdgeInsets.all(
            context.rv(mobile: 16.0, tablet: 18.0, desktop: 20.0),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color:
                      nurColors?.surfaceSunk ??
                      theme.colorScheme.surfaceContainerHighest,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${chapter.id}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chapter.nameSimple,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${chapter.revelationPlace.toUpperCase()} • ${chapter.versesCount} VERSES',
                      style: TextStyle(
                        fontSize: 12,
                        color:
                            nurColors?.foregroundSubtle ??
                            theme.textTheme.bodySmall?.color,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                chapter.nameArabic,
                style: const TextStyle(
                  fontFamily: 'Amiri',
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
