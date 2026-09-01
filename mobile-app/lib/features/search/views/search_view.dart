import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/search_controller.dart' as my_search;
import '../../../core/utils/search_highlight_text.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../../core/theme/app_colors.dart';

class SearchView extends GetView<my_search.SearchController> {
  const SearchView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Get.put(my_search.SearchController());
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Search',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 900),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextField(
                  controller: controller.queryController,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText: 'Search Quran...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: Obx(
                      () => controller.currentQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              tooltip: 'Clear search',
                              onPressed: () {
                                controller.queryController.clear();
                                controller.onSearchChanged('');
                              },
                            )
                          : const SizedBox.shrink(),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: theme.dividerColor),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: theme.dividerColor),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: theme.colorScheme.primary),
                    ),
                  ),
                  onChanged: controller.onSearchChanged,
                ),
              ),
              Expanded(
                child: Obx(() {
                  if (controller.isLoading.value &&
                      controller.results.isEmpty) {
                    return ListView(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      children: [AppShimmer.surahList(count: 6)],
                    );
                  }

                  if (controller.error.isNotEmpty &&
                      controller.results.isEmpty) {
                    return Center(
                      child: Text(
                        controller.error.value,
                        style: TextStyle(color: theme.colorScheme.error),
                      ),
                    );
                  }

                  if (controller.results.isEmpty &&
                      controller.currentQuery.value.length > 2) {
                    return const Center(child: Text('No results found'));
                  }

                  if (controller.results.isEmpty) {
                    return Center(
                      child: Text(
                        'Type at least 3 characters to search',
                        style: TextStyle(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    );
                  }

                  return NotificationListener<ScrollNotification>(
                    onNotification: (ScrollNotification scrollInfo) {
                      if (scrollInfo.metrics.pixels ==
                          scrollInfo.metrics.maxScrollExtent) {
                        controller.loadMore();
                      }
                      return true;
                    },
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        final bool isDesktop = constraints.maxWidth >= 900;
                        final bool isTablet =
                            constraints.maxWidth >= 600 &&
                            constraints.maxWidth < 900;
                        final int crossAxisCount = isDesktop
                            ? 3
                            : (isTablet ? 2 : 1);

                        if (crossAxisCount == 1) {
                          return ListView.separated(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                              vertical: 8.0,
                            ),
                            itemCount:
                                controller.results.length +
                                (controller.hasMore.value ? 1 : 0),
                            separatorBuilder: (context, index) =>
                                const Divider(),
                            itemBuilder: (context, index) {
                              if (index == controller.results.length) {
                                return Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: AppShimmer.listTile(count: 1),
                                );
                              }
                              return _buildResultItem(
                                context,
                                index,
                                theme,
                                nurColors,
                              );
                            },
                          );
                        } else {
                          return GridView.builder(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                              vertical: 8.0,
                            ),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: crossAxisCount,
                                  crossAxisSpacing: 16.0,
                                  mainAxisSpacing: 16.0,
                                  childAspectRatio:
                                      0.8, // Adjust based on content height
                                ),
                            itemCount:
                                controller.results.length +
                                (controller.hasMore.value ? 1 : 0),
                            itemBuilder: (context, index) {
                              if (index == controller.results.length) {
                                return Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: AppShimmer.listTile(count: 1),
                                );
                              }
                              return Card(
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  side: BorderSide(
                                    color: theme.dividerColor.withValues(
                                      alpha: 0.5,
                                    ),
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: _buildResultItem(
                                    context,
                                    index,
                                    theme,
                                    nurColors,
                                  ),
                                ),
                              );
                            },
                          );
                        }
                      },
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultItem(
    BuildContext context,
    int index,
    ThemeData theme,
    NurColorsExtension? nurColors,
  ) {
    final result = controller.results[index];
    return InkWell(
      onTap: () => controller.onResultTapped(result),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 8.0),
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
                    color: nurColors?.brandGold ?? theme.colorScheme.primary,
                  ),
                ),
              ],
            ),
            if (result.words.isNotEmpty) ...[
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
                          color: w.highlight
                              ? (nurColors?.brandGold ??
                                    theme.colorScheme.primary)
                              : theme.textTheme.bodyLarge?.color,
                          fontWeight: w.highlight
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ] else ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.bolt_rounded, size: 20, color: nurColors?.brandGold ?? theme.colorScheme.primary),
                  const SizedBox(width: 8),
                  Text(
                    'Jump directly to Surah ${result.chapterId}, Ayah ${result.verseNumber}',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 12),
            // Show matching translations
            if (result.translations.isNotEmpty) ...[
              ...result.translations
                  .map(
                    (t) => Padding(
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
                            color:
                                nurColors?.brandGold ??
                                theme.colorScheme.primary,
                            backgroundColor:
                                nurColors?.brandGoldSoft ??
                                theme.colorScheme.primaryContainer.withValues(
                                  alpha: 0.3,
                                ),
                          ),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ],
          ],
        ),
      ),
    );
  }
}
