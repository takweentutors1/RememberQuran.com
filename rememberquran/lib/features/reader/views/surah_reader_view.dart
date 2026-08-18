import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../../../shared/widgets/app_state_views.dart';
import '../controllers/reader_controller.dart';
import 'widgets/ayah_block.dart';
import 'widgets/reader_settings_sheet.dart';
import 'widgets/quick_jump_sheet.dart';

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
          IconButton(
            icon: const Icon(Icons.search),
            tooltip: 'Quick Jump',
            onPressed: () => QuickJumpSheet.show(
              context, 
              currentChapterId: controller.chapter.value?.id
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'Settings',
            onPressed: () => ReaderSettingsSheet.show(context),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.hasError.value && controller.verses.isEmpty) {
          return AppErrorView(
            message: "We couldn't load this surah. Check your connection and try again.",
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

        return ScrollablePositionedList.builder(
          itemCount: controller.verses.length,
          itemScrollController: controller.itemScrollController,
          itemPositionsListener: controller.itemPositionsListener,
          itemBuilder: (context, index) {
            final verse = controller.verses[index];
            return AyahBlock(
              verse: verse,
              words: controller.verseWords[verse.id] ?? [],
              translations: controller.verseTranslations[verse.id] ?? [],
            );
          },
        );
      }),
    );
  }
}
