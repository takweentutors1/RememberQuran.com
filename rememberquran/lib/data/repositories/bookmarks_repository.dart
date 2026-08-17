import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/bookmark.dart';

class BookmarksRepository {
  final FirebaseFirestore _db;
  
  static const int MAX_BOOKMARKS = 2000;
  static const int MAX_COLLECTIONS = 50;
  static const String FAVOURITES_NAME = "Favourites";

  BookmarksRepository({FirebaseFirestore? db}) : _db = db ?? FirebaseFirestore.instance;

  CollectionReference _collectionsRef(String userId) {
    return _db.collection('users').doc(userId).collection('bookmarkCollections');
  }

  CollectionReference _bookmarksRef(String userId) {
    return _db.collection('users').doc(userId).collection('bookmarks');
  }

  // ===========================================================================
  // Collections
  // ===========================================================================

  Future<List<BookmarkCollection>> listCollections(String userId) async {
    final snap = await _collectionsRef(userId)
        .orderBy('isDefault', descending: true)
        .orderBy('createdAt', descending: false)
        .get();
    return snap.docs.map((doc) => BookmarkCollection.fromSnapshot(doc)).toList();
  }

  Future<BookmarkCollection?> getCollection(String userId, String id) async {
    final snap = await _collectionsRef(userId).doc(id).get();
    if (!snap.exists) return null;
    return BookmarkCollection.fromSnapshot(snap);
  }

  Future<BookmarkCollection> getOrCreateFavourites(String userId) async {
    final ref = _collectionsRef(userId);
    final existing = await ref.where('isDefault', isEqualTo: true).limit(1).get();
    
    if (existing.docs.isNotEmpty) {
      return BookmarkCollection.fromSnapshot(existing.docs.first);
    }

    final byName = await ref.where('name', isEqualTo: FAVOURITES_NAME).limit(1).get();
    if (byName.docs.isNotEmpty) {
      final doc = byName.docs.first;
      await doc.reference.update({
        'isDefault': true,
        'updatedAt': FieldValue.serverTimestamp(),
      });
      final updatedSnap = await doc.reference.get();
      return BookmarkCollection.fromSnapshot(updatedSnap);
    }

    final newRef = ref.doc();
    final now = FieldValue.serverTimestamp();
    await newRef.set({
      'name': FAVOURITES_NAME,
      'isDefault': true,
      'bookmarkCount': 0,
      'createdAt': now,
      'updatedAt': now,
    });
    
    final createdSnap = await newRef.get();
    return BookmarkCollection.fromSnapshot(createdSnap);
  }

  Future<Map<String, dynamic>> createCollection(String userId, String name) async {
    final ref = _collectionsRef(userId);
    final newRef = ref.doc();

    // Firestore transactions can only read individual documents by
    // reference — queries and count() aggregates must be read outside the
    // transaction, so these are best-effort pre-checks, not a hard guarantee
    // against a name collision or exceeding MAX_COLLECTIONS under a race.
    final dupeQuery = await ref.where('name', isEqualTo: name).limit(1).get();
    if (dupeQuery.docs.isNotEmpty) {
      return {'ok': false, 'error': 'duplicate-name'};
    }

    final countQuery = await ref.count().get();
    if ((countQuery.count ?? 0) >= MAX_COLLECTIONS) {
      return {'ok': false, 'error': 'limit-reached'};
    }

    return _db.runTransaction((tx) async {
      final now = FieldValue.serverTimestamp();
      tx.set(newRef, {
        'name': name,
        'isDefault': false,
        'bookmarkCount': 0,
        'createdAt': now,
        'updatedAt': now,
      });

      return {'ok': true, 'id': newRef.id};
    });
  }

  Future<Map<String, dynamic>> renameCollection(String userId, String id, String name) async {
    final ref = _collectionsRef(userId);
    final targetRef = ref.doc(id);

    // Best-effort pre-check — see createCollection for why this can't run
    // inside the transaction itself.
    final dupeQuery = await ref.where('name', isEqualTo: name).limit(1).get();
    if (dupeQuery.docs.isNotEmpty && dupeQuery.docs.first.id != id) {
      return {'ok': false, 'error': 'duplicate-name'};
    }

    return _db.runTransaction((tx) async {
      final targetSnap = await tx.get(targetRef);
      if (!targetSnap.exists) {
        return {'ok': false, 'error': 'not-found'};
      }

      final data = targetSnap.data() as Map<String, dynamic>;
      if (data['isDefault'] == true) {
        return {'ok': false, 'error': 'is-default'};
      }

      tx.update(targetRef, {
        'name': name,
        'updatedAt': FieldValue.serverTimestamp(),
      });

      return {'ok': true};
    });
  }

  Future<Map<String, dynamic>> deleteCollection(String userId, String id) async {
    final targetRef = _collectionsRef(userId).doc(id);
    final target = await targetRef.get();
    
    if (!target.exists) return {'ok': false, 'error': 'not-found'};
    final data = target.data() as Map<String, dynamic>;
    if (data['isDefault'] == true) return {'ok': false, 'error': 'is-default'};

    final favourites = await getOrCreateFavourites(userId);
    final bRef = _bookmarksRef(userId);
    final toMove = await bRef.where('collectionId', isEqualTo: id).get();

    final WriteBatch batch = _db.batch();
    for (var doc in toMove.docs) {
      batch.update(doc.reference, {'collectionId': favourites.id});
    }

    final movedCount = toMove.size;
    batch.update(_collectionsRef(userId).doc(favourites.id), {
      'bookmarkCount': FieldValue.increment(movedCount),
    });
    batch.delete(targetRef);

    await batch.commit();

    return {'ok': true, 'movedToFavourites': movedCount};
  }

