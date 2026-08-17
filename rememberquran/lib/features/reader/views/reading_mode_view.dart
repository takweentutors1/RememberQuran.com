import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import '../controllers/reader_controller.dart';
import 'widgets/arabic_word.dart';
import '../../../shared/widgets/loading_skeleton.dart';

class ReadingModeView extends GetView<ReaderController> {
  const ReadingModeView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() => Text(controller.chapter.value?.nameSimple ?? 'Loading...')),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.settings), onPressed: () {}),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.verses.isEmpty) {
          return AppShimmer.ayahList(count: 8);
        }

        return ScrollablePositionedList.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          itemCount: controller.verses.length,
          itemScrollController: controller.itemScrollController,
          itemPositionsListener: controller.itemPositionsListener,
          itemBuilder: (context, index) {
            final verse = controller.verses[index];
            final words = controller.verseWords[verse.id] ?? [];
            
            return Directionality(
              textDirection: TextDirection.rtl,
              child: Wrap(
                spacing: 6.0,
                runSpacing: 16.0,
                alignment: WrapAlignment.start,
                children: words.map((w) => ArabicWord(word: w, verseKey: verse.verseKey)).toList(),
              ),
            );
          },
        );
      }),
    );
  }
}
