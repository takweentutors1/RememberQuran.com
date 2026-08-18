import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../shared/widgets/loading_skeleton.dart';
import '../../../account/controllers/notes_controller.dart';
import '../../../../data/models/note.dart';
import '../../../../core/theme/app_colors.dart';

class NoteSheet extends StatefulWidget {
  final int chapterId;
  final int verseNumber;

  const NoteSheet({
    super.key,
    required this.chapterId,
    required this.verseNumber,
  });

  static void show(BuildContext context, int chapterId, int verseNumber) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => NoteSheet(
        chapterId: chapterId,
        verseNumber: verseNumber,
      ),
    );
  }

  @override
  State<NoteSheet> createState() => _NoteSheetState();
}

class _NoteSheetState extends State<NoteSheet> {
  final NotesController _notesController = Get.find<NotesController>();
  final TextEditingController _textController = TextEditingController();
  
  bool _isLoading = true;
  bool _isSaving = false;
  String _verseKey = '';

  @override
  void initState() {
    super.initState();
    _verseKey = '${widget.chapterId}:${widget.verseNumber}';
    _loadExistingNote();
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _loadExistingNote() async {
    final note = await _notesController.getNote(_verseKey);
    if (mounted) {
      setState(() {
        if (note != null) {
          _textController.text = note.text;
        }
        _isLoading = false;
      });
    }
  }

  Future<void> _saveNote() async {
    final text = _textController.text.trim();
    if (text.isEmpty) {
      Get.back(); // Nothing to save
      return;
    }

    setState(() {
      _isSaving = true;
    });

    final outcome = await _notesController.saveNote(_verseKey, text);
    
    if (mounted) {
      setState(() {
        _isSaving = false;
      });
      
      if (outcome['ok'] == true) {
        Get.back();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Your reflection has been safely stored.')),
        );
      } else {
        final error = outcome['error'] == 'limit-reached' 
            ? 'Note limit reached. Please delete some notes before adding more.'
            : 'Failed to save note. Please try again.';
        final displayError = error.contains('limit') ? error : 'We couldn\'t save your reflection. Please check your connection and try again.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(displayError), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    
    return Container(
      decoration: BoxDecoration(
        color: nurColors?.surfaceSunk ?? theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        top: 24,
        left: 24,
        right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Note for Quran $_verseKey',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                tooltip: 'Close',
                onPressed: () => Get.back(),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          if (_isLoading)
            const AppShimmer(
              child: SizedBox(
                height: 120,
                width: double.infinity,
                child: DecoratedBox(decoration: BoxDecoration(color: Colors.white)),
              ),
            )
          else
            TextField(
              controller: _textController,
              autofocus: true,
              maxLines: 6,
              minLines: 3,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _saveNote(),
              decoration: InputDecoration(
                hintText: 'Type your reflections or notes here...',
                filled: true,
                fillColor: theme.colorScheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: theme.colorScheme.outline.withValues(alpha: 0.1)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: theme.colorScheme.outline.withValues(alpha: 0.1)),
                ),
              ),
            ),
            
          const SizedBox(height: 24),
          
          ElevatedButton(
            onPressed: _isSaving ? null : _saveNote,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: nurColors?.brandGold ?? theme.colorScheme.primary,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: _isSaving 
                ? const SizedBox(
                    width: 24, 
                    height: 24, 
                    child: CircularProgressIndicator(strokeWidth: 2)
                  )
                : const Text(
                    'Save Note',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
          ),
        ],
      ),
    );
  }
}
