import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/reader_controller.dart';
import '../../controllers/reader_settings_controller.dart';
import '../../../audio/controllers/audio_controller.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../core/theme/app_colors.dart';
import 'arabic_word.dart';

/// Renders Quran verses grouped by their physical Mushaf page number in a
/// page-flipping [PageView], synchronised with audio playback and settings.
class MushafPageView extends StatefulWidget {
  const MushafPageView({super.key});

  @override
  State<MushafPageView> createState() => _MushafPageViewState();
}

class _MushafPageViewState extends State<MushafPageView> {
  late final ReaderController _readerController;
  late final AudioController _audioController;
  late final PageController _pageController;

  Worker? _audioWorker;
  List<int> _pageNumbers = [];
  final Map<int, List<Verse>> _pageMap = {};
  int _currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    _readerController = Get.find<ReaderController>();
    _audioController = Get.find<AudioController>();

    _computePages();

    // Determine initial page index from the first verse or active verse
    int initialPage = 0;
    final activeKey = _audioController.rxActiveVerseKey.value;
    if (activeKey != null && activeKey.isNotEmpty) {
      final activeVerse = _readerController.verses.firstWhereOrNull(
        (v) => v.verseKey == activeKey,
      );
      if (activeVerse != null) {
        final idx = _pageNumbers.indexOf(activeVerse.pageNumber);
        if (idx != -1) initialPage = idx;
      }
    }
    _currentPageIndex = initialPage;
    _pageController = PageController(initialPage: initialPage);

    // Synchronise page when audio playback moves to an ayah on another page
    _audioWorker = ever(_audioController.rxActiveVerseKey, (verseKey) {
      if (verseKey == null || verseKey.isEmpty || !mounted) return;
      final verse = _readerController.verses.firstWhereOrNull(
        (v) => v.verseKey == verseKey,
      );
      if (verse != null) {
        final targetIndex = _pageNumbers.indexOf(verse.pageNumber);
        if (targetIndex != -1 &&
            _pageController.hasClients &&
            _currentPageIndex != targetIndex) {
          _pageController.animateToPage(
            targetIndex,
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeInOut,
          );
        }
      }
    });
  }

  void _computePages() {
    _pageMap.clear();
    for (final v in _readerController.verses) {
      _pageMap.putIfAbsent(v.pageNumber, () => []).add(v);
    }
    _pageNumbers = _pageMap.keys.toList()..sort();
  }

  @override
  void dispose() {
    _audioWorker?.dispose();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      _computePages();
      if (_pageNumbers.isEmpty) {
        return const Center(child: Text('No pages available for this surah'));
      }

      final theme = Theme.of(context);
      final nurColors = theme.extension<NurColorsExtension>();

      // Render RTL page-flipping natural for physical Mushafs
      return Directionality(
        textDirection: TextDirection.rtl,
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _pageNumbers.length,
                onPageChanged: (index) {
                  setState(() {
                    _currentPageIndex = index;
                  });
                },
                itemBuilder: (context, index) {
                  final pageNum = _pageNumbers[index];
                  final pageVerses = _pageMap[pageNum] ?? [];

                  return _buildMushafPage(
                    context,
                    theme,
                    nurColors,
                    pageNum,
                    pageVerses,
                  );
                },
              ),
            ),
            _buildPageIndicator(context, theme, nurColors),
          ],
        ),
      );
    });
  }

  Widget _buildMushafPage(
    BuildContext context,
    ThemeData theme,
    NurColorsExtension? nurColors,
    int pageNumber,
    List<Verse> verses,
  ) {
    final gold = nurColors?.brandGold ?? theme.colorScheme.primary;
    final firstVerse = verses.isNotEmpty ? verses.first : null;
    final juzNumber = firstVerse?.juzNumber ?? 1;
    final surahName = _readerController.chapter.value?.nameSimple ?? '';

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 760),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(16.0),
            border: Border.all(
              color: gold.withValues(alpha: 0.35),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              // Mushaf Page Header
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20.0,
                  vertical: 12.0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Juz $juzNumber',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: gold,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      surahName,
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: gold,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Page $pageNumber',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: gold,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Divider(
                height: 1,
                color: gold.withValues(alpha: 0.2),
              ),
              // Page Content (Continuous Flow of Verses)
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20.0,
                    vertical: 16.0,
                  ),
                  child: Directionality(
                    textDirection: TextDirection.rtl,
                    child: Wrap(
                      spacing: 4.0,
                      runSpacing: 12.0,
                      alignment: WrapAlignment.start,
                      children: _buildPageTokens(theme, nurColors, verses),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _buildPageTokens(
    ThemeData theme,
    NurColorsExtension? nurColors,
    List<Verse> verses,
  ) {
    final List<Widget> tokens = [];
    final gold = nurColors?.brandGold ?? theme.colorScheme.primary;

    for (final verse in verses) {
      final words = _readerController.verseWords[verse.id] ?? [];
      final isVerseActive =
          _audioController.rxActiveVerseKey.value == verse.verseKey;

      for (final w in words) {
        tokens.add(
          Container(
            decoration: isVerseActive
                ? BoxDecoration(
                    color: gold.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(4),
                  )
                : null,
            child: ArabicWord(
              word: w,
              verseKey: verse.verseKey,
              // Mushaf page bounds clamp font size to prevent extreme overflow
              fontSize: Get.find<ReaderSettingsController>().fontSize.value.clamp(20.0, 34.0),
            ),
          ),
        );
      }

      // End-of-Ayah medallion marker
      tokens.add(
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4.0),
          child: Container(
            width: 28,
            height: 28,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: gold.withValues(alpha: 0.6),
                width: 1.2,
              ),
              color: isVerseActive
                  ? gold.withValues(alpha: 0.18)
                  : Colors.transparent,
            ),
            child: Text(
              '${verse.verseNumber}',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: gold,
                fontFamily: 'UthmanicHafs',
              ),
            ),
          ),
        ),
      );
    }

    return tokens;
  }

  Widget _buildPageIndicator(
    BuildContext context,
    ThemeData theme,
    NurColorsExtension? nurColors,
  ) {
    if (_pageNumbers.isEmpty) return const SizedBox.shrink();

    final currentPage = _pageNumbers[_currentPageIndex.clamp(0, _pageNumbers.length - 1)];

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0, top: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios, size: 16),
            tooltip: 'Next page',
            onPressed: _currentPageIndex < _pageNumbers.length - 1
                ? () {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  }
                : null,
          ),
          const SizedBox(width: 8),
          Text(
            'Page $currentPage (${_currentPageIndex + 1} of ${_pageNumbers.length})',
            style: theme.textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.arrow_back_ios, size: 16),
            tooltip: 'Previous page',
            onPressed: _currentPageIndex > 0
                ? () {
                    _pageController.previousPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  }
                : null,
          ),
        ],
      ),
    );
  }
}
