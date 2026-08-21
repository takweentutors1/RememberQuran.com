import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../../../shared/widgets/app_state_views.dart';
import '../controllers/reader_controller.dart';
import 'widgets/ayah_block.dart';
import 'widgets/reader_settings_sheet.dart';
import 'widgets/quick_jump_sheet.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/utils/responsive_layout.dart';

class SurahReaderView extends GetView<ReaderController> {
  const SurahReaderView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                  : () => controller.loadChapter(currentId > 1 ? currentId - 1 : 114),
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
                  : () => controller.loadChapter(currentId < 114 ? currentId + 1 : 1),
            );
          }),
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
          child: ScrollablePositionedList.builder(
            itemCount: controller.verses.length,
            itemScrollController: controller.itemScrollController,
            itemPositionsListener: controller.itemPositionsListener,
            padding: context.responsivePadding,
            itemBuilder: (context, index) {
              final verse = controller.verses[index];
              return AyahBlock(
                verse: verse,
                words: controller.verseWords[verse.id] ?? [],
                translations: controller.verseTranslations[verse.id] ?? [],
              );
            },
          ),
        ),
      );
    });
  }
}
