import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../controllers/audio_controller.dart';
import '../../../core/models/reciter.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../core/theme/app_colors.dart';
import 'widgets/radio_art_card.dart';
import 'widgets/radio_facts.dart';
import 'widgets/waveform_bars.dart';
import '../../../core/utils/responsive_layout.dart';
import '../widgets/reciter_selector.dart';
import 'widgets/sleep_timer_sheet.dart';

class RadioView extends StatefulWidget {
  const RadioView({super.key});

  @override
  State<RadioView> createState() => _RadioViewState();
}

class _RadioViewState extends State<RadioView> {
  final AudioController _audioController = Get.find<AudioController>();
  final QuranRepository _quranRepo = Get.find<QuranRepository>();

  List<Chapter> _chapters = [];
  int _selectedSurahId = 1;
  int _selectedReciterId = 7; // Mishary

  late Timer _factsTimer;
  final RxInt _currentFactIndex = 0.obs;
  bool _isPlayPressed = false;

  Timer? _smoothTicker;
  Worker? _playingWorker;
  Duration? _dragPosition;

  @override
  void initState() {
    super.initState();
    _selectedSurahId = _audioController.rxCurrentSurahId.value;
    _selectedReciterId = _audioController.rxCurrentReciterId.value;
    _loadChapters();

    _factsTimer = Timer.periodic(const Duration(seconds: 8), (timer) {
      _currentFactIndex.value =
          (_currentFactIndex.value + 1) % radioFacts.length;
    });

    _playingWorker = ever<bool>(
      _audioController.rxIsPlaying,
      _syncSmoothTicker,
    );
    _syncSmoothTicker(_audioController.rxIsPlaying.value);
  }

  void _syncSmoothTicker(bool isPlaying) {
    _smoothTicker?.cancel();
    _smoothTicker = null;
    if (!isPlaying) return;
    _smoothTicker = Timer.periodic(const Duration(milliseconds: 33), (_) {
      if (!mounted) return;
      setState(() {});
    });
  }

  @override
  void dispose() {
    _factsTimer.cancel();
    _smoothTicker?.cancel();
    _playingWorker?.dispose();
    super.dispose();
  }

  Future<void> _loadChapters() async {
    final chapters = await _quranRepo.getChapters();
    setState(() {
      _chapters = chapters;
    });
  }

  void _handleMainButton() {
    HapticFeedback.lightImpact();
    final isRadio = _audioController.rxIsRadioMode.value;
    final isPlaying = _audioController.rxIsPlaying.value;
    final hasAudio = _audioController.rxHasAudio.value;
    final isCorrectSurah =
        _audioController.rxCurrentSurahId.value == _selectedSurahId;

    if (isRadio && hasAudio && isCorrectSurah) {
      if (isPlaying) {
        _audioController.pause();
      } else {
        _audioController.play();
      }
    } else {
      _audioController.startRadio(_selectedSurahId);
    }
  }

  void _handleSurahChange(int id) {
    HapticFeedback.lightImpact();
    setState(() => _selectedSurahId = id);
    if (_audioController.rxIsRadioMode.value) {
      _audioController.startRadio(id);
    }
  }

  /// Prev/Next transport buttons. While radio is actively playing, this
  /// delegates to the controller's radioSkipToPrevious/Next — the same
  /// methods the MiniPlayer uses — so shuffle mode governs these taps too,
  /// not just auto-advance on track completion. Before playback starts,
  /// falls back to plain sequential browsing of the surah picker.
  void _skipSurah({required bool forward}) {
    HapticFeedback.lightImpact();
    if (_audioController.rxIsRadioMode.value) {
      final future = forward
          ? _audioController.radioSkipToNext()
          : _audioController.radioSkipToPrevious();
      future.then((_) {
        if (mounted)
          setState(
            () => _selectedSurahId = _audioController.rxCurrentSurahId.value,
          );
      });
      return;
    }
    final target = _audioController.nextAvailableSurahId(
      _selectedSurahId,
      forward: forward,
    );
    _handleSurahChange(target);
  }

