import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/bookmarks_controller.dart';
import '../../../../app/routes/app_routes.dart';

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
                onPressed: () => _showRenameDialog(context, coll.id, coll.name),
              );
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
      body: Obx(() {
        if (_controller.isLoadingBookmarks.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final bookmarks = _controller.currentCollectionBookmarks;
        if (bookmarks.isEmpty) {
          return const Center(child: Text('No bookmarks in this collection.'));
        }

        return ListView.builder(
          itemCount: bookmarks.length,
          itemBuilder: (context, index) {
            final bookmark = bookmarks[index];
            return ListTile(
              leading: const Icon(Icons.bookmark),
              title: Text(bookmark.verseKey),
              subtitle: Text(bookmark.createdAt.toString()),
              trailing: IconButton(
                icon: const Icon(Icons.delete, color: Colors.red),
                onPressed: () => _controller.deleteBookmark(bookmark.verseKey),
              ),
              onTap: () {
                // Navigate to reader
                // Get.toNamed(Routes.READER, arguments: {'verseKey': bookmark.verseKey});
              },
            );
          },
        );
      }),
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
      }
    );
  }
}
