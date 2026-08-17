import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hifz_controller.dart';

import '../../../shared/widgets/loading_skeleton.dart';

class HifzView extends GetView<HifzController> {
  const HifzView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Hifz Progress'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Surah'),
              Tab(text: 'Juz'),
            ],
          ),
        ),
        body: Obx(() {
          if (controller.isLoading.value) {
            return AppShimmer.surahList(count: 6);
          }

          return TabBarView(
            children: [
              _buildSurahList(),
              _buildJuzList(),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildSurahList() {
    final list = controller.surahProgress;
    if (list.isEmpty) return const SizedBox.shrink();

    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final progress = list[index];
        return ListTile(
          title: Text('Surah ${progress.surahId}'),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              LinearProgressIndicator(
                value: progress.percentage,
                backgroundColor: Colors.grey.withOpacity(0.2),
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 4),
              Text('${progress.memorisedCount} / ${progress.totalCount} Ayahs'),
            ],
          ),
          trailing: Text(
            '${(progress.percentage * 100).toStringAsFixed(1)}%',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        );
      },
    );
  }

  Widget _buildJuzList() {
    final list = controller.juzProgress;
    if (list.isEmpty) return const SizedBox.shrink();

    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final progress = list[index];
        return ListTile(
          title: Text('Juz ${progress.juz}'),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              LinearProgressIndicator(
                value: progress.percentage,
                backgroundColor: Colors.grey.withOpacity(0.2),
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 4),
              Text('${progress.memorisedCount} / ${progress.totalCount} Ayahs'),
            ],
          ),
          trailing: Text(
            '${(progress.percentage * 100).toStringAsFixed(1)}%',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        );
      },
    );
  }
}
