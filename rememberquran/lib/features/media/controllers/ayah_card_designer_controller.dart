import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:gal/gal.dart';
import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';
import '../../../shared/widgets/app_feedback.dart';

class AyahCardDesignerController extends GetxController {
  final GlobalKey repaintKey = GlobalKey();
  final RxString selectedTheme = 'light'.obs;
  final RxBool isSaving = false.obs;

  final Map<String, dynamic> ayahData = Get.arguments ?? {};

  String get textUthmani => ayahData['textUthmani'] ?? '';
  String get translation => ayahData['translation'] ?? '';
  String get reference => ayahData['reference'] ?? '';

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
      await Share.shareXFiles([xFile], text: 'Shared via RememberQuran');
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
}
