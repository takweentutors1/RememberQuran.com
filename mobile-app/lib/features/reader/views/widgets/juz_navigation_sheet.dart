import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/models/juz_data.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../data/repositories/quran_repository.dart';

/// Bottom sheet allowing navigation by 30 Ajza' or 60 Ahzab.
class JuzNavigationSheet extends StatefulWidget {
  final int? currentChapterId;

  const JuzNavigationSheet({super.key, this.currentChapterId});

  static void show(BuildContext context, {int? currentChapterId}) {
    showResponsiveSheet(
      context: context,
      builder: (_) => JuzNavigationSheet(currentChapterId: currentChapterId),
    );
  }

  @override
  State<JuzNavigationSheet> createState() => _JuzNavigationSheetState();
}

class _JuzNavigationSheetState extends State<JuzNavigationSheet> {
  final QuranRepository _quranRepo = Get.find<QuranRepository>();
  int _activeTab = 0; // 0 = 30 Juz, 1 = 60 Hizb
  List<Chapter> _chapters = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChapters();
  }

  Future<void> _loadChapters() async {
    try {
      final list = await _quranRepo.getChapters();
      if (mounted) {
        setState(() {
          _chapters = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _getSurahName(int surahId) {
    if (surahId < 1 || surahId > _chapters.length) return 'Surah $surahId';
    return _chapters[surahId - 1].nameSimple;
  }

  void _navigateToVerse(int surahId, int ayahId) {
    Navigator.pop(context);
    Get.toNamed(
      Routes.SURAH_AYAH,
      arguments: {
        'surahId': surahId,
        'ayahId': ayahId,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.8,
      ),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.outline.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: [
                  Expanded(
                    child: SegmentedButton<int>(
                      segments: const [
                        ButtonSegment<int>(
                          value: 0,
                          label: Text('30 Ajza\''),
                        ),
                        ButtonSegment<int>(
                          value: 1,
                          label: Text('60 Ahzab'),
                        ),
                      ],
                      selected: {_activeTab},
                      onSelectionChanged: (set) {
                        setState(() => _activeTab = set.first);
                      },
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _activeTab == 0
                      ? _buildJuzList(theme, brandGold)
                      : _buildHizbList(theme, brandGold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJuzList(ThemeData theme, Color brandGold) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: kJuzDefinitions.length,
      separatorBuilder: (context, index) => const Divider(height: 1, indent: 56),
      itemBuilder: (context, index) {
        final j = kJuzDefinitions[index];
        final startName = _getSurahName(j.startSurah);
        final endName = _getSurahName(j.endSurah);
        final verseCount = countAyahsInJuz(j);
        final isSelected = widget.currentChapterId != null &&
            widget.currentChapterId! >= j.startSurah &&
            widget.currentChapterId! <= j.endSurah;

        return ListTile(
          leading: Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isSelected
                  ? brandGold.withValues(alpha: 0.2)
                  : theme.colorScheme.surfaceContainerHighest,
              shape: BoxShape.circle,
              border: isSelected ? Border.all(color: brandGold, width: 1.5) : null,
            ),
            child: Text(
              '${j.juz}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color: isSelected ? brandGold : null,
              ),
            ),
          ),
          title: Text(
            'Juz ${j.juz}',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: isSelected ? brandGold : null,
            ),
          ),
          subtitle: Text(
            '$startName ${j.startAyah} – $endName ${j.endAyah} • $verseCount ayat',
            style: theme.textTheme.bodySmall,
          ),
          trailing: Text(
            j.nameArabic,
            style: const TextStyle(
              fontFamily: 'Amiri',
              fontSize: 16,
              color: Colors.grey,
            ),
          ),
          onTap: () => _navigateToVerse(j.startSurah, j.startAyah),
        );
      },
    );
  }

  Widget _buildHizbList(ThemeData theme, Color brandGold) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: kHizbDefinitions.length,
      separatorBuilder: (context, index) => const Divider(height: 1, indent: 56),
      itemBuilder: (context, index) {
        final h = kHizbDefinitions[index];
        final startName = _getSurahName(h.startSurah);
        final isSelected = widget.currentChapterId == h.startSurah;

        return ListTile(
          leading: Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isSelected
                  ? brandGold.withValues(alpha: 0.2)
                  : theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
              border: isSelected ? Border.all(color: brandGold, width: 1.5) : null,
            ),
            child: Text(
              '${h.hizb}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color: isSelected ? brandGold : null,
              ),
            ),
          ),
          title: Text(
            'Hizb ${h.hizb} (Juz ${h.correspondingJuz})',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: isSelected ? brandGold : null,
            ),
          ),
          subtitle: Text(
            '$startName, Ayah ${h.startAyah}',
            style: theme.textTheme.bodySmall,
          ),
          trailing: Text(
            h.nameArabic,
            style: const TextStyle(
              fontFamily: 'Amiri',
              fontSize: 15,
              color: Colors.grey,
            ),
          ),
          onTap: () => _navigateToVerse(h.startSurah, h.startAyah),
        );
      },
    );
  }
}
