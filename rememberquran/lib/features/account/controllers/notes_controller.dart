import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/note.dart';
import '../../../data/repositories/notes_repository.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import 'auth_controller.dart';

class NotesController extends GetxController {
  final NotesRepository _notesRepository = NotesRepository();
  final QuranRepository _quranRepository = Get.find<QuranRepository>();
  final AuthController _authController = Get.find<AuthController>();

  final RxList<Note> allNotes = <Note>[].obs;
  final RxList<Note> filteredNotes = <Note>[].obs;
  
  final RxMap<String, Verse> verseCache = <String, Verse>{}.obs;
  final RxMap<String, String> translationCache = <String, String>{}.obs;

  final RxBool isLoading = false.obs;
  
  final TextEditingController searchController = TextEditingController();

  StreamSubscription? _authSubscription;

  @override
  void onInit() {
    super.onInit();
    _loadNotes();
    
    // Refresh notes if user changes
    _authSubscription = _authController.firebaseUser.listen((user) {
      _loadNotes();
    });
    
    searchController.addListener(() {
      _filterNotes(searchController.text);
    });
  }
  
  @override
  void onClose() {
    _authSubscription?.cancel();
    searchController.dispose();
    super.onClose();
  }

  Future<void> _loadNotes() async {
    final userId = _authController.firebaseUser.value?.uid;
    if (userId == null) {
      allNotes.clear();
      filteredNotes.clear();
      return;
    }

    isLoading.value = true;
    try {
      final notes = await _notesRepository.listNotes(userId);
      allNotes.assignAll(notes);
      _filterNotes(searchController.text);
      
      for (final note in notes) {
        _loadVerseData(note.verseKey);
      }
    } catch (e) {
      debugPrint('Error loading notes: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _loadVerseData(String verseKey) async {
    if (verseCache.containsKey(verseKey)) return;
    
    final parts = verseKey.split(':');
    if (parts.length != 2) return;
    
    final chapterId = int.tryParse(parts[0]);
    final verseNumber = int.tryParse(parts[1]);
    if (chapterId == null || verseNumber == null) return;
    
    try {
      final verse = await _quranRepository.getVerse(chapterId, verseNumber);
      if (verse != null) {
        verseCache[verseKey] = verse;
        final translations = await _quranRepository.getVerseTranslations(verse.id);
        if (translations.isNotEmpty) {
          translationCache[verseKey] = translations.first.translationText;
        }
      }
    } catch (e) {
      debugPrint('Error fetching verse data: $e');
    }
  }

  void _filterNotes(String query) {
    if (query.isEmpty) {
      filteredNotes.assignAll(allNotes);
      return;
    }
    
    final lowerQuery = query.toLowerCase();
    final results = allNotes.where((note) {
      return note.text.toLowerCase().contains(lowerQuery) || 
             note.verseKey.toLowerCase().contains(lowerQuery);
    }).toList();
    
    filteredNotes.assignAll(results);
  }

  Future<void> refreshNotes() async {
    await _loadNotes();
  }

  Future<void> deleteNote(String verseKey) async {
    final userId = _authController.firebaseUser.value?.uid;
    if (userId == null) return;

    // Optimistically remove from UI
    final noteToRemove = allNotes.firstWhereOrNull((n) => n.verseKey == verseKey);
    if (noteToRemove != null) {
      allNotes.remove(noteToRemove);
      _filterNotes(searchController.text);
    }

    try {
      await _notesRepository.deleteNote(userId, verseKey);
    } catch (e) {
      debugPrint('Error deleting note: $e');
      // Revert on failure
      if (noteToRemove != null) {
        allNotes.add(noteToRemove);
        allNotes.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
        _filterNotes(searchController.text);
      }
      Get.snackbar('Error', 'Failed to delete note');
    }
  }
}