  void _handleReciterChange(int id) {
    HapticFeedback.lightImpact();
    setState(() {
      _selectedReciterId = id;
      _audioController.rxCurrentReciterId.value = id;
    });
    if (_audioController.rxIsRadioMode.value) {
      _audioController.startRadio(_selectedSurahId);
    }
  }

  void _showSurahPicker(BuildContext context) {
    showResponsiveSheet(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        final nurColors = theme.extension<NurColorsExtension>();
        final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

        // showResponsiveSheet's modal route is transparent — paint the
        // card's own background here rather than relying on the route's
        // (previously opaque-by-default) background.
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.outline.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Select Surah',
                        style: TextStyle(
                          fontSize: context.responsiveBaseTextSize,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Obx(
                        () => _audioController.rxIsValidatingAvailability.value
                            ? const Padding(
                                padding: EdgeInsets.only(left: 10),
                                child: SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                ),
                              )
                            : const SizedBox.shrink(),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Obx(() {
                    final unavailable = _audioController.rxUnavailableSurahIds;
                    final available = _chapters
                        .where((c) => !unavailable.contains(c.id))
                        .toList();

                    if (available.isEmpty) {
                      final stillChecking =
                          _audioController.rxIsValidatingAvailability.value;
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 24,
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                stillChecking
                                    ? Icons.hourglass_empty_rounded
                                    : Icons.wifi_off_rounded,
                                size: 40,
                                color: theme.colorScheme.outline,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                stillChecking
                                    ? 'Checking which surahs are available…'
                                    : 'No surahs available for this reciter right now.',
                                textAlign: TextAlign.center,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.textTheme.bodyMedium?.color
                                      ?.withOpacity(0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    return ListView.builder(
                      itemCount: available.length,
                      itemBuilder: (context, index) {
                        final c = available[index];
                        final isSelected = c.id == _selectedSurahId;
                        return ListTile(
                          leading: Text(
                            '${c.id}.',
                            style: TextStyle(
                              color: brandGold,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          title: Text(c.nameSimple),
                          trailing: isSelected
                              ? Icon(Icons.check_circle, color: brandGold)
                              : null,
                          onTap: () {
                            Navigator.pop(context);
                            _handleSurahChange(c.id);
                          },
                        );
                      },
                    );
                  }),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDownloadButton(BuildContext context) {
    return Obx(() {
      final reciterId = _selectedReciterId;
      final surahId = _selectedSurahId;
      final key = _audioController.downloadKey(reciterId, surahId);
      final progress = _audioController.rxDownloadProgress[key];
      final downloaded = _audioController.isDownloaded(reciterId, surahId);

      if (progress != null) {
        return Container(
          width: 48,
          height: 48,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: CircularProgressIndicator(
            value: progress > 0 ? progress : null,
            strokeWidth: 2,
            color:
                Theme.of(context).extension<NurColorsExtension>()?.brandGold ??
                Theme.of(context).colorScheme.primary,
          ),
        );
      }

      return Material(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            HapticFeedback.lightImpact();
            if (downloaded) {
              _audioController.deleteDownload(reciterId, surahId);
            } else {
              _audioController.downloadChapter(reciterId, surahId);
            }
          },
          child: Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            child: Icon(
              downloaded ? Icons.download_done_rounded : Icons.download_rounded,
              color: downloaded ? AppColors.lightBrandGold : null,
            ),
          ),
        ),
      );
    });
  }

  // --- Layout Widgets ---

  Widget _buildTopBar(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Expanded — three icon buttons now live on the trailing side
          // (shuffle, sleep timer, download); without this the title text
          // has no room to shrink and risks a RenderFlex overflow on
          // narrow screens instead of just wrapping to a second line.
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Recitation & Remembrance",
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: brandGold,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  "A blessed time for recitation",
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Row(
            children: [
              _buildShuffleButton(context),
              const SizedBox(width: 8),
              _buildSleepTimerButton(context),
              const SizedBox(width: 8),
              _buildDownloadButton(context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShuffleButton(BuildContext context) {
    return Obx(() {
      final theme = Theme.of(context);
      final nurColors = theme.extension<NurColorsExtension>();
      final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
      final active = _audioController.rxShuffleEnabled.value;

      return Material(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            HapticFeedback.lightImpact();
            _audioController.setShuffleEnabled(!active);
          },
          child: Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            child: Icon(
              Icons.shuffle_rounded,
              color: active ? brandGold : null,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildSleepTimerButton(BuildContext context) {
    return Obx(() {
      final theme = Theme.of(context);
      final nurColors = theme.extension<NurColorsExtension>();
      final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
      final active =
          _audioController.rxSleepTimerMode.value != SleepTimerMode.off;

      return Material(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            HapticFeedback.lightImpact();
            _showSleepTimerSheet(context);
          },
          child: Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            child: Icon(
              active ? Icons.bedtime_rounded : Icons.bedtime_outlined,
              color: active ? brandGold : null,
            ),
          ),
        ),
      );
    });
  }

  void _showSleepTimerSheet(BuildContext context) {
    SleepTimerSheet.show(context);
  }

  Widget _buildTrackInfo(BuildContext context) {
    return Obx(() {
      final nameEn = _audioController.rxCurrentSurahName.value;
      final nameAr = _audioController.rxCurrentSurahNameArabic.value;
      final meaning = _audioController.rxCurrentSurahEnglishMeaning.value;

      if (nameEn.isEmpty) return const SizedBox(height: 80);

      return Column(
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            child: Text(
              'Surah $nameEn',
              key: ValueKey(nameEn),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ),
          if (meaning.isNotEmpty) ...[
            const SizedBox(height: 2),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 400),
              child: Text(
                meaning,
                key: ValueKey(meaning),
                style: TextStyle(
                  fontSize: 14,
                  color: Theme.of(
                    context,
                  ).textTheme.bodySmall?.color?.withOpacity(0.7),
                ),
              ),
            ),
          ],
          const SizedBox(height: 4),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            child: Text(
              nameAr,
              key: ValueKey(nameAr),
              style: TextStyle(
                fontSize: 20,
                fontFamily: 'UthmanicHafs',
                color: Theme.of(context).colorScheme.primary.withOpacity(0.7),
              ),
            ),
          ),
          const SizedBox(height: 16),
          _buildContextChips(context),
          const SizedBox(height: 14),
          _buildQuranProgressBar(context),
        ],
      );
    });
  }

  String _formatDuration(Duration d) {
    if (d.isNegative) d = Duration.zero;
    final hours = d.inHours;
    final minutes = d.inMinutes.remainder(60);
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    if (hours > 0) {
      return '$hours:${minutes.toString().padLeft(2, '0')}:$seconds';
    }
    return '$minutes:$seconds';
  }

  /// Subtle "how far through the Quran" indicator — reflects the surah
  /// actually loaded/playing (rxCurrentSurahId), not just the one selected
  /// in the picker, so it tracks real listening progress.
  Widget _buildQuranProgressBar(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    return StreamBuilder<MediaItem?>(
      stream: _audioController.mediaItemStream,
      initialData: _audioController.currentMediaItem,
      builder: (context, mediaSnap) {
        // Prefer the duration the qdc API already told us about this
        // chapter (rxKnownDuration) over MediaItem.duration, which depends
        // on just_audio's own durationStream firing for a streamed source —
        // that can lag or never land promptly, which otherwise left this
        // progress bar stuck at 0:00/0:00 even while audio was audibly
        // playing. Still prefers the player's own value once it's actually
        // known, since that reflects the real file rather than the API's
        // metadata.
        final mediaDuration = mediaSnap.data?.duration ?? Duration.zero;
        final duration = mediaDuration > Duration.zero
            ? mediaDuration
            : (_audioController.rxKnownDuration.value ?? Duration.zero);
        return StreamBuilder<PlaybackState>(
          stream: _audioController.playbackStateStream,
          initialData: _audioController.currentPlaybackState,
          builder: (context, stateSnap) {
            final livePosition = _audioController.currentPlaybackState.position;
            final position = _dragPosition ?? livePosition;
            final totalMs = duration.inMilliseconds.toDouble();
            final hasDuration = totalMs > 0;
            final clampedMs = hasDuration
                ? position.inMilliseconds.toDouble().clamp(0, totalMs).toDouble()
                : 0.0;

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 3,
                      activeTrackColor: brandGold.withOpacity(0.55),
                      inactiveTrackColor: brandGold.withOpacity(0.12),
                      thumbColor: brandGold,
                      thumbShape: const RoundSliderThumbShape(
                        enabledThumbRadius: 6,
                      ),
                      overlayShape: const RoundSliderOverlayShape(
                        overlayRadius: 14,
                      ),
                    ),
                    child: Slider(
                      value: clampedMs,
                      max: hasDuration ? totalMs : 1,
                      onChanged: hasDuration
                          ? (v) => setState(
                              () => _dragPosition = Duration(
                                milliseconds: v.toInt(),
                              ),
                            )
                          : null,
                      onChangeEnd: hasDuration
                          ? (v) {
                              _audioController.seek(
                                Duration(milliseconds: v.toInt()),
                              );
                              setState(() => _dragPosition = null);
                            }
                          : null,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatDuration(Duration(milliseconds: clampedMs.toInt())),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontSize: 11,
                            color: theme.textTheme.bodySmall?.color?.withOpacity(0.6),
                          ),
                        ),
                        Text(
                          _formatDuration(duration),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontSize: 11,
                            color: theme.textTheme.bodySmall?.color?.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  /// "5" -> "5th", "1" -> "1st", "11"-"13" -> "th" (English ordinal rules).
  String _ordinal(int n) {
    if (n % 100 >= 11 && n % 100 <= 13) return '${n}th';
    switch (n % 10) {
      case 1:
        return '${n}st';
      case 2:
        return '${n}nd';
      case 3:
        return '${n}rd';
      default:
        return '${n}th';
    }
  }

  Widget _buildContextChips(BuildContext context) {
    final place = _audioController.rxCurrentSurahRevelationPlace.value;
    final verses = _audioController.rxCurrentSurahVersesCount.value;
    final juz = _audioController.rxCurrentSurahFirstJuz.value;
    final revelationOrder =
        _audioController.rxCurrentSurahRevelationOrder.value;

    if (place.isEmpty) return const SizedBox(height: 32);

    final isMakki = place.toLowerCase() == 'makkah';
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();

    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
    final brandGoldSoft =
        nurColors?.brandGoldSoft ?? theme.colorScheme.primaryContainer;

    Widget chip(String label, IconData icon) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: brandGoldSoft.withOpacity(0.5),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: brandGold.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: brandGold),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: brandGold,
              ),
            ),
          ],
        ),
      );
    }

    // Wrap (not Row) — a 4th chip risked overflowing narrow phone widths
    // (this view is tested down to 375px); flowing to a second line beats
    // a RenderFlex overflow.
    return Wrap(
      alignment: WrapAlignment.center,
      runSpacing: 8,
      children: [
        chip(isMakki ? 'Makki' : 'Madani', isMakki ? Icons.mosque : Icons.eco),
        chip('$verses Ayahs', Icons.format_list_numbered),
        chip('Juz $juz', Icons.book),
        if (revelationOrder > 0)
          chip('Revealed ${_ordinal(revelationOrder)}', Icons.numbers_rounded),
      ],
    );
  }

  Widget _buildPlayControls(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: Icon(
            Icons.skip_previous_rounded,
            size: 40,
            color: theme.iconTheme.color?.withOpacity(0.7),
          ),
          onPressed: () => _skipSurah(forward: false),
        ),
        const SizedBox(width: 32),
        Obx(() {
          final isRadio = _audioController.rxIsRadioMode.value;
          final isPlaying = _audioController.rxIsPlaying.value;
          final isBusy = _audioController.rxIsBusy.value;
          final isBuffering = _audioController.rxIsBuffering.value;

          return GestureDetector(
            onTapDown: isBusy
                ? null
                : (_) => setState(() => _isPlayPressed = true),
            onTapUp: isBusy
                ? null
                : (_) {
                    setState(() => _isPlayPressed = false);
                    _handleMainButton();
                  },
            onTapCancel: isBusy
                ? null
                : () => setState(() => _isPlayPressed = false),
            child: AnimatedScale(
              scale: _isPlayPressed ? 0.9 : 1.0,
              duration: const Duration(milliseconds: 100),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                height: 80,
                width: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: brandGold,
                  boxShadow: [
                    BoxShadow(
                      color: brandGold.withOpacity(isPlaying ? 0.4 : 0.2),
                      blurRadius: isPlaying ? 20 : 12,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: isBusy
                      // Full blocking spinner: source is being set up
                      ? SizedBox(
                          width: 32,
                          height: 32,
                          child: CircularProgressIndicator(
                            color: theme.colorScheme.onPrimary,
                            strokeWidth: 3,
                          ),
                        )
                      : Stack(
                          alignment: Alignment.center,
                          children: [
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 200),
                              transitionBuilder: (child, anim) =>
                                  ScaleTransition(scale: anim, child: child),
                              child: Icon(
                                (!isRadio || !isPlaying)
                                    ? Icons.play_arrow_rounded
                                    : Icons.pause_rounded,
                                key: ValueKey(!isRadio || !isPlaying),
                                color: theme.colorScheme.onPrimary,
                                size: 44,
                              ),
                            ),
                            // Subtle buffering ring: network is buffering but
                            // the user can still tap to pause/resume
                            if (isBuffering)
                              SizedBox(
                                width: 68,
                                height: 68,
                                child: CircularProgressIndicator(
                                  color: theme.colorScheme.onPrimary.withOpacity(0.4),
                                  strokeWidth: 2.5,
                                ),
                              ),
                          ],
                        ),
                ),
              ),
            ),
          );
        }),
        const SizedBox(width: 32),
        IconButton(
          icon: Icon(
            Icons.skip_next_rounded,
            size: 40,
            color: theme.iconTheme.color?.withOpacity(0.7),
          ),
          onPressed: () => _skipSurah(forward: true),
        ),
      ],
    );
  }

  Widget _buildBottomSheetButtons(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => _showReciterPicker(context),
              borderRadius: BorderRadius.circular(24),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
                decoration: BoxDecoration(
                  color: theme.cardColor,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: theme.dividerColor.withOpacity(0.5),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.person_rounded,
                      size: 18,
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        reciters
                            .firstWhere((r) => r.id == _selectedReciterId)
                            .name,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: InkWell(
              onTap: () => _showSurahPicker(context),
              borderRadius: BorderRadius.circular(24),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
                decoration: BoxDecoration(
                  color: theme.cardColor,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: theme.dividerColor.withOpacity(0.5),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.menu_book_rounded,
                      size: 18,
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        _chapters.isEmpty
                            ? 'Select Surah'
                            : _chapters
                                  .firstWhere(
                                    (c) => c.id == _selectedSurahId,
                                    orElse: () => _chapters.first,
                                  )
                                  .nameSimple,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showReciterPicker(BuildContext context) {
    showReciterPicker(
      context: context,
      selectedReciterId: _selectedReciterId,
      onReciterSelected: _handleReciterChange,
    );
  }

  Widget _buildFactsPanel(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor.withOpacity(0.6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.auto_awesome,
            size: 16,
            color: theme.colorScheme.primary.withOpacity(0.7),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(() {
              final index = _currentFactIndex.value;
              return AnimatedSwitcher(
                duration: const Duration(milliseconds: 800),
                child: Text(
                  radioFacts[index],
                  key: ValueKey(index),
                  style: theme.textTheme.bodySmall?.copyWith(
                    height: 1.4,
                    color:
                        nurColors?.foregroundSubtle ??
                        theme.textTheme.bodySmall?.color,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final nurColors = theme.extension<NurColorsExtension>();

    return Scaffold(
      body: Stack(
        children: [
          // Subtle full-screen animated background
          Positioned.fill(
            child: Obx(() {
              final isPlaying = _audioController.rxIsPlaying.value;
              return AnimatedContainer(
                duration: const Duration(seconds: 2),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      if (isPlaying)
                        (nurColors?.brandGoldSoft ??
                                theme.colorScheme.primaryContainer)
                            .withOpacity(isDark ? 0.2 : 0.4)
                      else
                        theme.scaffoldBackgroundColor,
                      theme.scaffoldBackgroundColor,
                    ],
                  ),
                ),
              );
            }),
          ),

          SafeArea(
            child: ResponsiveLayout(
              mobile: _buildMobileLayout(context),
              desktop: _buildDesktopLayout(context),
            ),
          ),
        ],
      ),
    );
  }

  /// Art card + cosmetic waveform bars, shared by both layouts below —
  /// previously each layout duplicated its own copy of this Obx block.
  Widget _buildArtwork(BuildContext context) {
    return Obx(() {
      final isBusy = _audioController.rxIsBusy.value;
      final isPlaying = _audioController.rxIsPlaying.value;
      final hasError = _audioController.rxRadioFailStreak.value >= 2;
      final waveformEnabled = _audioController.rxWaveformEnabled.value;

      return Column(
        children: [
          RadioArtCard(
            // Scales down on mini phones, caps at 360 on tablet/desktop —
            // the fixed 280 default looked oversized on small screens and
            // undersized relative to an iPad's available space.
            size: (context.screenWidth * 0.55).clamp(180.0, 360.0),
            surahId: _audioController.rxCurrentSurahId.value,
            surahNameArabic:
                _audioController.rxCurrentSurahNameArabic.value.isEmpty
                ? '...'
                : _audioController.rxCurrentSurahNameArabic.value,
            isBusy: isBusy,
            hasError: hasError,
            isPlaying: isPlaying,
            onRetry: () => _audioController.startRadio(_selectedSurahId),
          ),
          if (waveformEnabled) ...[
            const SizedBox(height: 18),
            WaveformBars(isPlaying: isPlaying && !isBusy && !hasError),
          ],
        ],
      );
    });
  }

  // A plain scrollable Column — every section renders at its natural size
  // and the whole thing scrolls if it doesn't fit, so nothing is ever
  // squeezed or clipped regardless of viewport height. This replaces an
  // earlier LayoutBuilder + ConstrainedBox(minHeight) + IntrinsicHeight +
  // Expanded combo that tried to also vertically center content on tall
  // screens — IntrinsicHeight's height computation for a Column with an
  // Expanded child doesn't reliably shrink to the *actually available*
  // space once RadioView is hosted inside AppScaffold's tab area (which has
  // materially less height than a full-screen route), so on some devices
  // the facts panel and the reciter/surah picker pills below it were being
  // squeezed into a sliver and clipped behind the bottom nav bar — visible
  // but unreadable and untappable. Trades away perfect vertical centering
  // on tall screens for guaranteed-visible, guaranteed-tappable content on
  // every screen height.
  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          _buildTopBar(context),
          const SizedBox(height: 8),
          _buildArtwork(context),
          const SizedBox(height: 24),
          _buildTrackInfo(context),
          const SizedBox(height: 16),
          _buildPlayControls(context),
          const SizedBox(height: 32),
          _buildFactsPanel(context),
          const SizedBox(height: 8),
          _buildBottomSheetButtons(context),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 1,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildTopBar(context),
              const Spacer(),
              _buildArtwork(context),
              const SizedBox(height: 32),
              _buildTrackInfo(context),
              const Spacer(),
            ],
          ),
        ),
        const VerticalDivider(width: 1, thickness: 1),
        Expanded(
          flex: 1,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              _buildPlayControls(context),
              const SizedBox(height: 64),
              _buildFactsPanel(context),
              const SizedBox(height: 32),
              _buildBottomSheetButtons(context),
              const Spacer(),
            ],
          ),
        ),
      ],
    );
  }
}
