import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_pages.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/models/translation.dart';
import '../../../../data/repositories/quran_repository.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../core/utils/responsive_layout.dart';

class QuickJumpSheet extends StatefulWidget {
  final int? currentChapterId;

  const QuickJumpSheet({super.key, this.currentChapterId});

  static void show(BuildContext context, {int? currentChapterId}) {
    showResponsiveSheet(
      context: context,
      builder: (context) => QuickJumpSheet(currentChapterId: currentChapterId),
    );
  }

  @override
  State<QuickJumpSheet> createState() => _QuickJumpSheetState();
}

class _QuickJumpSheetState extends State<QuickJumpSheet> {
  final QuranRepository _quranRepo = Get.find<QuranRepository>();
  final TextEditingController _searchController = TextEditingController();

  List<Chapter> _allChapters = [];
  List<Chapter> _filteredChapters = [];
  bool _isLoading = true;

  // 0 = Surah selection, 1 = Ayah selection
  int _step = 0;
  Chapter? _selectedChapter;

  // Direct jump match (e.g. 2:255)
  String? _directJumpKey;

  @override
  void initState() {
    super.initState();
    _loadChapters();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadChapters() async {
    try {
      final chapters = await _quranRepo.getChapters();
      if (mounted) {
        setState(() {
          _allChapters = chapters;
          _filteredChapters = chapters;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _onSearchChanged() {
    final query = _searchController.text.trim().toLowerCase();

    if (query.isEmpty) {
      setState(() {
        _filteredChapters = _allChapters;
        _directJumpKey = null;
      });
      return;
    }

    // Check for "surah:ayah" format (e.g. 2:255)
    final directJumpMatch = RegExp(r'^(\d+):(\d+)$').firstMatch(query);
    if (directJumpMatch != null) {
      final surahId = int.tryParse(directJumpMatch.group(1) ?? '');
      final ayahId = int.tryParse(directJumpMatch.group(2) ?? '');

      if (surahId != null && surahId >= 1 && surahId <= 114) {
        final chapter = _allChapters.firstWhereOrNull((c) => c.id == surahId);
        if (chapter != null &&
            ayahId != null &&
            ayahId >= 1 &&
            ayahId <= chapter.versesCount) {
          setState(() {
            _directJumpKey = '$surahId:$ayahId';
            _filteredChapters = []; // Hide surahs when valid jump is found
          });
          return;
        }
      }
    }

    setState(() {
      _directJumpKey = null;
      _filteredChapters = _allChapters.where((c) {
        return c.id.toString() == query ||
            c.nameSimple.toLowerCase().contains(query) ||
            c.nameArabic.toLowerCase().contains(query);
      }).toList();
    });
  }

  void _jumpTo(int chapterId, int ayahId) {
    Get.back(); // close sheet
    if (widget.currentChapterId == chapterId) {
      // We are already on this Surah, just update the route parameter
      // and the controller will handle scrolling.
      Get.offNamed(
        Routes.SURAH_AYAH
            .replaceAll(':surahId', chapterId.toString())
            .replaceAll(':ayahId', ayahId.toString()),
        preventDuplicates: false,
      );
    } else {
      // We need to navigate to a new Surah
      Get.toNamed(
        Routes.SURAH_AYAH
            .replaceAll(':surahId', chapterId.toString())
            .replaceAll(':ayahId', ayahId.toString()),
        preventDuplicates: false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final height = MediaQuery.of(context).size.height * 0.85;

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle bar
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.dividerColor.withOpacity(0.5),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
            child: Row(
              children: [
                if (_step == 1)
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    tooltip: 'Back',
                    onPressed: () {
                      setState(() {
                        _step = 0;
                        _selectedChapter = null;
                      });
                    },
                  ),
                Expanded(
                  child: Text(
                    _step == 0 ? 'Choose a Surah' : 'Choose an Ayah',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Close',
                  onPressed: () => Get.back(),
                ),
              ],
            ),
          ),

          if (_step == 0)
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8.0,
              ),
              child: TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Surah name, number, or 2:255...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: theme.cardColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),

          if (_isLoading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else
            Expanded(
              child: _step == 0
                  ? _buildSurahList(theme)
                  : _buildAyahGrid(theme),
            ),
        ],
      ),
    );
  }

  Widget _buildSurahList(ThemeData theme) {
    if (_directJumpKey != null) {
      final parts = _directJumpKey!.split(':');
      final cId = int.parse(parts[0]);
      final aId = int.parse(parts[1]);

      return ListTile(
        leading: CircleAvatar(
          backgroundColor: theme.colorScheme.primaryContainer,
          child: Icon(Icons.flash_on, color: theme.colorScheme.primary),
        ),
        title: Text(
          'Jump directly to $_directJumpKey',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Tap to navigate'),
        onTap: () => _jumpTo(cId, aId),
      );
    }

    if (_filteredChapters.isEmpty) {
      return const Center(child: Text('No matches found.'));
    }

    return ListView.builder(
      itemCount: _filteredChapters.length,
      itemBuilder: (context, index) {
        final chapter = _filteredChapters[index];
        return ListTile(
          leading: Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${chapter.id}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          title: Text(chapter.nameSimple),
          subtitle: Text('${chapter.versesCount} ayahs'),
          trailing: Text(
            chapter.nameArabic,
            style: TextStyle(
              fontFamily: 'Uthmani',
              fontSize: context.responsiveBaseTextSize,
            ),
          ),
          onTap: () {
            setState(() {
              _selectedChapter = chapter;
              _step = 1;
              _searchController.clear();
            });
          },
        );
      },
    );
  }

  Widget _buildAyahGrid(ThemeData theme) {
    if (_selectedChapter == null) return const SizedBox.shrink();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            '${_selectedChapter!.nameSimple} has ${_selectedChapter!.versesCount} ayahs.',
            style: theme.textTheme.bodyMedium,
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 5,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1,
            ),
            itemCount: _selectedChapter!.versesCount,
            itemBuilder: (context, index) {
              final ayahId = index + 1;
              return InkWell(
                onTap: () => _jumpTo(_selectedChapter!.id, ayahId),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$ayahId',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
