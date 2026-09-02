import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../../../shared/widgets/app_state_views.dart';
import '../controllers/reader_controller.dart';
import '../controllers/reader_settings_controller.dart';
import 'widgets/ayah_block.dart';
import 'widgets/mushaf_page_view.dart';
import 'widgets/reader_settings_sheet.dart';
import 'widgets/quick_jump_sheet.dart';
import 'widgets/juz_navigation_sheet.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../audio/views/mini_player.dart';

class SurahReaderView extends GetView<ReaderController> {
  const SurahReaderView({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        // Ensures the last (debounced) reading-progress write actually
        // lands before the pop completes — see
        // ReaderController.flushPendingProgress for why this matters.
        await controller.flushPendingProgress();
        if (context.mounted) Navigator.of(context).pop(result);
      },
      child: Scaffold(
        appBar: AppBar(
          title: Obx(() {
            final name = controller.chapter.value?.nameSimple;
            if (name != null) return Text(name);
            return Text(controller.hasError.value ? 'Reader' : 'Loading…');
          }),
          centerTitle: true,
          actions: [
            Obx(() {
              final currentId = controller.chapter.value?.id;
              final isBusy = controller.isLoading.value;
              return IconButton(
                icon: const Icon(Icons.navigate_before),
                tooltip: 'Previous surah',
                onPressed: (isBusy || currentId == null)
                    ? null
                    : () => controller.loadChapter(
                        currentId > 1 ? currentId - 1 : 114,
                      ),
              );
            }),
            Obx(() {
              final currentId = controller.chapter.value?.id;
              final isBusy = controller.isLoading.value;
              return IconButton(
                icon: const Icon(Icons.navigate_next),
                tooltip: 'Next surah',
                onPressed: (isBusy || currentId == null)
                    ? null
                    : () => controller.loadChapter(
                        currentId < 114 ? currentId + 1 : 1,
                      ),
              );
            }),
            IconButton(
              icon: const Icon(Icons.menu_book_rounded),
              tooltip: 'Juz & Hizb Navigation',
              onPressed: () => JuzNavigationSheet.show(
                context,
                currentChapterId: controller.chapter.value?.id,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.search),
              tooltip: 'Quick Jump',
              onPressed: () => QuickJumpSheet.show(
                context,
                currentChapterId: controller.chapter.value?.id,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.settings),
              tooltip: 'Settings',
              onPressed: () => ReaderSettingsSheet.show(context),
            ),
          ],
        ),
        body: ResponsiveLayout(
          mobile: _buildReaderContent(context),
          desktop: Row(
            children: [
              SizedBox(width: 300, child: _buildSurahSidebar(context)),
              const VerticalDivider(width: 1, thickness: 1),
              Expanded(child: _buildReaderContent(context)),
            ],
          ),
        ),
        // The reader is a separate full-screen route from AppScaffold's tab
        // shell, which is the only other place MiniPlayer was mounted — so
        // playback appeared to have no persistent mini player at all the
        // moment a user actually opened a surah to read. MiniPlayer already
        // renders nothing (SizedBox.shrink()) when there's no active audio,
        // so mounting it here unconditionally is safe.
        bottomNavigationBar: const MiniPlayer(),
      ),
    );
  }

  Widget _buildSurahSidebar(BuildContext context) {
    // Attempt to get home controller for chapters, fallback if not available
    if (!Get.isRegistered<HomeController>()) {
      Get.put(HomeController(repository: Get.find()));
    }
    final homeController = Get.find<HomeController>();

    return Obx(() {
      if (homeController.chapters.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }
      return ListView.builder(
        itemCount: homeController.chapters.length,
        itemBuilder: (context, index) {
          final chapter = homeController.chapters[index];
          return ListTile(
            title: Text(chapter.nameSimple),
            subtitle: Text('${chapter.versesCount} Verses'),
            leading: CircleAvatar(
              radius: 14,
              child: Text(
                '${chapter.id}',
                style: const TextStyle(fontSize: 12),
              ),
            ),
            selected: controller.chapter.value?.id == chapter.id,
            onTap: () {
              // Instead of popping, we just change the current chapter in the reader
              controller.loadChapter(chapter.id);
            },
          );
        },
      );
    });
  }

  Widget _buildReaderContent(BuildContext context) {
    return Obx(() {
      if (controller.hasError.value && controller.verses.isEmpty) {
        return AppErrorView(
          message:
              "We couldn't load this surah. Check your connection and try again.",
          onRetry: controller.retryLoadChapter,
        );
      }

      if (controller.isLoading.value && controller.verses.isEmpty) {
        return const AppLoadingView(message: 'Preparing this surah…');
      }

      if (controller.verses.isEmpty) {
        return const AppEmptyView(
          title: 'No verses found',
          message: "This surah didn't return any verses.",
        );
      }

      // Capped and centered like a book page — this builder runs both
      // standalone (mobile, and tablet since there's no dedicated `tablet:`
      // branch above so it falls back to this) and embedded in the desktop
      // Row next to the sidebar, so the cap has to live here rather than
      // only around the desktop branch.
      return Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            children: [
              Obx(() {
                final message = controller.resumeBannerMessage.value;
                if (message == null) return const SizedBox.shrink();
                final theme = Theme.of(context);
                return Container(
                  width: double.infinity,
                  margin: const EdgeInsets.fromLTRB(16.0, 12.0, 16.0, 4.0),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14.0,
                    vertical: 10.0,
                  ),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer
                        .withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(10.0),
                    border: Border.all(
                      color: theme.colorScheme.primary
                          .withValues(alpha: 0.25),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.bookmark_outline,
                        size: 20,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          message,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 18),
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        tooltip: 'Dismiss',
                        onPressed: controller.dismissResumeBanner,
                      ),
                    ],
                  ),
                );
              }),
              Expanded(
                child: Obx(() {
                  if (Get.isRegistered<ReaderSettingsController>() &&
                      Get.find<ReaderSettingsController>().displayMode.value ==
                          DisplayMode.mushaf) {
                    return const MushafPageView();
                  }

                  return ScrollablePositionedList.builder(
                    itemCount: controller.verses.length,
                    itemScrollController: controller.itemScrollController,
                    itemPositionsListener: controller.itemPositionsListener,
                    padding: context.responsivePadding,
                    itemBuilder: (context, index) {
                      final verse = controller.verses[index];
                      return AyahBlock(
                        verse: verse,
                        words: controller.verseWords[verse.id] ?? [],
                        translations:
                            controller.verseTranslations[verse.id] ?? [],
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        ),
      );
    });
  }
}
