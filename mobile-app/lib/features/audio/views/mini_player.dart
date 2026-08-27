import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/audio_controller.dart';
import '../../../core/models/reciter.dart';
import '../../../core/utils/responsive_layout.dart';
import 'widgets/audio_player_sheet.dart';

class MiniPlayer extends StatefulWidget {
  const MiniPlayer({Key? key}) : super(key: key);

  @override
  State<MiniPlayer> createState() => _MiniPlayerState();
}

class _MiniPlayerState extends State<MiniPlayer> {
  final AudioController _audioController = Get.find<AudioController>();

  /// Drives the seek bar, now shown on every screen size.
  Timer? _seekBarTicker;
  Worker? _playingWorker;

  @override
  void initState() {
    super.initState();
    _playingWorker = ever<bool>(_audioController.rxIsPlaying, _syncTicker);
    _syncTicker(_audioController.rxIsPlaying.value);
  }

  void _syncTicker(bool isPlaying) {
    _seekBarTicker?.cancel();
    _seekBarTicker = null;
    if (!isPlaying) return;
    // 500ms is plenty for a compact mini-player progress line — this isn't
    // a drag target, just a glanceable indicator.
    _seekBarTicker = Timer.periodic(const Duration(milliseconds: 500), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _seekBarTicker?.cancel();
    _playingWorker?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final isPlaying = _audioController.rxIsPlaying.value;
      final isRadioMode = _audioController.rxIsRadioMode.value;
      final isBusy = _audioController.rxIsBusy.value;
      final hasAudio = _audioController.rxHasAudio.value;

      // Hide completely if nothing has been loaded/started
      if (!hasAudio) {
        return const SizedBox.shrink();
      }

      final surahName = _audioController.rxCurrentSurahName.value;
      final reciter = getReciter(_audioController.rxCurrentReciterId.value);

      return GestureDetector(
        onTap: () => AudioPlayerSheet.show(context),
        child: Container(
          margin: EdgeInsets.symmetric(
            horizontal: context.rv(mobile: 16.0, tablet: 32.0, desktop: 64.0),
            vertical: 8,
          ),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Full-bleed, flush against the rounded top corners — shown
              // on every screen size now. This used to be hidden entirely
              // on mobile ("only makes sense once there's room for it
              // beside the transport controls"), which meant phone users —
              // the primary audience — got zero visual playback-progress
              // feedback from the mini player at all.
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: _buildSeekBar(context),
              ),
              SizedBox(
                height: 72,
                child: Row(
                  children: [
                    const SizedBox(width: 16),
                    // Cover / Icon
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Theme.of(
                          context,
                        ).colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        isRadioMode ? Icons.radio : Icons.audiotrack,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Title
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isPlaying) ...[
                                _LiveDot(color: Theme.of(context).colorScheme.primary),
                                const SizedBox(width: 6),
                              ],
                              Flexible(
                                child: Text(
                                  isRadioMode
                                      ? 'Surah ${surahName.isNotEmpty ? surahName : _audioController.rxCurrentSurahId.value}'
                                      : '${surahName.isNotEmpty ? surahName : ''} - Ayah ${_audioController.rxCurrentAyahIndex.value}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: context.responsiveBaseTextSize,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            isRadioMode
                                ? 'Radio • ${reciter.name}'
                                : 'Recitation • ${reciter.name}',
                            style: TextStyle(
                              fontSize: context.responsiveBaseTextSize,
                              color: Theme.of(
                                context,
                              ).textTheme.bodySmall?.color,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    // Controls
                    IconButton(
                      icon: const Icon(Icons.skip_previous_rounded),
                      tooltip: isRadioMode ? 'Previous surah' : 'Previous ayah',
                      iconSize: 22,
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      constraints: const BoxConstraints(
                        minWidth: 32,
                        minHeight: 32,
                      ),
                      onPressed: isBusy
                          ? null
                          : () {
                              if (isRadioMode) {
                                _audioController.radioSkipToPrevious();
                              } else {
                                _audioController.skipToPrevious();
                              }
                            },
                    ),
                    if (isBusy)
                      const Padding(
                        padding: EdgeInsets.all(16.0),
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    else
                      IconButton(
                        icon: Icon(
                          isPlaying
                              ? Icons.pause_rounded
                              : Icons.play_arrow_rounded,
                        ),
                        tooltip: isPlaying ? 'Pause' : 'Play',
                        color: Theme.of(context).colorScheme.primary,
                        iconSize: 32,
                        onPressed: () {
                          if (isPlaying) {
                            _audioController.pause();
                          } else {
                            _audioController.play();
                          }
                        },
                      ),
                    IconButton(
                      icon: const Icon(Icons.skip_next_rounded),
                      tooltip: isRadioMode ? 'Next surah' : 'Next ayah',
                      iconSize: 22,
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      constraints: const BoxConstraints(
                        minWidth: 32,
                        minHeight: 32,
                      ),
                      onPressed: isBusy
                          ? null
                          : () {
                              if (isRadioMode) {
                                _audioController.radioSkipToNext();
                              } else {
                                _audioController.skipToNext();
                              }
                            },
                    ),
                    IconButton(
                      icon: const Icon(Icons.tune_rounded),
                      tooltip: 'Playback settings',
                      color: Theme.of(context).textTheme.bodySmall?.color,
                      iconSize: 20,
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      constraints: const BoxConstraints(
                        minWidth: 28,
                        minHeight: 28,
                      ),
                      onPressed: () => AudioPlayerSheet.show(context, expandSettings: true),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      tooltip: 'Stop',
                      color: Theme.of(context).textTheme.bodySmall?.color,
                      iconSize: 20,
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      constraints: const BoxConstraints(
                        minWidth: 28,
                        minHeight: 28,
                      ),
                      onPressed: _audioController.stop,
                    ),
                    const SizedBox(width: 4),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildSeekBar(BuildContext context) {
    final position = _audioController.currentPlaybackState.position;
    final duration =
        _audioController.currentMediaItem?.duration ?? Duration.zero;
    final progress = duration.inMilliseconds > 0
        ? (position.inMilliseconds / duration.inMilliseconds).clamp(0.0, 1.0)
        : 0.0;

    return LinearProgressIndicator(
      value: progress,
      minHeight: 3,
      backgroundColor: Theme.of(context).colorScheme.outline.withValues(alpha: 0.15),
      color: Theme.of(context).colorScheme.primary,
    );
  }
}

/// A slow, calm 1200ms opacity pulse — the one ambient motion exception the
/// design system allows, reserved for exactly this: signalling "this is
/// live/playing right now" next to the track title.
class _LiveDot extends StatefulWidget {
  final Color color;
  const _LiveDot({required this.color});

  @override
  State<_LiveDot> createState() => _LiveDotState();
}

class _LiveDotState extends State<_LiveDot> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween(begin: 0.35, end: 1.0).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
      ),
      child: Container(
        width: 6,
        height: 6,
        decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
      ),
    );
  }
}
