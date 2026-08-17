import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/audio_controller.dart';
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
      
      // If nothing is playing and not busy, we might optionally hide it.
      // For now, let's just always show it if the queue isn't completely empty.
      // As a simple placeholder, we'll just check if it's busy or playing or if there's an active context.
      // As a simple placeholder, we'll just check if it's busy or playing or if there's an active context.
      
      return GestureDetector(
        onTap: () => AudioPlayerSheet.show(context),
        child: Container(
          height: 64,
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
                    isRadioMode ? 'Surah ${audioController.rxCurrentSurahId.value}' : 'Ayah ${audioController.rxCurrentAyahIndex.value}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    isRadioMode ? 'Radio Mode' : 'Recitation',
                    style: TextStyle(
                      fontSize: 12,
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
