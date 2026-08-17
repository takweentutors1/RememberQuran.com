import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/app_scaffold_controller.dart';
import '../../features/audio/views/mini_player.dart';
import '../../features/home/views/home_view.dart';
import '../../features/audio/views/radio_view.dart';

class AppScaffold extends StatelessWidget {
  const AppScaffold({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(AppScaffoldController());

    return Scaffold(
      body: Obx(() => IndexedStack(
            index: controller.rxSelectedIndex.value,
            children: const [
              HomeView(),
              RadioView(),
            ],
          )),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Persistent Mini Player above the bottom nav
          const MiniPlayer(),
          
          Obx(() => BottomNavigationBar(
                currentIndex: controller.rxSelectedIndex.value,
                onTap: controller.setTabIndex,
                selectedItemColor: Theme.of(context).colorScheme.primary,
                unselectedItemColor: Colors.grey,
                items: const [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.home_rounded),
                    label: 'Home',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.radio_rounded),
                    label: 'Radio',
                  ),
                ],
              )),
        ],
      ),
    );
  }
}
