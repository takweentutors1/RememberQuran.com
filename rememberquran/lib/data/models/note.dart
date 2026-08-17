import 'package:cloud_firestore/cloud_firestore.dart';

class Note {
  final String verseKey;
  final String text;
  final DateTime createdAt;
  final DateTime updatedAt;

  Note({
    required this.verseKey,
    required this.text,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Note.fromSnapshot(DocumentSnapshot snap) {
    final data = snap.data() as Map<String, dynamic>? ?? {};
    return Note(
      verseKey: snap.id,
      text: data['text'] as String? ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.fromMillisecondsSinceEpoch(0),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.fromMillisecondsSinceEpoch(0),
    );
  }
}
