import 'package:get/get.dart';

class AppScaffoldController extends GetxController {
  final rxSelectedIndex = 0.obs;

  static const List<String> tabLabels = [
    'Home',
    'Radio',
    'Search',
    'Study',
    'Account',
  ];

  void setTabIndex(int index) {
    rxSelectedIndex.value = index;
  }
}
