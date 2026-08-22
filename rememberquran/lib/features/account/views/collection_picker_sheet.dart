import 'package:flutter/material.dart';
import '../../../data/models/bookmark.dart';
import '../../../data/repositories/bookmarks_repository.dart';
import '../../../core/utils/responsive_layout.dart';

/// Bottom sheet for picking which collection a new bookmark should be saved
/// into. Previously every bookmark silently defaulted to Favourites — this
/// is the "at the time of saving" selection step that was missing.
///
/// Returns the chosen collection's id via [Navigator.pop], or null if the
/// user dismissed the sheet without picking (callers should treat that as
/// "cancelled the save", not "use the default").
class CollectionPickerSheet extends StatefulWidget {
  final String userId;

  const CollectionPickerSheet({Key? key, required this.userId}) : super(key: key);

  static Future<String?> show(BuildContext context, String userId) {
    return showResponsiveSheet<String>(
      context: context,
      builder: (_) => CollectionPickerSheet(userId: userId),
    );
  }

  @override
  State<CollectionPickerSheet> createState() => _CollectionPickerSheetState();
}

class _CollectionPickerSheetState extends State<CollectionPickerSheet> {
  final BookmarksRepository _repo = BookmarksRepository();
  final TextEditingController _newNameController = TextEditingController();
  List<BookmarkCollection> _collections = [];
  bool _isLoading = true;
  bool _isCreating = false;
  String? _createError;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _newNameController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    // Guarantees at least one option even for a brand-new account that has
    // never had a collection lazily created for it yet.
    await _repo.getOrCreateFavourites(widget.userId);
    final collections = await _repo.listCollections(widget.userId);
    if (!mounted) return;
    setState(() {
      _collections = collections;
      _isLoading = false;
    });
  }

  Future<void> _createAndSelect() async {
    final name = _newNameController.text.trim();
    if (name.isEmpty) return;
    setState(() {
      _isCreating = true;
      _createError = null;
    });
    final res = await _repo.createCollection(widget.userId, name);
    if (!mounted) return;
    if (res['ok'] == true && res['id'] != null) {
      Navigator.pop(context, res['id'] as String);
      return;
    }
    setState(() {
      _isCreating = false;
      _createError = res['error'] == 'duplicate-name'
          ? 'A collection with that name already exists.'
          : res['error'] == 'limit-reached'
              ? 'You\'ve reached the collection limit.'
              : 'Couldn\'t create that collection. Please try again.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: theme.dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Text(
              'Save to Collection',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              )
            else
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: _collections.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 2),
                  itemBuilder: (context, index) {
                    final c = _collections[index];
                    return ListTile(
                      leading: Icon(
                        c.isDefault ? Icons.star_rounded : Icons.folder_rounded,
                        color: c.isDefault ? theme.colorScheme.primary : null,
                      ),
                      title: Text(c.name),
                      subtitle: Text('${c.count} bookmark${c.count == 1 ? '' : 's'}'),
                      onTap: () => Navigator.pop(context, c.id),
                    );
                  },
                ),
              ),
            const Divider(height: 28),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: TextField(
                    controller: _newNameController,
                    enabled: !_isCreating,
                    decoration: InputDecoration(
                      hintText: 'New collection name',
                      isDense: true,
                      border: const OutlineInputBorder(),
                      errorText: _createError,
                    ),
                    onSubmitted: (_) => _createAndSelect(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: _isCreating
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.add_circle_rounded),
                  onPressed: _isCreating ? null : _createAndSelect,
                  tooltip: 'Create and save here',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
