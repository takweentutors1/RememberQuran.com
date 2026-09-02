import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/audio_controller.dart';
import '../../../reader/controllers/reader_controller.dart';
import '../../../../core/models/reciter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../../widgets/reciter_selector.dart';
import 'radio_art_card.dart';
import 'sleep_timer_sheet.dart';

class AudioPlayerSheet extends StatefulWidget {
  final bool expandSettings;

  const AudioPlayerSheet({Key? key, this.expandSettings = false}) : super(key: key);

  /// [expandSettings] opens straight to Playback Settings pre-expanded — the
  /// mini player's settings shortcut uses this so a user reaching for
  /// speed/repeat doesn't have to open the sheet and then also find and tap
  /// the collapsed "Playback Settings" tile before seeing any controls.
  static void show(BuildContext context, {bool expandSettings = false}) {
    showResponsiveSheet(
      context: context,
      builder: (_) => AudioPlayerSheet(expandSettings: expandSettings),
    );
  }

  @override
  State<AudioPlayerSheet> createState() => _AudioPlayerSheetState();
}

class _AudioPlayerSheetState extends State<AudioPlayerSheet> {
  final AudioController _audioController = Get.find<AudioController>();
  final ReaderController? _readerController =
      Get.isRegistered<ReaderController>()
      ? Get.find<ReaderController>()
      : null;

  late RepeatMode _mode;
  late int _count;
  late Duration _delay;
  int? _rangeStartIdx;
  int? _rangeEndIdx;

  /// Non-null while the user is dragging the seek bar — overrides the live
  /// stream value so the thumb doesn't jump back mid-drag.
  Duration? _dragPosition;

  /// Forces a rebuild ~30x/sec while playing so the seek bar reads
  /// [AudioController.currentPlaybackState] often enough to look smooth.
  /// That getter already interpolates position from elapsed wall-clock
  /// time, so ticking faster is the only thing needed — no separate
  /// position state to keep in sync with the underlying stream.
  Timer? _smoothTicker;
  Worker? _playingWorker;

