import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/note.dart';

class NotesRepository {
  final FirebaseFirestore _db;
  
  static const int MAX_NOTES = 2000;

  NotesRepository({FirebaseFirestore? db}) : _db = db ?? FirebaseFirestore.instance;

  CollectionReference _notesRef(String userId) {
    return _db.collection('users').doc(userId).collection('notes');
  }

  Future<int> countNotes(String userId) async {
    final snap = await _notesRef(userId).count().get();
    return snap.count ?? 0;
  }

  Future<Note?> getNote(String userId, String verseKey) async {
    final snap = await _notesRef(userId).doc(verseKey).get();
    if (!snap.exists) return null;
    return Note.fromSnapshot(snap);
  }

  Future<List<Note>> listNotes(String userId, {int? surahPrefix}) async {
    Query query = _notesRef(userId);

    if (surahPrefix != null) {
      final prefix = '$surahPrefix:';
      query = query.orderBy(FieldPath.documentId)
          .startAt([prefix])
          .endAt(['$prefix\uf8ff']);
      final snap = await query.limit(MAX_NOTES).get();
      return snap.docs.map((d) => Note.fromSnapshot(d)).toList();
    }

    final snap = await query.orderBy('updatedAt', descending: true).limit(MAX_NOTES).get();
    return snap.docs.map((d) => Note.fromSnapshot(d)).toList();
  }

  Future<Map<String, dynamic>> saveNote(String userId, String verseKey, String text) async {
    final ref = _notesRef(userId).doc(verseKey);

    // Best-effort pre-check — a count() aggregate can't be read inside a
    // Firestore transaction (only individual documents can), so this only
    // guards the common case, not a simultaneous race creating two notes.
    final countSnap = await _notesRef(userId).count().get();
    final atLimit = (countSnap.count ?? 0) >= MAX_NOTES;

    final outcome = await _db.runTransaction((tx) async {
      final existing = await tx.get(ref);

      if (!existing.exists && atLimit) {
        return {'ok': false, 'error': 'limit-reached'};
      }

      final now = FieldValue.serverTimestamp();
      final updateData = <String, dynamic>{
        'text': text,
        'updatedAt': now,
      };
      
      if (!existing.exists) {
        updateData['createdAt'] = now;
      }

      tx.set(ref, updateData, SetOptions(merge: true));
      return {'ok': true};
    });

    if (outcome['ok'] != true) return outcome;
    
    final saved = await getNote(userId, verseKey);
    return {'ok': true, 'note': saved};
  }

  Future<void> deleteNote(String userId, String verseKey) async {
    await _notesRef(userId).doc(verseKey).delete();
  }
}
