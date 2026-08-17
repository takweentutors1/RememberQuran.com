import 'package:get/get.dart';

class AppScaffoldController extends GetxController {
  final rxSelectedIndex = 0.obs;

  void setTabIndex(int index) {
    rxSelectedIndex.value = index;
  }
}
