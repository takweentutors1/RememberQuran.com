import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart' hide TextDirection;
import '../controllers/notes_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/note.dart';

import '../../../shared/widgets/loading_skeleton.dart';
import '../../../shared/widgets/app_dialog.dart';
import '../../../core/utils/responsive_layout.dart';

class NotesView extends GetView<NotesController> {
  const NotesView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'My Notes',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(70),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
            child: TextField(
              controller: controller.searchController,
              decoration: InputDecoration(
                hintText: 'Search notes...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor:
                    theme.extension<NurColorsExtension>()?.surfaceSunk ??
                    (isDark ? AppColors.darkCard : AppColors.lightCard),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.1),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.1),
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
            ),
          ),
        ),
      ),
      body: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Obx(() {
            if (controller.isLoading.value && controller.allNotes.isEmpty) {
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: 4,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, __) => AppShimmer.card(height: 100),
              );
            }

            if (controller.allNotes.isEmpty) {
              return _buildEmptyState(
                theme,
                'You haven\'t added any notes yet.\nAdd notes while reading to see them here.',
              );
            }

            if (controller.filteredNotes.isEmpty) {
              return _buildEmptyState(
                theme,
                'No notes found for "${controller.searchController.text}".',
              );
            }

            return RefreshIndicator(
              onRefresh: controller.refreshNotes,
              child: _buildNotesList(context, controller.filteredNotes, isDark),
            );
          }),
        ),
      ),
    );
  }

  /// Notes vary a lot in height (verse length, whether a translation is
  /// cached yet, note length) — a fixed-height GridView would either clip
  /// long notes or waste space on short ones. Above 1 column, this
  /// round-robins notes into independent-height columns instead (no
  /// staggered-grid package needed for something this simple).
  Widget _buildNotesList(BuildContext context, List<Note> notes, bool isDark) {
    final columns = context.gridColumns;
    if (columns <= 1) {
      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notes.length,
        itemBuilder: (context, index) =>
            _buildNoteCard(notes[index], context, isDark),
      );
    }

    final buckets = List.generate(columns, (_) => <Note>[]);
    for (var i = 0; i < notes.length; i++) {
      buckets[i % columns].add(notes[i]);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final bucket in buckets)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                // _buildNoteCard's Dismissible child already carries its own
                // bottom margin — no extra spacing needed between rows here.
                child: Column(
                  children: [
                    for (final note in bucket)
                      _buildNoteCard(note, context, isDark),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.edit_note_rounded,
              size: 80,
              color: theme.colorScheme.primary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoteCard(Note note, BuildContext context, bool isDark) {
    final theme = Theme.of(context);
    final formattedDate = DateFormat.yMMMd().add_jm().format(note.updatedAt);

    return Dismissible(
      key: Key(note.verseKey),
      direction: DismissDirection.endToStart,
      confirmDismiss: (direction) => AppDialog.confirm(
        context,
        title: 'Delete note',
        message: 'This note will be permanently deleted.',
        confirmLabel: 'Delete',
        isDestructive: true,
      ),
      onDismissed: (_) {
        controller.deleteNote(note.verseKey);
      },
      background: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: theme.colorScheme.error,
          borderRadius: BorderRadius.circular(16),
        ),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete_outline, color: Colors.white, size: 30),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        width: double.infinity,
        decoration: BoxDecoration(
          color:
              theme.extension<NurColorsExtension>()?.surfaceSunk ??
              theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _formatVerseKey(note.verseKey),
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ),
                Text(
                  formattedDate,
                  style: TextStyle(
                    color: theme.colorScheme.onSurface.withOpacity(0.4),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Obx(() {
              final verse = controller.verseCache[note.verseKey];
              final translation = controller.translationCache[note.verseKey];
              if (verse == null) return const SizedBox.shrink();

              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    verse.textUthmani,
                    textAlign: TextAlign.right,
                    textDirection: TextDirection.rtl,
                    style: TextStyle(
                      fontFamily: 'Uthmani',
                      fontSize: 20,
                      height: 1.6,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  if (translation != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      translation,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(
                          alpha: 0.7,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Divider(
                    color: theme.colorScheme.outline.withValues(alpha: 0.1),
                  ),
                  const SizedBox(height: 12),
                ],
              );
            }),
            Text(
              note.text,
              style: theme.textTheme.bodyMedium?.copyWith(height: 1.5),
            ),
          ],
        ),
      ),
    );
  }

  String _formatVerseKey(String key) {
    // Expected format "surahId:ayahId"
    final parts = key.split(':');
    if (parts.length == 2) {
      return 'Surah ${parts[0]}, Ayah ${parts[1]}';
    }
    return key;
  }
}
