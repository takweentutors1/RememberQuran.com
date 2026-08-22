import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:rememberquran/features/audio/views/radio_view.dart';
import 'package:rememberquran/features/audio/controllers/audio_controller.dart';
import 'package:rememberquran/data/repositories/quran_repository.dart';

void main() {
  testWidgets('RadioView fits on iPhone SE (375x667)', (WidgetTester tester) async {
    // Setup Mock controllers
    Get.put<AudioController>(AudioController());
    Get.put<QuranRepository>(QuranRepository());
    
    // Set surface size to iPhone SE
    tester.view.physicalSize = const Size(375, 667);
    tester.view.devicePixelRatio = 1.0;
    
    // Add teardown
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: RadioView(),
        ),
      ),
    );
    
    // Wait for animations and timers
    await tester.pumpAndSettle();
    
    // If there is an overflow, tester.takeException() will not be null or the test will fail
    expect(tester.takeException(), isNull);
  });
}
