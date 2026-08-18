import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/audio_controller.dart';
import '../../../core/models/reciter.dart';
import 'widgets/audio_player_sheet.dart';

class MiniPlayer extends StatelessWidget {
  const MiniPlayer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final audioController = Get.find<AudioController>();

    return Obx(() {
      final isPlaying = audioController.rxIsPlaying.value;
      final isRadioMode = audioController.rxIsRadioMode.value;
      final isBusy = audioController.rxIsBusy.value;
      final hasAudio = audioController.rxHasAudio.value;
      
      // Hide completely if nothing has been loaded/started
      if (!hasAudio) {
        return const SizedBox.shrink();
      }
      
      final surahName = audioController.rxCurrentSurahName.value;
      final reciter = getReciter(audioController.rxCurrentReciterId.value);
      
      return GestureDetector(
        onTap: () => AudioPlayerSheet.show(context),
        child: Container(
          height: 72,
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
        child: Row(
          children: [
            const SizedBox(width: 16),
            // Cover / Icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
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
                  Text(
                    isRadioMode ? 'Surah ${surahName.isNotEmpty ? surahName : audioController.rxCurrentSurahId.value}' 
                                : '${surahName.isNotEmpty ? surahName : ''} - Ayah ${audioController.rxCurrentAyahIndex.value}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    isRadioMode ? 'Radio • ${reciter.name}' : 'Recitation • ${reciter.name}',
                    style: TextStyle(
                      fontSize: 18,
                      color: Theme.of(context).textTheme.bodySmall?.color,
                    ),
                  ),
                ],
              ),
            ),
            // Controls
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
                icon: Icon(isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded),
                tooltip: isPlaying ? 'Pause' : 'Play',
                color: Theme.of(context).colorScheme.primary,
                iconSize: 32,
                onPressed: () {
                  if (isPlaying) {
                    audioController.pause();
                  } else {
                    audioController.play();
                  }
                },
              ),
            const SizedBox(width: 8),
          ],
        ),
        ),
      );
    });
  }
}
