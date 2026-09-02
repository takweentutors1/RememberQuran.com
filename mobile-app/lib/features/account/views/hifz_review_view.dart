import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../data/repositories/hifz_repository.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../audio/controllers/audio_controller.dart';
import '../controllers/auth_controller.dart';
import '../controllers/hifz_controller.dart';
import '../models/hifz_srs.dart';

/// Fullscreen interactive flashcard review session for memorised Quran verses.
/// Ports the web application's SM-2 spaced repetition review experience (`HifzReviewSession.tsx`).
class HifzReviewView extends StatefulWidget {
  const HifzReviewView({super.key});

  @override
  State<HifzReviewView> createState() => _HifzReviewViewState();
}

class _HifzReviewViewState extends State<HifzReviewView> {
  final HifzRepository _hifzRepo = HifzRepository();
  final QuranRepository _quranRepo = Get.find<QuranRepository>();
  final AudioController _audioController = Get.find<AudioController>();

  List<MemorisedAyahRecord> _queue = [];
  int _currentIndex = 0;
  bool _isLoadingQueue = true;
  bool _revealed = false;
  bool _isSubmitting = false;
  int _reviewedCount = 0;

  Verse? _currentVerse;
  Chapter? _currentChapter;
  List<VerseTranslation> _currentTranslations = [];
  bool _isLoadingVerse = false;

  @override
  void initState() {
    super.initState();
    _initSession();
  }

  @override
  void dispose() {
    // If the review session was playing an ayah, pause on exit so audio doesn't linger
    if (_audioController.rxIsPlaying.value) {
      _audioController.pause();
    }
    super.dispose();
  }

  Future<void> _initSession() async {
    final authController = Get.find<AuthController>();
    final user = authController.firebaseUser.value;
    if (user == null) {
      if (mounted) setState(() => _isLoadingQueue = false);
      return;
    }

    try {
      final due = await _hifzRepo.getDueReviews(user.uid);
      if (mounted) {
        setState(() {
          _queue = due;
          _isLoadingQueue = false;
        });
        if (_queue.isNotEmpty) {
          _loadCurrentAyahData();
        }
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingQueue = false);
    }
  }

