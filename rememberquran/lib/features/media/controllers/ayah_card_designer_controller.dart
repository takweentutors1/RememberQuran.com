import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';

class AyahCardDesignerController extends GetxController {
  final GlobalKey repaintKey = GlobalKey();
  final RxString selectedTheme = 'light'.obs;
  
  final Map<String, dynamic> ayahData = Get.arguments ?? {};

  String get textUthmani => ayahData['textUthmani'] ?? '';
  String get translation => ayahData['translation'] ?? '';
  String get reference => ayahData['reference'] ?? '';

  Future<void> shareCard() async {
    try {
      final boundary = repaintKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (boundary == null) return;
      
      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;

      final bytes = byteData.buffer.asUint8List();
      final xFile = XFile.fromData(bytes, mimeType: 'image/png', name: 'ayah_card.png');
      
      await Share.shareXFiles([xFile], text: 'Shared via RememberQuran');
    } catch (e) {
      Get.snackbar('Error', 'Failed to share Ayah card: $e');
    }
  }
}
