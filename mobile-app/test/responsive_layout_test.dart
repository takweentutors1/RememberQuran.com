import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:rememberquran/features/account/models/hifz_srs.dart';

void main() {
  testWidgets('HifzReviewView grade evaluation buttons wrap and fit on compact 360dp width', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;

    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 360,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Again (1d)'),
                  ),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Hard'),
                  ),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Good'),
                  ),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Easy'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    await tester.pump();
    expect(tester.takeException(), isNull);
    expect(find.text('Again (1d)'), findsOneWidget);
    expect(find.text('Hard'), findsOneWidget);
    expect(find.text('Good'), findsOneWidget);
    expect(find.text('Easy'), findsOneWidget);
  });
}
