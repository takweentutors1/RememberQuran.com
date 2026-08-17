import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/home_controller.dart';
import '../../../app/routes/app_routes.dart';
import '../widgets/continue_reading_card.dart';
import '../../../shared/widgets/loading_skeleton.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('RememberQuran', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: false,
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () => Get.toNamed(Routes.SEARCH)),
          IconButton(icon: const Icon(Icons.settings), onPressed: () => Get.toNamed(Routes.ACCOUNT_HOME)),
        ],
      ),
      body: Obx(() {
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

        return CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.all(16.0),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const ContinueReadingCard(),
                  _buildAyahOfTheDayCard(context),
                  const SizedBox(height: 24),
                  const Text(
                    'Surahs',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                ]),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              sliver: SliverList.builder(
                itemCount: controller.chapters.length,
                itemBuilder: (context, index) {
                  final chapter = controller.chapters[index];
                  return _buildSurahTile(context, chapter);
                },
              ),
            ),
            const SliverPadding(padding: EdgeInsets.only(bottom: 16.0)),
          ],
        );
      }),
    );
  }

  Widget _buildAyahOfTheDayCard(BuildContext context) {
    final ayah = controller.ayahOfTheDay;
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer.withOpacity(0.4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.primary.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.wb_sunny_rounded, size: 16, color: theme.colorScheme.primary),
              const SizedBox(width: 8),
              Text(
                'AYAH OF THE DAY',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: theme.colorScheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            ayah.arabic,
            textAlign: TextAlign.right,
            style: const TextStyle(
              fontFamily: 'UthmanicHafs',
              fontSize: 28,
              height: 1.8,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            ayah.translation,
            style: TextStyle(
              fontSize: 16,
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.9),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '${ayah.surah} ${ayah.verseKey}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSurahTile(BuildContext context, chapter) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: theme.dividerColor.withOpacity(0.5)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => controller.onSurahTapped(chapter),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
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
                        color: theme.textTheme.bodySmall?.color,
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
