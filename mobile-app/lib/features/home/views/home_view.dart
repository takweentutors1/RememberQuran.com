import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/home_controller.dart';
import '../../../app/routes/app_routes.dart';
import '../widgets/continue_reading_card.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../../shared/widgets/eyebrow_label.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../account/controllers/auth_controller.dart';

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

            // Read directoryFilter here, synchronously inside Obx's build
            // callback (not deferred into a LayoutBuilder/sliver builder,
            // which run after Obx's reactive-dependency tracking window has
            // already closed) — otherwise a filter-chip tap would silently
            // do nothing.
            final filteredChapters = controller.filteredChapters;
            // Mirrors the width the old LayoutBuilder measured (bounded by
            // the 900px ConstrainedBox above), without needing a
            // sliver-aware LayoutBuilder just to pick grid vs list.
            final availableWidth = MediaQuery.sizeOf(context).width.clamp(0.0, 900.0);
            final isWide = availableWidth >= 600;

            // A single CustomScrollView — header content and the surah list
            // scroll together as one unit, rather than the header being a
            // fixed-size sibling competing with an Expanded list for space.
            // The header (search bar, ayah of the day, continue/start
            // reading, directory filter) kept growing across recent
            // changes; on shorter devices its natural height alone could
            // already exceed the whole body height, which is a "Column
            // overflowed" error a Column+Expanded split can't recover from
            // no matter how little space the list gets. A scrollable
            // header can never overflow — it just scrolls.
            return CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildSearchBar(context),
                        const SizedBox(height: 16),
                        _buildAyahOfTheDayCard(context),
                        const SizedBox(height: 16),
                        Obx(() {
                          final hasPosition =
                              Get.find<AuthController>().lastPosition.value != null;
                          return hasPosition
                              ? const ContinueReadingCard()
                              : _buildStartReadingCard(context);
                        }),
                        const SizedBox(height: 24),
                        const EyebrowLabel('Directory'),
                        const SizedBox(height: 12),
                        _buildDirectoryFilter(context),
                      ],
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0).copyWith(bottom: 16.0),
                  sliver: isWide
                      ? SliverGrid(
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: availableWidth >= 900 ? 3 : 2,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            mainAxisExtent: 80,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) => _buildSurahTile(context, filteredChapters[index]),
                            childCount: filteredChapters.length,
                          ),
                        )
                      : SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) => _buildSurahTile(context, filteredChapters[index]),
                            childCount: filteredChapters.length,
                          ),
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
          const EyebrowLabel('Ayah of the day'),
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
          // Quranic quotations are given in curly quotes, translator
          // credited — never paraphrased or shortened.
          Text(
            '“${ayah.translation}”',
            style: TextStyle(
              fontSize: context.rv(mobile: 16.0, tablet: 17.0, desktop: 18.0),
              color:
                  nurColors?.foregroundSubtle ??
                  theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.9),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${ayah.surah} ${ayah.verseKey}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: nurColors?.brandGold ?? theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              OutlinedButton(
                onPressed: () => Get.toNamed('/surah/${ayah.surahId}?ayahId=${ayah.ayahId}'),
                child: const Text('Read in context'),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: () => Get.toNamed(
                  Routes.SHARE_AYAH,
                  arguments: {
                    'textUthmani': ayah.arabic,
                    'translation': ayah.translation,
                    'reference': '${ayah.surah} ${ayah.verseKey}',
                  },
                ),
                child: const Text('Make a card'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Shown in place of ContinueReadingCard when there's no reading history
  /// yet (a new or logged-out reader) — an empty state that invites the
  /// next action instead of just disappearing.
  Widget _buildStartReadingCard(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        borderRadius: AppRadius.cardRadius,
        onTap: () => Get.toNamed('/surah/1'),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const EyebrowLabel('Start reading'),
                    const SizedBox(height: 8),
                    Text(
                      'Begin your reading journey',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Start reading',
                      style: TextStyle(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: theme.colorScheme.primary),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    return Material(
      color: theme.colorScheme.surface,
      borderRadius: AppRadius.pillRadius,
      child: InkWell(
        borderRadius: AppRadius.pillRadius,
        onTap: () => Get.toNamed(Routes.SEARCH),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: AppRadius.pillRadius,
            border: Border.all(color: nurColors?.borderStrong ?? theme.dividerColor),
          ),
          child: Row(
            children: [
              Icon(Icons.search_rounded, size: 20, color: nurColors?.foregroundSubtle),
              const SizedBox(width: 10),
              Text(
                'Search the Quran',
                style: theme.textTheme.bodyMedium?.copyWith(color: nurColors?.foregroundSubtle),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDirectoryFilter(BuildContext context) {
    const filters = ['All', 'Makki', 'Madani'];
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final selected = controller.directoryFilter.value;
    final jade = theme.colorScheme.primary;

    return Wrap(
      spacing: 8,
      children: [
        for (final filter in filters)
          ChoiceChip(
            label: Text(filter),
            selected: selected == filter,
            onSelected: (_) => controller.setDirectoryFilter(filter),
            showCheckmark: false,
            backgroundColor: nurColors?.surfaceSunk,
            selectedColor: jade.withOpacity(0.14),
            labelStyle: TextStyle(
              color: selected == filter ? jade : theme.textTheme.bodyMedium?.color,
              fontWeight: FontWeight.w600,
            ),
            side: BorderSide(color: selected == filter ? jade.withOpacity(0.4) : Colors.transparent),
          ),
      ],
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
                style: AppTypography.arabicUi(fontSize: 24, weight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
