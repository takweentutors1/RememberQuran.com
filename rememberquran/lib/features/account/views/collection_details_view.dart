import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/bookmarks_controller.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import '../../../core/theme/app_colors.dart';

class CollectionDetailsView extends StatefulWidget {
  const CollectionDetailsView({Key? key}) : super(key: key);

  @override
  State<CollectionDetailsView> createState() => _CollectionDetailsViewState();
}

class _CollectionDetailsViewState extends State<CollectionDetailsView> {
  final BookmarksController _controller = Get.find<BookmarksController>();

  @override
  void initState() {
    super.initState();
    final args = Get.arguments;
    if (args is String) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _controller.loadBookmarksForCollection(args);
      });
    } else {
      // No/invalid collection id (e.g. a direct deep link) — bail back to the list.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Get.offNamed(Routes.ACCOUNT_BOOKMARKS);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() {
          final coll = _controller.currentCollection.value;
          return Text(coll?.name ?? 'Collection');
        }),
        actions: [
          Obx(() {
            final coll = _controller.currentCollection.value;
            if (coll != null && !coll.isDefault) {
              return IconButton(
                icon: const Icon(Icons.edit),
                tooltip: 'Rename Collection',
                onPressed: () => _showRenameDialog(context, coll.id, coll.name),
              );
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
      body: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Obx(() {
            if (_controller.isLoadingBookmarks.value) {
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: 6,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, __) => AppShimmer.listTile(count: 1),
              );
            }

            final bookmarks = _controller.currentCollectionBookmarks;
            if (bookmarks.isEmpty) {
              return const Center(
                child: Text('No bookmarks in this collection.'),
              );
            }

            return GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 380,
                mainAxisExtent: 92,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
              ),
              itemCount: bookmarks.length,
              itemBuilder: (context, index) {
                final bookmark = bookmarks[index];
                final theme = Theme.of(context);
                final nurColors = theme.extension<NurColorsExtension>();
                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      // Routes.READER referenced here previously doesn't
                      // exist in this app's route table — this mirrors the
                      // pattern search results already use to jump to a
                      // specific ayah (SearchController.onResultTapped).
                      final parts = bookmark.verseKey.split(':');
                      if (parts.length != 2) return;
                      Get.toNamed(
                        Routes.SURAH_AYAH
                            .replaceAll(':surahId', parts[0])
                            .replaceAll(':ayahId', parts[1]),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color:
                            nurColors?.surfaceSunk ?? theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: theme.colorScheme.outline.withValues(
                            alpha: 0.1,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withValues(
                                alpha: 0.1,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.bookmark,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  bookmark.verseKey,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  bookmark.createdAt.toString(),
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: nurColors?.foregroundSubtle,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              Icons.delete_outline,
                              color: theme.colorScheme.error,
                            ),
                            tooltip: 'Delete Bookmark',
                            onPressed: () => _confirmDeleteBookmark(
                              context,
                              bookmark.verseKey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          }),
        ),
      ),
    );
  }

  void _showRenameDialog(BuildContext context, String id, String currentName) {
    final textController = TextEditingController(text: currentName);
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Rename Collection'),
          content: TextField(
            controller: textController,
            decoration: const InputDecoration(hintText: 'New Name'),
            autofocus: true,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final newName = textController.text.trim();
                if (newName.isNotEmpty && newName != currentName) {
                  _controller.renameCollection(id, newName);
                  Navigator.pop(context);
                }
              },
              child: const Text('Rename'),
            ),
          ],
        );
      },
    );
  }

  void _confirmDeleteBookmark(BuildContext context, String verseKey) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Delete Bookmark'),
          content: const Text(
            'Are you sure you want to delete this bookmark? This action cannot be undone.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                _controller.deleteBookmark(verseKey);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.error,
              ),
              child: const Text(
                'Delete',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        );
      },
    );
  }
}
