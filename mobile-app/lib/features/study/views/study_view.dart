import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../shared/controllers/app_scaffold_controller.dart';
import 'widgets/surah_picker_sheet.dart';
import 'widgets/ayah_picker_sheet.dart';

class StudyView extends StatelessWidget {
  const StudyView({Key? key}) : super(key: key);

  void _goBack() {
    final controller = Get.find<AppScaffoldController>();
    controller.setTabIndex(0);
  }

  Future<void> _openTafsir(BuildContext context) async {
    final chapter = await SurahPickerSheet.show(context);
    if (chapter == null || !context.mounted) return;

    final ayahNumber = await AyahPickerSheet.show(context, chapter);
    if (ayahNumber == null) return;

    Get.toNamed('/surah/${chapter.id}?ayahId=$ayahNumber&openTafsir=true');
  }

  Future<void> _openAsbab(BuildContext context) async {
    final chapter = await SurahPickerSheet.show(context);
    if (chapter == null || !context.mounted) return;

    final ayahNumber = await AyahPickerSheet.show(context, chapter);
    if (ayahNumber == null) return;

    Get.toNamed('/surah/${chapter.id}?ayahId=$ayahNumber&openAsbab=true');
  }

  Future<void> _openWordByWord(BuildContext context) async {
    final chapter = await SurahPickerSheet.show(context);
    if (chapter == null) return;

    Get.toNamed('/surah/${chapter.id}?displayMode=reading');
  }

  @override
  Widget build(BuildContext context) {
    // No PopScope here: this view is a permanently-mounted child of
    // AppScaffold's IndexedStack (all tabs stay alive, not just the
    // selected one), and all tabs share a single route. A PopScope on any
    // one of them would register with that shared route and block system
    // back navigation for every tab, not just this one. The explicit
    // AppBar back button below is enough for in-tab "back to Home".
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Back to Home',
          onPressed: _goBack,
        ),
        title: const Text('Study'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStudyCard(
              context,
              title: 'Tafsir',
              description:
                  'Exegesis and commentary on Quranic verses. Select a surah and ayah to read tafsir.',
              icon: Icons.menu_book_outlined,
              onTap: () => _openTafsir(context),
            ),
            const SizedBox(height: 16),
            _buildStudyCard(
              context,
              title: 'Asbab al-Nuzul',
              description:
                  'Reasons for revelation of Quranic verses. Select a surah and ayah to explore.',
              icon: Icons.history_edu,
              onTap: () => _openAsbab(context),
            ),
            const SizedBox(height: 16),
            _buildStudyCard(
              context,
              title: 'Word by Word',
              description:
                  'Explore Arabic word meanings and grammar. Select a surah to start reading.',
              icon: Icons.translate,
              onTap: () => _openWordByWord(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudyCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.colorScheme.outlineVariant),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: theme.colorScheme.primary, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: theme.colorScheme.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }
}