  Future<void> _loadCurrentAyahData() async {
    if (_currentIndex >= _queue.length) return;
    final item = _queue[_currentIndex];

    setState(() {
      _isLoadingVerse = true;
      _revealed = false;
    });

    try {
      final chapter = await _quranRepo.getChapter(item.surahId);
      final verse = await _quranRepo.getVerse(item.surahId, item.ayahId);
      List<VerseTranslation> translations = [];
      if (verse != null) {
        translations = await _quranRepo.getVerseTranslations(verse.id);
      }

      if (mounted) {
        setState(() {
          _currentChapter = chapter;
          _currentVerse = verse;
          _currentTranslations = translations;
          _isLoadingVerse = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingVerse = false);
    }
  }

  void _playAudio() {
    if (_currentVerse == null) return;
    _audioController.playVerse(
      _currentVerse!.chapterId,
      _currentVerse!.verseNumber,
    );
  }

  Future<void> _handleGrade(SRSGrade grade) async {
    if (_currentIndex >= _queue.length || _isSubmitting) return;
    HapticFeedback.lightImpact();
    final item = _queue[_currentIndex];
    final auth = Get.find<AuthController>();
    final user = auth.firebaseUser.value;
    if (user == null) return;

    setState(() => _isSubmitting = true);

    try {
      await _hifzRepo.submitReview(user.uid, item.verseKey, grade);

      _reviewedCount++;

      // If graded "again", requeue at the end of the current session
      if (grade == SRSGrade.again) {
        _queue.add(item);
      }

      if (_currentIndex + 1 < _queue.length) {
        setState(() {
          _currentIndex++;
        });
        await _loadCurrentAyahData();
      } else if (grade == SRSGrade.again && _queue.length > _currentIndex + 1) {
        setState(() {
          _currentIndex++;
        });
        await _loadCurrentAyahData();
      } else {
        setState(() {
          _currentIndex++;
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    if (_isLoadingQueue) {
      return Scaffold(
        appBar: AppBar(title: const Text('Spaced Review')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final isSessionComplete = _queue.isEmpty || _currentIndex >= _queue.length;

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop && Get.isRegistered<HifzController>()) {
          Get.find<HifzController>().loadData();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Hifz SRS Review'),
          leading: IconButton(
            icon: const Icon(Icons.close_rounded),
            tooltip: 'Exit',
            onPressed: () {
              if (Get.isRegistered<HifzController>()) {
              Get.find<HifzController>().loadData();
            }
            Get.back();
          },
        ),
      ),
      body: SafeArea(
        child: isSessionComplete
            ? _buildCompletionView(theme, brandGold)
            : _buildReviewCard(theme, brandGold),
      ),
    ));
  }

  Widget _buildCompletionView(ThemeData theme, Color brandGold) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: brandGold.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.check_circle_rounded,
                color: brandGold,
                size: 48,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Session Complete!',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _reviewedCount > 0
                  ? 'Alhamdulillah! You practiced $_reviewedCount ${_reviewedCount == 1 ? 'verse' : 'verses'} today. Spaced intervals have been updated.'
                  : 'No reviews are due right now. Keep up the consistent recitation!',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.8),
              ),
            ),
            const SizedBox(height: 28),
            FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: brandGold,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              ),
              icon: const Icon(Icons.arrow_back),
              label: const Text(
                'Back to Hifz Dashboard',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              onPressed: () {
                if (Get.isRegistered<HifzController>()) {
                  Get.find<HifzController>().loadData();
                }
                Get.back();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(ThemeData theme, Color brandGold) {
    final item = _queue[_currentIndex];
    final surahName = _currentChapter?.nameSimple ?? 'Surah ${item.surahId}';
    final progress = (_currentIndex + 1) / _queue.length;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Progress bar
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 6,
                        backgroundColor: theme.colorScheme.surfaceContainerHighest,
                        valueColor: AlwaysStoppedAnimation<Color>(brandGold),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${_currentIndex + 1} / ${_queue.length}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Main Flashcard Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: theme.cardColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: brandGold.withValues(alpha: 0.25),
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
                    // Header prompt
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              surahName,
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Ayah ${item.ayahId}',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: brandGold,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        IconButton.filledTonal(
                          icon: const Icon(Icons.volume_up_rounded),
                          tooltip: 'Listen to ayah',
                          onPressed: _isLoadingVerse ? null : _playAudio,
                        ),
                      ],
                    ),
                    const Divider(height: 28),

                    // Card Content
                    if (_isLoadingVerse)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 40),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (!_revealed) ...[
                      // Hidden state prompt
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 16),
                        child: Column(
                          children: [
                            Icon(
                              Icons.menu_book_rounded,
                              size: 40,
                              color: theme.colorScheme.outline.withValues(alpha: 0.5),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Recite Ayah ${item.ayahId} from memory',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Tap below to reveal and check your recitation',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.textTheme.bodySmall?.color?.withValues(alpha: 0.7),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(48),
                          side: BorderSide(color: brandGold),
                        ),
                        icon: const Icon(Icons.visibility_rounded),
                        label: const Text(
                          'Reveal Verse',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          setState(() => _revealed = true);
                        },
                      ),
                    ] else ...[
                      // Revealed Arabic Verse & Translation
                      if (_currentVerse != null) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: Text(
                            _currentVerse!.textUthmani,
                            textDirection: TextDirection.rtl,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontFamily: 'Amiri',
                              fontSize: 24,
                              height: 1.9,
                            ),
                          ),
                        ),
                        if (_currentTranslations.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _currentTranslations.first.translationText,
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                height: 1.5,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Self-grading evaluation bar
              if (_revealed) ...[
                Text(
                  'How well did you recite it?',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    _buildGradeButton(
                      label: 'Again (1d)',
                      color: Colors.redAccent,
                      grade: SRSGrade.again,
                    ),
                    _buildGradeButton(
                      label: 'Hard',
                      color: Colors.orangeAccent,
                      grade: SRSGrade.hard,
                    ),
                    _buildGradeButton(
                      label: 'Good',
                      color: brandGold,
                      grade: SRSGrade.good,
                    ),
                    _buildGradeButton(
                      label: 'Easy',
                      color: const Color(0xFF10B981),
                      grade: SRSGrade.easy,
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGradeButton({
    required String label,
    required Color color,
    required SRSGrade grade,
  }) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withValues(alpha: 0.15),
        foregroundColor: color,
        side: BorderSide(color: color.withValues(alpha: 0.5)),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        elevation: 0,
      ),
      onPressed: _isSubmitting ? null : () => _handleGrade(grade),
      child: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
    );
  }
}
