import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/audio_controller.dart';
import '../../../reader/controllers/reader_controller.dart';

class AudioPlayerSheet extends StatefulWidget {
  const AudioPlayerSheet({Key? key}) : super(key: key);

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const AudioPlayerSheet(),
    );
  }

  @override
  State<AudioPlayerSheet> createState() => _AudioPlayerSheetState();
}

class _AudioPlayerSheetState extends State<AudioPlayerSheet> {
  final AudioController _audioController = Get.find<AudioController>();
  final ReaderController? _readerController = Get.isRegistered<ReaderController>() ? Get.find<ReaderController>() : null;

  late RepeatMode _mode;
  late int _count;
  late Duration _delay;
  int? _rangeStartIdx;
  int? _rangeEndIdx;

  @override
  void initState() {
    super.initState();
    final settings = _audioController.rxRepeatSettings.value;
    _mode = settings.mode;
    _count = settings.count;
    _delay = settings.delay;
    _rangeStartIdx = settings.rangeStartIdx;
    _rangeEndIdx = settings.rangeEndIdx;
  }

  void _applySettings() {
    _audioController.setRepeatSettings(RepeatSettings(
      mode: _mode,
      count: _count,
      delay: _delay,
      rangeStartIdx: _rangeStartIdx,
      rangeEndIdx: _rangeEndIdx,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, scrollController) {
        return ListView(
          controller: scrollController,
          padding: const EdgeInsets.all(24.0),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: Theme.of(context).dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Text(
              'Repeat Settings',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 24),
            
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
            _buildSectionTitle('Mode'),
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

            if (_mode == RepeatMode.range && _readerController != null) ...[
              const SizedBox(height: 24),
              _buildSectionTitle('Ayah Range'),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      decoration: const InputDecoration(labelText: 'Start Ayah', border: OutlineInputBorder()),
                      value: _rangeStartIdx ?? 0,
                      items: List.generate(_readerController!.verses.length, (i) {
                        return DropdownMenuItem(value: i, child: Text('Ayah ${i + 1}'));
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
                      decoration: const InputDecoration(labelText: 'End Ayah', border: OutlineInputBorder()),
                      value: _rangeEndIdx ?? (_readerController!.verses.length > 0 ? _readerController!.verses.length - 1 : 0),
                      items: List.generate(_readerController!.verses.length, (i) {
                        return DropdownMenuItem(value: i, child: Text('Ayah ${i + 1}'));
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
              ),
            ],
            
            const SizedBox(height: 48),
            // Primary playback controls can also go here
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.skip_previous),
                  tooltip: 'Previous',
                  iconSize: 48,
                  onPressed: _audioController.skipToPrevious,
                ),
                const SizedBox(width: 24),
                Obx(() {
                  final isPlaying = _audioController.rxIsPlaying.value;
                  return IconButton(
                    icon: Icon(isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled),
                    tooltip: isPlaying ? 'Pause' : 'Play',
                    iconSize: 64,
                    color: Theme.of(context).colorScheme.primary,
                    onPressed: () {
                      if (isPlaying) {
                        _audioController.pause();
                      } else {
                        _audioController.play();
                      }
                    },
                  );
                }),
                const SizedBox(width: 24),
                IconButton(
                  icon: const Icon(Icons.skip_next),
                  tooltip: 'Next',
                  iconSize: 48,
                  onPressed: _audioController.skipToNext,
                ),
              ],
            )
          ],
        );
      },
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
