import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/reader_controller.dart';
import '../../controllers/reader_settings_controller.dart';
import '../../../audio/controllers/audio_controller.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../core/theme/app_colors.dart';
import 'arabic_word.dart';
import 'hideable_arabic.dart';

class _LineWord {
  final Word word;
  final Verse verse;

  const _LineWord(this.word, this.verse);
}

/// Renders Quran verses grouped by their physical Mushaf page number in a
/// page-flipping [PageView], laid out as the authentic Madani-standard
/// 15-lines-per-page grid (matching the web reader's ReadingModeView),
/// synchronised with audio playback and settings.
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

  // Real Madani mushaf pages routinely span two surahs — a short surah's
  // tail sharing a page with the next one's opening (or vice-versa). The
  // reader only ever loads ONE chapter's verses, so the first/last page of
  // that chapter can be missing the neighbouring surah's lines. These hold
  // the supplemental verses/words/chapter-metadata fetched on demand (via
  // QuranRepository.getVersesForPage) to fill those boundary pages in.
  final Map<int, List<Verse>> _boundaryVerses = {};
  final Map<int, List<Word>> _boundaryWords = {};
  final Map<int, Chapter> _boundaryChapters = {};
  final Set<int> _fetchedBoundaryPages = {};
  final Set<int> _fetchingBoundaryPages = {};

  // The chapter these boundary caches above were computed against. A page's
  // "extra" (other-chapter) verses are determined relative to whichever
  // chapter is loaded at fetch time, so navigating to a new chapter (via the
  // next/previous surah buttons, which reuse this same State) must clear
  // and recompute them — otherwise a boundary page keeps showing the verses
  // that used to be "the other surah" and are now the loaded chapter's own,
  // duplicating them on screen.
  int? _boundaryCacheChapterId;

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

  /// Fetches whichever other surah's verses share [pageNumber] with the
  /// currently loaded chapter (a no-op once cached), so a boundary page
  /// renders its full 15 lines instead of stopping wherever the loaded
  /// chapter's own content happens to end.
  Future<void> _ensureBoundaryPage(int pageNumber) async {
    if (_fetchedBoundaryPages.contains(pageNumber) ||
        _fetchingBoundaryPages.contains(pageNumber)) {
      return;
    }
    _fetchingBoundaryPages.add(pageNumber);
    try {
      final currentChapterId = _readerController.chapter.value?.id;
      final allVerses =
          await _readerController.repository.getVersesForPage(pageNumber);
      final extra =
          allVerses.where((v) => v.chapterId != currentChapterId).toList();

      final wordsMap = <int, List<Word>>{};
      final chapterIds = <int>{};
      for (final v in extra) {
        wordsMap[v.id] = await _readerController.repository.getVerseWords(v.id);
        chapterIds.add(v.chapterId);
      }

      final chaptersMap = <int, Chapter>{};
      for (final id in chapterIds) {
        final c = await _readerController.repository.getChapter(id);
        if (c != null) chaptersMap[id] = c;
      }

      if (!mounted) return;
      setState(() {
        _boundaryVerses[pageNumber] = extra;
        _boundaryWords.addAll(wordsMap);
        _boundaryChapters.addAll(chaptersMap);
        // Only treat this page as permanently resolved if the fetch
        // actually returned something — QuranRepository.getVersesForPage
        // swallows network failures and returns an empty list rather than
        // throwing, so an empty result with nothing cached means the fetch
        // failed, not that the page genuinely has no neighbouring surah.
        // Leaving it out of the set lets a later rebuild (e.g. after
        // reconnecting) retry instead of leaving the page stuck incomplete
        // for the rest of the session.
        if (allVerses.isNotEmpty) {
          _fetchedBoundaryPages.add(pageNumber);
        }
      });
    } catch (_) {
      // Best-effort: the page just renders without the neighbouring
      // surah's lines if this fails (e.g. offline).
    } finally {
      _fetchingBoundaryPages.remove(pageNumber);
    }
  }

  List<Word> _wordsFor(Verse verse) =>
      _boundaryWords[verse.id] ?? _readerController.verseWords[verse.id] ?? [];

  Chapter? _chapterFor(int chapterId) {
    if (_readerController.chapter.value?.id == chapterId) {
      return _readerController.chapter.value;
    }
    return _boundaryChapters[chapterId];
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

      final loadedChapterId = _readerController.chapter.value?.id;
      if (loadedChapterId != null && loadedChapterId != _boundaryCacheChapterId) {
        _boundaryCacheChapterId = loadedChapterId;
        _boundaryVerses.clear();
        _boundaryWords.clear();
        _boundaryChapters.clear();
        _fetchedBoundaryPages.clear();
        _fetchingBoundaryPages.clear();
      }

      if (_pageNumbers.isEmpty) {
        return const Center(child: Text('No pages available for this surah'));
      }

      // Only the chapter's first and last mushaf pages can possibly be
      // shared with a neighbouring surah — fetch/merge those boundary
      // pages' extra content if not already cached.
      unawaited(_ensureBoundaryPage(_pageNumbers.first));
      if (_pageNumbers.length > 1) {
        unawaited(_ensureBoundaryPage(_pageNumbers.last));
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
                  // Keyed by verse id to guard against the boundary cache
                  // and the chapter's own verses momentarily overlapping
                  // (e.g. a rebuild caught mid-invalidation) — belt and
                  // suspenders on top of the chapter-change cache clear
                  // above, which is the actual fix for that overlap.
                  final pageVerses =
                      <int, Verse>{
                        for (final v in _pageMap[pageNum] ?? <Verse>[]) v.id: v,
                        for (final v in _boundaryVerses[pageNum] ?? <Verse>[])
                          v.id: v,
                      }.values.toList()
                        ..sort((a, b) => a.id.compareTo(b.id));

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
    // The real Madani mushaf's page header names whichever surah opens the
    // page — not necessarily the one this reader was opened for, since a
    // shared boundary page can start with a different (earlier) surah's
    // tail than the chapter actually loaded. [_MushafPageCard] then keeps
    // this in sync as the reader scrolls past a surah boundary mid-page.
    final pageLeadChapter =
        (firstVerse != null ? _chapterFor(firstVerse.chapterId) : null) ??
        _readerController.chapter.value;

    final isCenteredOpeningPage = pageNumber <= 2;
    final hasSurahStart = verses.any((v) => v.verseNumber == 1);
    final boundaries = <MapEntry<GlobalKey, Chapter>>[];

    final content = isCenteredOpeningPage
        ? _buildOpeningPage(theme, gold, verses, hasSurahStart)
        : _buildFifteenLinePage(theme, gold, verses, boundaries);

    return _MushafPageCard(
      pageNumber: pageNumber,
      juzNumber: juzNumber,
      leadChapter: pageLeadChapter,
      boundaries: boundaries,
      content: content,
    );
  }

  /// Al-Fatihah / Al-Baqarah 1-5: continuous centered calligraphic flow,
  /// exactly as printed on the two opening Madani mushaf pages.
  Widget _buildOpeningPage(
    ThemeData theme,
    Color gold,
    List<Verse> verses,
    bool hasSurahStart,
  ) {
    final settings = Get.find<ReaderSettingsController>();
    final children = <Widget>[];

    if (hasSurahStart) {
      final chapter = _readerController.chapter.value;
      if (chapter != null) {
        children.add(_buildSurahCartouche(theme, gold, chapter.nameArabic));
        if (chapter.bismillahPre) {
          children.add(_buildBismillah(theme, gold));
        }
      }
    }

    for (final verse in verses) {
      final words = _wordsFor(verse);
      final isVerseActive =
          _audioController.rxActiveVerseKey.value == verse.verseKey;

      children.add(
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 4.0),
          child: Wrap(
            alignment: WrapAlignment.center,
            spacing: 4.0,
            runSpacing: 10.0,
            children: words
                .map(
                  (w) => _buildWordToken(
                    theme,
                    gold,
                    w,
                    verse,
                    isVerseActive,
                    settings.fontSize.value.clamp(24.0, 36.0),
                  ),
                )
                .toList(),
          ),
        ),
      );
    }

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
  }

  /// Standard Madani page: words grouped into their true printed line
  /// (1-15, from the API's per-word `line_number`), rendered justified
  /// edge-to-edge like the real mushaf — matching the web reader.
  Widget _buildFifteenLinePage(
    ThemeData theme,
    Color gold,
    List<Verse> verses,
    List<MapEntry<GlobalKey, Chapter>> boundaries,
  ) {
    return LayoutBuilder(
      builder: (context, constraints) => _buildFifteenLinePageWithWidth(
        theme,
        gold,
        verses,
        constraints.maxWidth,
        boundaries,
      ),
    );
  }

  Widget _buildFifteenLinePageWithWidth(
    ThemeData theme,
    Color gold,
    List<Verse> verses,
    double availableWidth,
    List<MapEntry<GlobalKey, Chapter>> boundaries,
  ) {
    final settings = Get.find<ReaderSettingsController>();
    final lineMap = <int, List<_LineWord>>{};
    for (final verse in verses) {
      final words = _wordsFor(verse);
      for (final w in words) {
        final lineNum = w.lineNumber <= 0 ? 1 : w.lineNumber;
        lineMap.putIfAbsent(lineNum, () => []).add(_LineWord(w, verse));
      }
    }

    final lineNumbers = lineMap.keys.toList()..sort();
    final children = <Widget>[];
    final fontSize = settings.fontSize.value.clamp(20.0, 30.0);

    for (int i = 0; i < lineNumbers.length; i++) {
      final lineWords = lineMap[lineNumbers[i]]!;
      final isLastLine = i == lineNumbers.length - 1;
      final isShortLastLine = isLastLine && lineWords.length <= 5;

      // A new surah always opens on a fresh printed line.
      final surahStart = lineWords.firstWhereOrNull(
        (lw) => lw.verse.verseNumber == 1 && lw.word.position == 1,
      );
      if (surahStart != null) {
        final chapter = _chapterFor(surahStart.verse.chapterId);
        if (chapter != null) {
          final boundaryKey = GlobalKey();
          children.add(
            Container(
              key: boundaryKey,
              child: _buildSurahCartouche(theme, gold, chapter.nameArabic),
            ),
          );
          boundaries.add(MapEntry(boundaryKey, chapter));
          if (chapter.bismillahPre) {
            children.add(_buildBismillah(theme, gold));
          }
        }
      }

      children.add(
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 6.0),
          child: isShortLastLine
              ? Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 16.0,
                  runSpacing: 8.0,
                  children: lineWords
                      .map(
                        (lw) => _buildWordToken(
                          theme,
                          gold,
                          lw.word,
                          lw.verse,
                          _audioController.rxActiveVerseKey.value ==
                              lw.verse.verseKey,
                          fontSize,
                        ),
                      )
                      .toList(),
                )
              : FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.center,
                  child: SizedBox(
                    // A fixed target width — scaled to fit the printed
                    // line's natural size — is what lets `spaceBetween`
                    // justify the words edge-to-edge instead of hugging
                    // their own content width (which FittedBox alone would
                    // otherwise force via unbounded main-axis constraints).
                    width: _lineFitWidth(lineWords, fontSize, availableWidth),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: lineWords
                          .map(
                            (lw) => _buildWordToken(
                              theme,
                              gold,
                              lw.word,
                              lw.verse,
                              _audioController.rxActiveVerseKey.value ==
                                  lw.verse.verseKey,
                              fontSize,
                            ),
                          )
                          .toList(),
                    ),
                  ),
                ),
        ),
      );
    }

    return Column(children: children);
  }

  /// Target width for a justified line's [Row]: the line's own natural
  /// (unconstrained) width at [fontSize], or [availableWidth] if that's
  /// wider — whichever is larger. Handing the Row its natural width lets it
  /// lay out without clipping even when the line is too wide for the page;
  /// the enclosing [FittedBox] then scales the whole block down to fit,
  /// which is what actually prevents the overflow (a line with more words
  /// than the reference reflow assumed can't be justified into the same
  /// space at full size). Lines that already fit get the page's full width
  /// so `spaceBetween` still spreads them edge-to-edge.
  double _lineFitWidth(
    List<_LineWord> lineWords,
    double fontSize,
    double availableWidth,
  ) {
    final text = lineWords
        .map((lw) => lw.word.qpcUthmaniHafs ?? lw.word.textUthmani)
        .join(' ');
    final painter = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(fontFamily: 'UthmanicHafs', fontSize: fontSize),
      ),
      textDirection: TextDirection.rtl,
      maxLines: 1,
    )..layout();
    // Small buffer for the per-word Container/InkWell padding that this
    // plain-text measurement doesn't account for.
    final natural = painter.width * 1.08;
    return natural > availableWidth ? natural : availableWidth;
  }

  Widget _buildWordToken(
    ThemeData theme,
    Color gold,
    Word word,
    Verse verse,
    bool isVerseActive,
    double fontSize,
  ) {
    final isEndMarker = word.charTypeName == 'end';
    return Container(
      decoration: isVerseActive
          ? BoxDecoration(
              color: gold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(4),
            )
          : null,
      // A Mushaf line can span words from more than one ayah, so hifz
      // hiding is applied per word (keyed by that word's own verse) rather
      // than around the whole line — matching Verse mode's per-ayah reveal,
      // just re-scoped to how this layout groups words.
      child: HideableArabic(
        verseKey: verse.verseKey,
        child: ArabicWord(
          word: word,
          verseKey: verse.verseKey,
          fontSize: isEndMarker ? fontSize * 1.15 : fontSize,
        ),
      ),
    );
  }

  Widget _buildSurahCartouche(ThemeData theme, Color gold, String nameArabic) {
    final clean = nameArabic.replaceFirst(RegExp(r'^سورة\s+'), '');
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0, top: 4.0),
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 12.0),
      decoration: BoxDecoration(
        border: Border.all(color: gold.withValues(alpha: 0.6), width: 1.5),
        borderRadius: BorderRadius.circular(4),
        color: gold.withValues(alpha: 0.06),
      ),
      alignment: Alignment.center,
      child: Text(
        'سُورَةُ $clean',
        textAlign: TextAlign.center,
        style: TextStyle(
          fontFamily: 'UthmanicHafs',
          fontSize: 26,
          fontWeight: FontWeight.bold,
          color: gold,
        ),
      ),
    );
  }

  Widget _buildBismillah(ThemeData theme, Color gold) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
        textAlign: TextAlign.center,
        style: TextStyle(
          fontFamily: 'UthmanicHafs',
          fontSize: 28,
          color: theme.colorScheme.onSurface,
        ),
      ),
    );
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

