import 'package:cloud_firestore/cloud_firestore.dart';

class BookmarkCollection {
  final String id;
  final String name;
  final bool isDefault;
  final int count;

  BookmarkCollection({
    required this.id,
    required this.name,
    required this.isDefault,
    required this.count,
  });

  factory BookmarkCollection.fromSnapshot(DocumentSnapshot snap) {
    final data = snap.data() as Map<String, dynamic>? ?? {};
    return BookmarkCollection(
      id: snap.id,
      name: data['name'] as String? ?? '',
      isDefault: data['isDefault'] as bool? ?? false,
      count: data['bookmarkCount'] as int? ?? 0,
    );
  }
}

class Bookmark {
  final String verseKey;
  final String collectionId;
  final DateTime createdAt;

  /// Manual position within its collection, set once the user first
  /// reorders that collection — null until then, so existing bookmarks
  /// keep sorting by [createdAt] (unchanged behaviour) until a reorder
  /// backfills an index for every bookmark in the collection.
  final int? sortIndex;

  Bookmark({
    required this.verseKey,
    required this.collectionId,
    required this.createdAt,
    this.sortIndex,
  });

  factory Bookmark.fromSnapshot(DocumentSnapshot snap) {
    final data = snap.data() as Map<String, dynamic>? ?? {};
    return Bookmark(
      verseKey: snap.id,
      collectionId: data['collectionId'] as String? ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.fromMillisecondsSinceEpoch(0),
      sortIndex: data['sortIndex'] as int?,
    );
  }
}
