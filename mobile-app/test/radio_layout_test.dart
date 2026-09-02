import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:rememberquran/features/audio/views/radio_view.dart';
import 'package:rememberquran/features/audio/controllers/audio_controller.dart';
import 'package:rememberquran/data/repositories/quran_repository.dart';
import 'package:dio/dio.dart';
import 'package:rememberquran/data/datasources/local/quran_db.dart';
import 'package:rememberquran/data/datasources/remote/quran_remote_ds.dart';

import 'package:rememberquran/features/audio/services/audio_handler.dart';
import 'package:rememberquran/data/datasources/remote/audio_remote_ds.dart';
import 'package:rememberquran/data/repositories/audio_repository.dart';

void main() {
  testWidgets('RadioView fits on iPhone SE (375x667)', (WidgetTester tester) async {
    // Setup Mock dependencies
    final db = QuranDatabase();
    Get.put<QuranDatabase>(db);
    final audioRemoteDs = AudioRemoteDataSource();
    Get.put<AudioRemoteDataSource>(audioRemoteDs);
    Get.put<AudioRepository>(AudioRepository(localDb: db, remoteDs: audioRemoteDs));
    Get.put<QuranAudioHandler>(QuranAudioHandler(cacheDirPath: '/tmp'));
    Get.put<AudioController>(AudioController());
    final remoteDs = QuranRemoteDataSource(dio: Dio());
    Get.put<QuranRepository>(QuranRepository(localDb: db, remoteDs: remoteDs));
    
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
    
    // Pump a frame to settle layout (avoid infinite periodic timers in pumpAndSettle)
    await tester.pump(const Duration(milliseconds: 500));
    
    // If there is an overflow, tester.takeException() will not be null or the test will fail
    expect(tester.takeException(), isNull);
  });
}