  @override
  void initState() {
    super.initState();
    final settings = _audioController.rxRepeatSettings.value;
    _mode = settings.mode;
    _count = settings.count;
    _delay = settings.delay;
    _rangeStartIdx = settings.rangeStartIdx;
    _rangeEndIdx = settings.rangeEndIdx;

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
      // Nothing to recompute here — build() reads the interpolated position
      // fresh each time. This tick's only job is to trigger that rebuild.
      setState(() {});
    });
  }

  @override
  void dispose() {
    _smoothTicker?.cancel();
    _playingWorker?.dispose();
    super.dispose();
  }

  void _applySettings() {
    _audioController.setRepeatSettings(
      RepeatSettings(
        mode: _mode,
        count: _count,
        delay: _delay,
        rangeStartIdx: _rangeStartIdx,
        rangeEndIdx: _rangeEndIdx,
      ),
    );
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

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      expand: false,
      builder: (_, scrollController) {
        // showResponsiveSheet's modal route is transparent — this needs to
        // paint its own background rather than rely on the route's default.
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).dividerColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              _buildNowPlayingHeader(context),
              const SizedBox(height: 20),
              _buildSeekBar(context),
              const SizedBox(height: 12),
              _buildTransportControls(context),
              const SizedBox(height: 28),
              _buildSettingsSection(context),
            ],
          ),
        );
      },
    );
  }

  // --- Now Playing ---------------------------------------------------

  Widget _buildNowPlayingHeader(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    return Obx(() {
      final surahId = _audioController.rxCurrentSurahId.value;
      final nameEn = _audioController.rxCurrentSurahName.value;
      final nameAr = _audioController.rxCurrentSurahNameArabic.value;
      final reciter = getReciter(_audioController.rxCurrentReciterId.value);
      final isPlaying = _audioController.rxIsPlaying.value;
      final isBusy = _audioController.rxIsBusy.value;

      return Column(
        children: [
          Center(
            child: RadioArtCard(
              size: 160,
              surahId: surahId,
              surahNameArabic: nameAr.isEmpty ? '...' : nameAr,
              isBusy: isBusy,
              hasError: false,
              isPlaying: isPlaying,
              onRetry: () {},
            ),
          ),
          const SizedBox(height: 16),
          Text(
            nameEn.isEmpty ? 'Surah $surahId' : nameEn,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => showReciterPicker(
              context: context,
              selectedReciterId: _audioController.rxCurrentReciterId.value,
              onReciterSelected: _audioController.changeReciter,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    reciter.name,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: brandGold,
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(width: 2),
                  Icon(Icons.expand_more, size: 18, color: brandGold),
                ],
              ),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildSeekBar(BuildContext context) {
    final theme = Theme.of(context);
    return StreamBuilder<MediaItem?>(
      stream: _audioController.mediaItemStream,
      initialData: _audioController.currentMediaItem,
      builder: (context, mediaSnap) {
        final mediaDuration = mediaSnap.data?.duration ?? Duration.zero;
        return Obx(() {
          final knownDuration = _audioController.rxKnownDuration.value ?? Duration.zero;
          final duration = mediaDuration > Duration.zero ? mediaDuration : knownDuration;
          return StreamBuilder<PlaybackState>(
            stream: _audioController.playbackStateStream,
            initialData: _audioController.currentPlaybackState,
            builder: (context, stateSnap) {
              final livePosition = _audioController.currentPlaybackState.position;
              final position = _dragPosition ?? livePosition;
              final totalMs = duration.inMilliseconds.toDouble();
              final hasDuration = totalMs > 0;
              final clampedMs = hasDuration
                  ? position.inMilliseconds
                        .toDouble()
                        .clamp(0, totalMs)
                        .toDouble()
                  : 0.0;

              return Column(
                children: [
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 3,
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
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatDuration(
                            Duration(milliseconds: clampedMs.toInt()),
                          ),
                          style: theme.textTheme.bodySmall,
                        ),
                        Text(
                          _formatDuration(duration),
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          );
        });
      },
    );
  }

  Widget _buildTransportControls(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Sleep timer action button on the left
        SizedBox(
          width: 48,
          child: Obx(() {
            final timerActive = _audioController.rxSleepTimerMode.value !=
                SleepTimerMode.off;
            final remaining = _audioController.rxSleepTimerRemaining.value;
            final nurColors = theme.extension<NurColorsExtension>();
            final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

            return IconButton(
              icon: Icon(
                timerActive
                    ? Icons.bedtime_rounded
                    : Icons.bedtime_outlined,
              ),
              tooltip: timerActive
                  ? 'Sleep timer ($remaining)'
                  : 'Sleep timer',
              iconSize: 26,
              color: timerActive ? brandGold : theme.colorScheme.outline,
              onPressed: () => SleepTimerSheet.show(context),
            );
          }),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.skip_previous_rounded),
              tooltip: 'Previous ayah',
              iconSize: 36,
              onPressed: _audioController.skipToPrevious,
            ),
            const SizedBox(width: 12),
            Obx(() {
              final isPlaying = _audioController.rxIsPlaying.value;
              final isBusy = _audioController.rxIsBusy.value;
              return SizedBox(
                width: 72,
                height: 72,
                child: isBusy
                    ? const Padding(
                        padding: EdgeInsets.all(22),
                        child: CircularProgressIndicator(strokeWidth: 3),
                      )
                    : IconButton.filled(
                        iconSize: 36,
                        icon: Icon(
                          isPlaying
                              ? Icons.pause_rounded
                              : Icons.play_arrow_rounded,
                        ),
                        onPressed: () {
                          if (isPlaying) {
                            _audioController.pause();
                          } else {
                            _audioController.play();
                          }
                        },
                      ),
              );
            }),
            const SizedBox(width: 12),
            IconButton(
              icon: const Icon(Icons.skip_next_rounded),
              tooltip: 'Next ayah',
              iconSize: 36,
              onPressed: _audioController.skipToNext,
            ),
          ],
        ),
        SizedBox(
          width: 48,
          child: IconButton(
            icon: const Icon(Icons.stop_rounded),
            tooltip: 'Stop',
            iconSize: 26,
            color: theme.colorScheme.outline,
            onPressed: _audioController.stopPlayback,
          ),
        ),
      ],
    );
  }

  // --- Settings (collapsible) -----------------------------------------

  Widget _buildSettingsSection(BuildContext context) {
    return Theme(
      // ExpansionTile draws a divider by default — suppress it so it sits
      // flush inside the sheet instead of looking like a stray line.
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: widget.expandSettings,
        tilePadding: EdgeInsets.zero,
        title: const Text(
          'Playback Settings',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        childrenPadding: const EdgeInsets.only(top: 8, bottom: 8),
        children: [
          _buildSectionTitle('Playback Speed'),
          Obx(() {
            final currentSpeed = _audioController.rxPlaybackSpeed.value;
            return SegmentedButton<double>(
              segments: const [
                ButtonSegment(value: 0.5, label: Text('0.5x')),
                ButtonSegment(value: 1.0, label: Text('1x')),
                ButtonSegment(value: 1.5, label: Text('1.5x')),
                ButtonSegment(value: 2.0, label: Text('2x')),
              ],
              selected: {currentSpeed},
              onSelectionChanged: (set) {
                _audioController.setSpeed(set.first);
              },
            );
          }),

          const SizedBox(height: 24),
          _buildSectionTitle('Repeat Mode'),
          SegmentedButton<RepeatMode>(
            segments: const [
              ButtonSegment(value: RepeatMode.none, label: Text('None')),
              ButtonSegment(value: RepeatMode.ayah, label: Text('Single Ayah')),
              ButtonSegment(value: RepeatMode.range, label: Text('Range')),
            ],
            selected: {_mode},
            onSelectionChanged: (set) {
              setState(() => _mode = set.first);
              _applySettings();
            },
          ),

          if (_mode != RepeatMode.none) ...[
            const SizedBox(height: 24),
            _buildSectionTitle('Repeat Count (${_count}x)'),
            Slider(
              value: _count.toDouble(),
              min: 1,
              max: 10,
              divisions: 9,
              label: _count.toString(),
              onChanged: (val) {
                setState(() => _count = val.toInt());
                _applySettings();
              },
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('Pause Delay (${_delay.inSeconds}s)'),
            Slider(
              value: _delay.inSeconds.toDouble(),
              min: 0,
              max: 10,
              divisions: 10,
              label: '${_delay.inSeconds}s',
              onChanged: (val) {
                setState(() => _delay = Duration(seconds: val.toInt()));
                _applySettings();
              },
            ),
          ],

          if (_mode == RepeatMode.range) ...[
            const SizedBox(height: 24),
            _buildSectionTitle('Ayah Range'),
            Obx(() {
              final totalVerses = _readerController != null && _readerController!.verses.isNotEmpty
                  ? _readerController!.verses.length
                  : _audioController.rxCurrentSurahVersesCount.value;
              final count = totalVerses > 0 ? totalVerses : 7;
              return Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      decoration: const InputDecoration(
                        labelText: 'Start Ayah',
                        border: OutlineInputBorder(),
                      ),
                      value: (_rangeStartIdx != null && _rangeStartIdx! < count) ? _rangeStartIdx : 0,
                      items: List.generate(count, (i) {
                        return DropdownMenuItem(
                          value: i,
                          child: Text('Ayah ${i + 1}'),
                        );
                      }),
                      onChanged: (val) {
                        setState(() => _rangeStartIdx = val);
                        if ((_rangeEndIdx ?? -1) < val!) {
                          _rangeEndIdx = val;
                        }
                        _applySettings();
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      decoration: const InputDecoration(
                        labelText: 'End Ayah',
                        border: OutlineInputBorder(),
                      ),
                      value: (_rangeEndIdx != null && _rangeEndIdx! < count)
                          ? _rangeEndIdx
                          : (count > 0 ? count - 1 : 0),
                      items: List.generate(count, (i) {
                        return DropdownMenuItem(
                          value: i,
                          child: Text('Ayah ${i + 1}'),
                        );
                      }),
                      onChanged: (val) {
                        setState(() => _rangeEndIdx = val);
                        if ((_rangeStartIdx ?? 9999) > val!) {
                          _rangeStartIdx = val;
                        }
                        _applySettings();
                      },
                    ),
                  ),
                ],
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
    );
  }
}
