import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/search_controller.dart' as my_search;
import '../../../core/utils/search_highlight_text.dart';
import '../../../shared/widgets/loading_skeleton.dart';

class SearchView extends GetView<my_search.SearchController> {
  const SearchView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Get.put(my_search.SearchController());
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: controller.queryController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search Quran...',
            border: InputBorder.none,
          ),
          onChanged: controller.onSearchChanged,
        ),
        actions: [
          Obx(() => controller.currentQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    controller.queryController.clear();
                    controller.onSearchChanged('');
                  },
                )
              : const SizedBox.shrink()),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.results.isEmpty) {
          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              AppShimmer.surahList(count: 6),
            ],
          );
        }

        if (controller.error.isNotEmpty && controller.results.isEmpty) {
          return Center(child: Text(controller.error.value, style: TextStyle(color: theme.colorScheme.error)));
        }

        if (controller.results.isEmpty && controller.currentQuery.value.length > 2) {
          return const Center(child: Text('No results found'));
        }

        if (controller.results.isEmpty) {
          return Center(
            child: Text(
              'Type at least 3 characters to search',
              style: TextStyle(color: theme.colorScheme.onSurfaceVariant),
            ),
          );
        }

        return NotificationListener<ScrollNotification>(
          onNotification: (ScrollNotification scrollInfo) {
            if (scrollInfo.metrics.pixels == scrollInfo.metrics.maxScrollExtent) {
              controller.loadMore();
            }
            return true;
          },
          child: ListView.separated(
            padding: const EdgeInsets.all(16.0),
            itemCount: controller.results.length + (controller.hasMore.value ? 1 : 0),
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              if (index == controller.results.length) {
                return Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: AppShimmer.listTile(count: 1),
                );
              }

              final result = controller.results[index];
              return InkWell(
                onTap: () => controller.onResultTapped(result),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Surah ${result.chapterId}, Ayah ${result.verseNumber}',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Combine words to show the matching Arabic text
                      Directionality(
                        textDirection: TextDirection.rtl,
                        child: Text.rich(
                          TextSpan(
                            children: result.words.map((w) {
                              return TextSpan(
                                text: '${w.text} ',
                                style: TextStyle(
                                  fontFamily: 'UthmanicHafs',
                                  fontSize: 24,
                                  color: w.highlight ? theme.colorScheme.primary : theme.textTheme.bodyLarge?.color,
                                  fontWeight: w.highlight ? FontWeight.bold : FontWeight.normal,
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Show matching translations
                      if (result.translations.isNotEmpty) ...[
                        ...result.translations.map((t) => Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Text.rich(
                            SearchHighlightText.buildHighlights(
                              text: t.text,
                              defaultStyle: TextStyle(
                                fontSize: 16,
                                color: theme.textTheme.bodyMedium?.color,
                              ),
                              highlightStyle: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.primary,
                                backgroundColor: theme.colorScheme.primaryContainer.withOpacity(0.3),
                              ),
                            ),
                          ),
                        )).toList(),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        );
      }),
    );
  }
}
