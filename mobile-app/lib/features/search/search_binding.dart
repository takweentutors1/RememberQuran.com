import 'package:get/get.dart';
import 'package:rememberquran/features/search/controllers/search_controller.dart' as my_search;

/// Registers [SearchController] exactly once when the Search route is pushed,
/// and lets GetX clean it up automatically when the route is destroyed.
///
/// Previously the controller was registered inside [SearchView.build], which
/// re-ran [Get.put] on every rebuild — risking duplicate instances and
/// leaking the old one if the widget rebuilt before the route was popped.
class SearchBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<my_search.SearchController>(
      () => my_search.SearchController(),
    );
  }
}