/// One Mushaf page card: header (Juz / Surah / Page) + the scrollable
/// 15-line content. On a page shared between two surahs (e.g. a short
/// surah's tail followed by the next one's opening), [leadChapter] is only
/// the surah of the page's very first line — correct while at the top, but
/// wrong once the reader scrolls down into the next surah. This tracks
/// scroll position against each surah-start boundary's actual on-screen
/// position (via [boundaries]) and swaps the header to match whichever
/// surah has scrolled to the top.
class _MushafPageCard extends StatefulWidget {
  final int pageNumber;
  final int juzNumber;
  final Chapter? leadChapter;
  final List<MapEntry<GlobalKey, Chapter>> boundaries;
  final Widget content;

  const _MushafPageCard({
    required this.pageNumber,
    required this.juzNumber,
    required this.leadChapter,
    required this.boundaries,
    required this.content,
  });

  @override
  State<_MushafPageCard> createState() => _MushafPageCardState();
}

class _MushafPageCardState extends State<_MushafPageCard> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _contentKey = GlobalKey();
  Chapter? _displayedChapter;

  @override
  void initState() {
    super.initState();
    _displayedChapter = widget.leadChapter;
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _onScroll());
  }

  @override
  void didUpdateWidget(covariant _MushafPageCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.pageNumber != widget.pageNumber) {
      _displayedChapter = widget.leadChapter;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) => _onScroll());
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!mounted || widget.boundaries.isEmpty || !_scrollController.hasClients) {
      return;
    }
    final contentBox = _contentKey.currentContext?.findRenderObject();
    if (contentBox is! RenderBox || !contentBox.attached) return;

    final offset = _scrollController.offset;
    // A short boundary page (little content below the cartouche) may never
    // let a boundary scroll all the way to the literal viewport top before
    // maxScrollExtent is reached — so "current" means scrolled into the top
    // ~40% of the visible viewport, not flush against pixel 0.
    final viewportHeight = _scrollController.position.viewportDimension;
    final threshold = offset + viewportHeight * 0.4;
    Chapter? active = widget.leadChapter;
    for (final entry in widget.boundaries) {
      final box = entry.key.currentContext?.findRenderObject();
      if (box is! RenderBox || !box.attached) continue;
      // Fixed distance from the top of the scrollable content — the same
      // regardless of current scroll offset, since both boxes move
      // together — so comparing it against the scrolled-past threshold
      // tells us whether this boundary (and its surah) is now at/near the
      // visible top.
      final localTop = box.localToGlobal(Offset.zero, ancestor: contentBox).dy;
      if (localTop <= threshold) {
        active = entry.value;
      }
    }
    if (active?.id != _displayedChapter?.id) {
      setState(() => _displayedChapter = active);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final gold = nurColors?.brandGold ?? theme.colorScheme.primary;
    final surahName = _displayedChapter?.nameSimple ?? '';

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
                      'Juz ${widget.juzNumber}',
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
                      'Page ${widget.pageNumber}',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: gold,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Divider(height: 1, color: gold.withValues(alpha: 0.2)),
              // Page Content — Madani-standard 15-line grid, or centered
              // calligraphic flow on the two opening pages.
              Expanded(
                child: SingleChildScrollView(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20.0,
                    vertical: 16.0,
                  ),
                  child: Directionality(
                    key: _contentKey,
                    textDirection: TextDirection.rtl,
                    child: widget.content,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
