import 'dart:async';
import 'package:get/get.dart';
import 'package:flutter/material.dart';
import '../../../data/models/bookmark.dart';
import '../../../data/models/note.dart';
import '../../../data/repositories/bookmarks_repository.dart';
import '../../../data/repositories/notes_repository.dart';
import 'auth_controller.dart';

class BookmarksController extends GetxController with GetSingleTickerProviderStateMixin {
  final AuthController _auth = Get.find<AuthController>();
  late BookmarksRepository _bookmarksRepo;
  late NotesRepository _notesRepo;

  late TabController tabController;
  final RxInt tabIndex = 0.obs;

  final RxList<BookmarkCollection> collections = <BookmarkCollection>[].obs;
  final RxList<Note> notes = <Note>[].obs;
  
  // State for a specific collection view
  final RxList<Bookmark> currentCollectionBookmarks = <Bookmark>[].obs;
  final Rxn<BookmarkCollection> currentCollection = Rxn<BookmarkCollection>();

  final isLoading = false.obs;
  final isLoadingBookmarks = false.obs;

  StreamSubscription? _authSubscription;

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(length: 2, vsync: this);
    tabController.addListener(() {
      tabIndex.value = tabController.index;
    });
    _bookmarksRepo = BookmarksRepository();
    _notesRepo = NotesRepository();

    if (_auth.firebaseUser.value != null) {
      loadCollections();
      loadNotes();
    }

    // Without this, a controller instance that survives a logout (e.g. it
    // isn't disposed by GetX's binding lifecycle on every navigation path)
    // keeps showing the previous user's collections/notes/bookmarks until
    // something else forces a rebuild. Mirrors NotesController's listener.
    _authSubscription = _auth.firebaseUser.listen((user) {
      if (user == null) {
        collections.clear();
        notes.clear();
        currentCollectionBookmarks.clear();
        currentCollection.value = null;
        return;
      }
      loadCollections();
      loadNotes();
      if (currentCollection.value != null) {
        loadBookmarksForCollection(currentCollection.value!.id);
      }
    });
  }

  @override
  void onClose() {
    _authSubscription?.cancel();
    tabController.dispose();
    super.onClose();
  }

  Future<void> loadCollections() async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;
    
    isLoading.value = true;
    try {
      final res = await _bookmarksRepo.listCollections(userId);
      collections.assignAll(res);
    } catch (e) {
      print('Error loading collections: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadNotes() async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;
    
    isLoading.value = true;
    try {
      final res = await _notesRepo.listNotes(userId);
      notes.assignAll(res);
    } catch (e) {
      print('Error loading notes: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadBookmarksForCollection(String collectionId) async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;

    isLoadingBookmarks.value = true;
    try {
      final coll = await _bookmarksRepo.getCollection(userId, collectionId);
      currentCollection.value = coll;

      final res = await _bookmarksRepo.listBookmarks(userId, collectionId: collectionId);
      currentCollectionBookmarks.assignAll(res);
    } catch (e) {
      print('Error loading bookmarks for collection: $e');
    } finally {
      isLoadingBookmarks.value = false;
    }
  }

  Future<void> createCollection(String name) async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;
    
    final res = await _bookmarksRepo.createCollection(userId, name);
    if (res['ok'] == true) {
      await loadCollections();
    } else {
      Get.snackbar('Error', 'We couldn\'t create this collection. Please try again: ${res['error']}');
    }
  }

  Future<void> deleteCollection(String id) async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;

    final res = await _bookmarksRepo.deleteCollection(userId, id);
    if (res['ok'] == true) {
      await loadCollections();
      Get.snackbar('Success', 'Collection removed. Its bookmarks have been moved to Favourites.');
    } else {
      Get.snackbar('Error', 'We couldn\'t delete this collection. Please try again: ${res['error']}');
    }
  }

  Future<void> renameCollection(String id, String newName) async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;

    final res = await _bookmarksRepo.renameCollection(userId, id, newName);
    if (res['ok'] == true) {
      await loadCollections();
      // If we are currently viewing this collection, refresh it
      if (currentCollection.value?.id == id) {
        await loadBookmarksForCollection(id);
      }
    } else {
      Get.snackbar('Error', 'We couldn\'t update the collection name. Please try again: ${res['error']}');
    }
  }

  Future<void> deleteBookmark(String verseKey) async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;

    final success = await _bookmarksRepo.deleteBookmark(userId, verseKey);
    if (success) {
      // Reload current list
      if (currentCollection.value != null) {
        await loadBookmarksForCollection(currentCollection.value!.id);
      }
      await loadCollections(); // To update counts
    } else {
      Get.snackbar('Error', 'We couldn\'t remove this bookmark. Please try again.');
    }
  }

  Future<void> deleteNote(String verseKey) async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;

    try {
      await _notesRepo.deleteNote(userId, verseKey);
      await loadNotes();
    } catch (e) {
      Get.snackbar('Error', 'Unable to remove this note. Please try again.');
    }
  }
}
