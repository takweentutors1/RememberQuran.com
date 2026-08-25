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

  Bookmark({
    required this.verseKey,
    required this.collectionId,
    required this.createdAt,
  });

  factory Bookmark.fromSnapshot(DocumentSnapshot snap) {
    final data = snap.data() as Map<String, dynamic>? ?? {};
    return Bookmark(
      verseKey: snap.id,
      collectionId: data['collectionId'] as String? ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.fromMillisecondsSinceEpoch(0),
    );
  }
}
