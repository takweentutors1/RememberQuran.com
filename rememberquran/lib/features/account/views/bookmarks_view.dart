import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/bookmarks_controller.dart';
import '../../../../app/routes/app_routes.dart';

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
        if (controller.tabController.index == 0) {
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
        return const Center(child: CircularProgressIndicator());
      }
      
      final collections = controller.collections;
      if (collections.isEmpty) {
        return const Center(child: Text('No collections yet.'));
      }

      return ListView.builder(
        itemCount: collections.length,
        itemBuilder: (context, index) {
          final collection = collections[index];
          return ListTile(
            leading: Icon(collection.isDefault ? Icons.favorite : Icons.folder),
            title: Text(collection.name),
            subtitle: Text('${collection.count} bookmarks'),
            trailing: collection.isDefault 
                ? null 
                : IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _confirmDeleteCollection(context, collection.id),
                  ),
            onTap: () {
              // Navigate to Collection Details
              Get.toNamed(Routes.ACCOUNT_COLLECTION_DETAILS, arguments: collection.id);
            },
          );
        },
      );
    });
  }

  Widget _buildNotesTab(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }
      
      final notes = controller.notes;
      if (notes.isEmpty) {
        return const Center(child: Text('No notes yet.'));
      }

      return ListView.builder(
        itemCount: notes.length,
        itemBuilder: (context, index) {
          final note = notes[index];
          return ListTile(
            leading: const Icon(Icons.note),
            title: Text(note.verseKey),
            subtitle: Text(note.text, maxLines: 2, overflow: TextOverflow.ellipsis),
            trailing: IconButton(
              icon: const Icon(Icons.delete, color: Colors.red),
              onPressed: () => controller.deleteNote(note.verseKey),
            ),
            onTap: () {
              // Navigate to Reader View at this verse
              // This depends on how ReaderView accepts arguments
            },
          );
        },
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
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              onPressed: () {
                controller.deleteCollection(collectionId);
                Navigator.pop(context);
              },
              child: const Text('Delete', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      }
    );
  }
}
