import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/app_scaffold_controller.dart';
import '../../features/audio/views/mini_player.dart';
import '../../features/home/views/home_view.dart';
import '../../features/audio/views/radio_view.dart';
import '../../features/search/views/search_view.dart';
import '../../features/account/views/account_home_view.dart';
import '../../core/utils/responsive_layout.dart';

class AppScaffold extends StatelessWidget {
  const AppScaffold({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(AppScaffoldController());

    return Scaffold(
      body: ResponsiveLayout(
        mobile: _buildMobileLayout(context, controller),
        tablet: _buildDesktopLayout(context, controller),
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context, AppScaffoldController controller) {
    return Column(
      children: [
        Expanded(
          child: Obx(() => IndexedStack(
                index: controller.rxSelectedIndex.value,
                children: const [
                  HomeView(),
                  RadioView(),
                  SearchView(),
                  AccountHomeView(),
                ],
              )),
        ),
        // The Radio tab is its own full player (art card, play/pause,
        // skip controls) — showing the MiniPlayer on top of it duplicates
        // those controls, so hide it only while that tab is selected.
        Obx(() => controller.rxSelectedIndex.value == 1
            ? const SizedBox.shrink()
            : const MiniPlayer()),
        Obx(() => BottomNavigationBar(
              type: BottomNavigationBarType.fixed,
              currentIndex: controller.rxSelectedIndex.value,
              onTap: controller.setTabIndex,
              selectedItemColor: Theme.of(context).colorScheme.primary,
              unselectedItemColor: Colors.grey,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
                BottomNavigationBarItem(icon: Icon(Icons.radio_rounded), label: 'Radio'),
                BottomNavigationBarItem(icon: Icon(Icons.search_rounded), label: 'Search'),
                BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Account'),
              ],
            )),
      ],
    );
  }

  Widget _buildDesktopLayout(BuildContext context, AppScaffoldController controller) {
    return Column(
      children: [
        Expanded(
          child: Row(
            children: [
              Obx(() => NavigationRail(
                    selectedIndex: controller.rxSelectedIndex.value,
                    onDestinationSelected: controller.setTabIndex,
                    labelType: NavigationRailLabelType.all,
                    selectedIconTheme: IconThemeData(color: Theme.of(context).colorScheme.primary),
                    selectedLabelTextStyle: TextStyle(color: Theme.of(context).colorScheme.primary),
                    destinations: const [
                      NavigationRailDestination(icon: Icon(Icons.home_rounded), label: Text('Home')),
                      NavigationRailDestination(icon: Icon(Icons.radio_rounded), label: Text('Radio')),
                      NavigationRailDestination(icon: Icon(Icons.search_rounded), label: Text('Search')),
                      NavigationRailDestination(icon: Icon(Icons.person_rounded), label: Text('Account')),
                    ],
                  )),
              const VerticalDivider(thickness: 1, width: 1),
              Expanded(
                child: Obx(() => IndexedStack(
                      index: controller.rxSelectedIndex.value,
                      children: const [
                        HomeView(),
                        RadioView(),
                        SearchView(),
                        AccountHomeView(),
                      ],
                    )),
              ),
            ],
          ),
        ),
        Obx(() => controller.rxSelectedIndex.value == 1
            ? const SizedBox.shrink()
            : const MiniPlayer()),
      ],
    );
  }
}
