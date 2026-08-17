import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../controllers/reader_controller.dart';
import 'widgets/ayah_block.dart';
import 'widgets/reader_settings_sheet.dart';

class SurahReaderView extends GetView<ReaderController> {
  const SurahReaderView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() => Text(controller.chapter.value?.nameSimple ?? 'Loading...')),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings), 
            onPressed: () => ReaderSettingsSheet.show(context),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.verses.isEmpty) {
          return const Center(child: CircularProgressIndicator());
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