  Future<void> _adjustBookmarkCount(String userId, String collectionId, int delta) async {
    await _collectionsRef(userId).doc(collectionId).update({
      'bookmarkCount': FieldValue.increment(delta),
    });
  }

  // ===========================================================================
  // Bookmarks
  // ===========================================================================

  Future<List<Bookmark>> listBookmarks(String userId, {String? collectionId, int? surahPrefix}) async {
    Query query = _bookmarksRef(userId);

    if (collectionId != null) {
      query = query.where('collectionId', isEqualTo: collectionId);
    }
    
    if (surahPrefix != null) {
      final prefix = '$surahPrefix:';
      query = query.orderBy(FieldPath.documentId)
          .startAt([prefix])
          .endAt(['$prefix\uf8ff']);
      final snap = await query.limit(MAX_BOOKMARKS).get();
      return snap.docs.map((d) => Bookmark.fromSnapshot(d)).toList();
    }

    final snap = await query.orderBy('createdAt', descending: true).limit(MAX_BOOKMARKS).get();
    return snap.docs.map((d) => Bookmark.fromSnapshot(d)).toList();
  }

  Future<int> countBookmarks(String userId) async {
    final snap = await _bookmarksRef(userId).count().get();
    return snap.count ?? 0;
  }

  Future<Bookmark?> getBookmark(String userId, String verseKey) async {
    final snap = await _bookmarksRef(userId).doc(verseKey).get();
    if (!snap.exists) return null;
    return Bookmark.fromSnapshot(snap);
  }

  Future<Map<String, dynamic>> createBookmark(String userId, String verseKey, String? collectionId) async {
    final existing = await getBookmark(userId, verseKey);
    if (existing != null) return {'ok': true, 'created': false, 'bookmark': existing};

    final targetCollectionId = collectionId ?? (await getOrCreateFavourites(userId)).id;

    final ref = _bookmarksRef(userId);
    final bookmarkRef = ref.doc(verseKey);
    final collectionRef = collectionId != null ? _collectionsRef(userId).doc(collectionId) : null;

    // Best-effort pre-check — see createCollection for why a count()
    // aggregate can't be read inside the transaction itself.
    final countSnap = await ref.count().get();
    if ((countSnap.count ?? 0) >= MAX_BOOKMARKS) {
      return {'ok': false, 'error': 'limit-reached'};
    }

    final outcome = await _db.runTransaction((tx) async {
      if (collectionRef != null) {
        final collectionSnap = await tx.get(collectionRef);
        if (!collectionSnap.exists) {
          return {'ok': false, 'error': 'collection-not-found'};
        }
      }

      final bookmarkSnap = await tx.get(bookmarkRef);
      if (bookmarkSnap.exists) return {'ok': true, 'created': false};

      tx.set(bookmarkRef, {
        'collectionId': targetCollectionId,
        'createdAt': FieldValue.serverTimestamp(),
      });

      return {'ok': true, 'created': true};
    });

    if (outcome['ok'] != true) return outcome;

    if (outcome['created'] != true) {
      final raced = await getBookmark(userId, verseKey);
      return {'ok': true, 'created': false, 'bookmark': raced};
    }

    await _adjustBookmarkCount(userId, targetCollectionId, 1);
    final createdRecord = await getBookmark(userId, verseKey);
    return {'ok': true, 'created': true, 'bookmark': createdRecord};
  }

  Future<Map<String, dynamic>> moveBookmark(String userId, String verseKey, String? collectionId) async {
    final favouritesId = collectionId == null ? (await getOrCreateFavourites(userId)).id : null;
    final ref = _bookmarksRef(userId).doc(verseKey);
    final collectionRef = collectionId != null ? _collectionsRef(userId).doc(collectionId) : null;

    final result = await _db.runTransaction((tx) async {
      String targetCollectionId;
      if (collectionRef != null) {
        final collectionSnap = await tx.get(collectionRef);
        if (!collectionSnap.exists) {
          return {'ok': false, 'error': 'collection-not-found'};
        }
        targetCollectionId = collectionId!;
      } else {
        targetCollectionId = favouritesId!;
      }

      final snap = await tx.get(ref);
      if (!snap.exists) return {'ok': false, 'error': 'not-found'};
      
      final data = snap.data() as Map<String, dynamic>;
      final previousCollectionId = data['collectionId'] as String;
      
      if (previousCollectionId == targetCollectionId) {
        return {'ok': true, 'moved': false};
      }

      tx.update(ref, {'collectionId': targetCollectionId});
      return {
        'ok': true,
        'moved': true,
        'previousCollectionId': previousCollectionId,
        'targetCollectionId': targetCollectionId
      };
    });

    if (result['ok'] != true) return result;
    
    if (result['moved'] == true) {
      await Future.wait([
        _adjustBookmarkCount(userId, result['previousCollectionId'] as String, -1),
        _adjustBookmarkCount(userId, result['targetCollectionId'] as String, 1),
      ]);
    }

    final updated = await getBookmark(userId, verseKey);
    return {'ok': true, 'bookmark': updated};
  }

  Future<bool> deleteBookmark(String userId, String verseKey) async {
    final ref = _bookmarksRef(userId).doc(verseKey);

    final collectionId = await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      if (!snap.exists) return null;
      tx.delete(ref);
      final data = snap.data() as Map<String, dynamic>;
      return data['collectionId'] as String?;
    });

    if (collectionId == null) return false;
    await _adjustBookmarkCount(userId, collectionId, -1);
    return true;
  }
}
