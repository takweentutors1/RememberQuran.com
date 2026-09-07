import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:ffmpeg_kit_flutter_new_full/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_new_full/return_code.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:gal/gal.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../shared/widgets/app_feedback.dart';

class AyahCardDesignerController extends GetxController {
  final GlobalKey repaintKey = GlobalKey();
  final RxString selectedTheme = 'minimal'.obs;
  final RxBool isSaving = false.obs;
  final RxBool isExportingVideo = false.obs;

  void selectTheme(String id) {
    selectedTheme.value = id;
  }

  final Map<String, dynamic> ayahData = Get.arguments ?? {};

  String get textUthmani => ayahData['textUthmani'] ?? '';
  String get translation => ayahData['translation'] ?? '';
  String get reference => ayahData['reference'] ?? '';
  int? get chapterId => ayahData['chapterId'] as int?;
  int? get verseNumber => ayahData['verseNumber'] as int?;

  /// Renders the card to PNG bytes — the shared capture step behind both
  /// [shareCard] and [saveToGallery]. Returns null (rather than throwing)
  /// if the boundary isn't ready yet; callers decide how to surface that.
  Future<Uint8List?> _capturePng() async {
    final boundary =
        repaintKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    if (boundary == null) return null;

    final image = await boundary.toImage(pixelRatio: 3.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    if (byteData == null) return null;

    return byteData.buffer.asUint8List();
  }

  Future<void> shareCard() async {
    try {
      final bytes = await _capturePng();
      if (bytes == null) return;

      final xFile = XFile.fromData(bytes, mimeType: 'image/png', name: 'ayah_card.png');
      await SharePlus.instance.share(
        ShareParams(files: [xFile], text: 'Shared via RememberQuran'),
      );
    } catch (e) {
      AppFeedback.showError('Unable to share the Ayah card at this moment. Please try again.');
    }
  }

  /// Saves the card directly to the device's photo gallery — previously the
  /// only export option was the share sheet, with no way to just keep the
  /// image without picking a share target.
  Future<void> saveToGallery() async {
    if (isSaving.value) return;
    isSaving.value = true;
    try {
      final bytes = await _capturePng();
      if (bytes == null) {
        AppFeedback.showError('Unable to save the Ayah card at this moment. Please try again.');
        return;
      }

      final hasAccess = await Gal.hasAccess() || await Gal.requestAccess();
      if (!hasAccess) {
        AppFeedback.showError(
          'Allow photo library access in Settings to save ayah cards.',
          title: 'Permission needed',
        );
        return;
      }

      await Gal.putImageBytes(bytes, name: 'rememberquran_ayah_card');
      AppFeedback.showSuccess('Ayah card saved to your gallery.', title: 'Saved');
    } on GalException catch (e) {
      AppFeedback.showError(e.type.message);
    } catch (e) {
      AppFeedback.showError('Unable to save the Ayah card at this moment. Please try again.');
    } finally {
      isSaving.value = false;
    }
  }

  /// Per-ayah recitation MP3 candidates, same fallback chain (and order) the
  /// web app's media-maker audio route uses — EveryAyah's 128kbps mirror
  /// first, then quran.com's CDN, then EveryAyah's lower-bitrate mirror.
  List<String> _audioUrlCandidates(int surah, int ayah) {
    final s = surah.toString().padLeft(3, '0');
    final a = ayah.toString().padLeft(3, '0');
    return [
      'https://everyayah.com/data/Alafasy_128kbps/$s$a.mp3',
      'https://verses.qurancdn.com/Alafasy/mp3/$s$a.mp3',
      'https://everyayah.com/data/Alafasy_64kbps/$s$a.mp3',
    ];
  }

  Future<Uint8List?> _fetchAyahAudio(int surah, int ayah) async {
    for (final url in _audioUrlCandidates(surah, ayah)) {
      try {
        final response = await http
            .get(Uri.parse(url))
            .timeout(const Duration(seconds: 20));
        if (response.statusCode == 200 && response.bodyBytes.isNotEmpty) {
          return response.bodyBytes;
        }
      } catch (_) {
        // Try the next mirror.
      }
    }
    return null;
  }

  /// Exports the card as a WebM video: the same PNG capture used for
  /// share/save, looped as the picture track behind the ayah's recitation
  /// audio (VP9 video + Opus audio — no GPL-licensed codecs). Ends with the
  /// share sheet so the user can save it wherever they like, matching how
  /// the web app's "Export Video" download works.
  Future<void> exportVideo() async {
    if (isExportingVideo.value) return;
    final surah = chapterId;
    final ayah = verseNumber;
    if (surah == null || ayah == null) {
      AppFeedback.showError('Unable to export video for this ayah. Please try again.');
      return;
    }

    isExportingVideo.value = true;
    File? pngFile;
    File? audioFile;
    try {
      final imageBytes = await _capturePng();
      if (imageBytes == null) {
        AppFeedback.showError('Unable to export the Ayah card at this moment. Please try again.');
        return;
      }

      final audioBytes = await _fetchAyahAudio(surah, ayah);
      if (audioBytes == null) {
        AppFeedback.showError(
          'Unable to download recitation audio for this ayah. Please check your connection and try again.',
        );
        return;
      }

      final tempDir = await getTemporaryDirectory();
      final stamp = DateTime.now().millisecondsSinceEpoch;
      pngFile = File('${tempDir.path}/ayah_card_$stamp.png');
      audioFile = File('${tempDir.path}/ayah_audio_$stamp.mp3');
      final outputPath = '${tempDir.path}/ayah_card_$stamp.webm';

      await pngFile.writeAsBytes(imageBytes);
      await audioFile.writeAsBytes(audioBytes);

      final session = await FFmpegKit.executeWithArguments([
        '-y',
        '-loop', '1',
        '-i', pngFile.path,
        '-i', audioFile.path,
        '-c:v', 'libvpx-vp9',
        '-tune', 'stillimage',
        '-b:v', '1M',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'libopus',
        '-shortest',
        outputPath,
      ]);

      final returnCode = await session.getReturnCode();
      if (!ReturnCode.isSuccess(returnCode)) {
        AppFeedback.showError('Unable to render the video. Please try again.');
        return;
      }

      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(outputPath, mimeType: 'video/webm', name: 'ayah_card.webm')],
          text: 'Shared via RememberQuran',
        ),
      );
    } catch (e) {
      AppFeedback.showError('Unable to export the video at this moment. Please try again.');
    } finally {
      isExportingVideo.value = false;
      // Only the source PNG/MP3 are cleaned up here — the rendered .webm is
      // left in the temp dir since the share sheet may still be reading it
      // asynchronously; the OS reclaims temp storage on its own schedule.
      unawaited(pngFile?.delete());
      unawaited(audioFile?.delete());
    }
  }
}
