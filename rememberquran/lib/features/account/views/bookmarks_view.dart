import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/bookmarks_controller.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../shared/widgets/loading_skeleton.dart';
import '../../../core/theme/app_colors.dart';

class BookmarksView extends GetView<BookmarksController> {
  const BookmarksView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bookmarks & Notes'),
        bottom: TabBar(
          controller: controller.tabController,
          tabs: const [
            Tab(text: 'Collections'),
            Tab(text: 'Notes'),
          ],
        ),
      ),
      body: TabBarView(
        controller: controller.tabController,
        children: [
          _buildCollectionsTab(context),
          _buildNotesTab(context),
        ],
      ),
      floatingActionButton: Obx(() {
        if (controller.tabIndex.value == 0) {
          return FloatingActionButton(
            onPressed: () => _showCreateCollectionDialog(context),
            child: const Icon(Icons.create_new_folder),
          );
        }
        return const SizedBox.shrink();
      }),
    );
  }

  Widget _buildCollectionsTab(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value) {
        return AppShimmer.listTile(count: 3);
      }
      
      final collections = controller.collections;
      if (collections.isEmpty) {
        return const Center(child: Text('No collections yet.'));
      }

      return Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: collections.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final collection = collections[index];
              final theme = Theme.of(context);
              final nurColors = theme.extension<NurColorsExtension>();
              return Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    Get.toNamed(Routes.ACCOUNT_COLLECTION_DETAILS, arguments: collection.id);
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: nurColors?.surfaceSunk ?? theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: theme.colorScheme.outline.withValues(alpha: 0.1),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: collection.isDefault 
                                ? Colors.red.withValues(alpha: 0.1) 
                                : theme.colorScheme.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            collection.isDefault ? Icons.favorite : Icons.folder,
                            color: collection.isDefault ? Colors.red : theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                collection.name,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${collection.count} bookmarks',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: nurColors?.foregroundSubtle,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (!collection.isDefault)
                          IconButton(
                            icon: Icon(Icons.delete_outline, color: theme.colorScheme.error),
                            tooltip: 'Delete Collection',
                            onPressed: () => _confirmDeleteCollection(context, collection.id),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      );
    });
  }

  Widget _buildNotesTab(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value) {
        return AppShimmer.listTile(count: 3);
      }
      
      final notes = controller.notes;
      if (notes.isEmpty) {
        return const Center(child: Text('No notes yet.'));
      }

      return Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: notes.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final note = notes[index];
              final theme = Theme.of(context);
              final nurColors = theme.extension<NurColorsExtension>();
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: nurColors?.surfaceSunk ?? theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.colorScheme.outline.withValues(alpha: 0.1),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.note, color: theme.colorScheme.primary),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            note.verseKey,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            note.text,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: nurColors?.foregroundSubtle,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.delete_outline, color: theme.colorScheme.error),
                      tooltip: 'Delete Note',
                      onPressed: () => _confirmDeleteNote(context, note.verseKey),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      );
    });
  }

  void _showCreateCollectionDialog(BuildContext context) {
    final textController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('New Collection'),
          content: TextField(
            controller: textController,
            decoration: const InputDecoration(hintText: 'Collection Name'),
            autofocus: true,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final name = textController.text.trim();
                if (name.isNotEmpty) {
                  controller.createCollection(name);
                  Navigator.pop(context);
                }
              },
              child: const Text('Create'),
            ),
          ],
        );
      }
    );
  }

  void _confirmDeleteCollection(BuildContext context, String collectionId) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Delete Collection?'),
          content: const Text('Are you sure you want to delete this collection? Any bookmarks inside will be moved to Favourites.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                controller.deleteCollection(collectionId);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.error),
              child: const Text('Delete', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _confirmDeleteNote(BuildContext context, String verseKey) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Delete Note'),
          content: const Text('Are you sure you want to delete this note? This action cannot be undone.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                controller.deleteNote(verseKey);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.error),
              child: const Text('Delete', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
