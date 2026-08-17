import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../controllers/progress_controller.dart';
import '../../../core/theme/app_colors.dart';

class ProgressView extends GetView<ProgressController> {
  const ProgressView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('My Progress', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.last30Days.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        return RefreshIndicator(
          onRefresh: controller.refreshProgress,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(theme),
                const SizedBox(height: 32),
                _buildChartCard(theme, isDark),
                const SizedBox(height: 24),
                _buildStatsGrid(theme, isDark),
                const SizedBox(height: 40),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Last 30 Days',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Obx(() => Text(
          '${controller.totalAyahs30Days.value} Ayahs Read',
          style: theme.textTheme.titleMedium?.copyWith(
            color: theme.colorScheme.primary,
            fontWeight: FontWeight.w600,
          ),
        )),
      ],
    );
  }

  Widget _buildChartCard(ThemeData theme, bool isDark) {
    return Container(
      width: double.infinity,
      height: 220,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Reading Volume',
            style: TextStyle(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Obx(() {
              if (controller.last30Days.isEmpty) return const SizedBox();
              
              int maxAyahs = 0;
              for (var data in controller.last30Days) {
                if (data.ayahsRead > maxAyahs) maxAyahs = data.ayahsRead;
              }
              if (maxAyahs == 0) maxAyahs = 10; // default scale
              
              return Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: controller.last30Days.map((data) {
                  final heightFactor = data.ayahsRead / maxAyahs;
                  final isToday = _isSameDay(data.date, DateTime.now());
                  
                  return Tooltip(
                    message: '${DateFormat('MMM d').format(data.date)}\n${data.ayahsRead} Ayahs',
                    child: Container(
                      width: 6,
                      height: double.infinity,
                      alignment: Alignment.bottomCenter,
                      child: FractionallySizedBox(
                        heightFactor: heightFactor > 0 ? heightFactor : 0.02,
                        child: Container(
                          decoration: BoxDecoration(
                            color: data.ayahsRead > 0 
                              ? (isToday ? theme.colorScheme.primary : theme.colorScheme.primary.withOpacity(0.5))
                              : theme.colorScheme.onSurface.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(ThemeData theme, bool isDark) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            theme, 
            isDark, 
            'Avg / Day', 
            Obx(() => Text(
              controller.avgAyahsPerDay.value.toStringAsFixed(1),
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            )),
            Icons.analytics_rounded,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            theme, 
            isDark, 
            'Most Active', 
            Obx(() => Text(
              controller.mostActiveDay.value,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            )),
            Icons.local_fire_department_rounded,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(ThemeData theme, bool isDark, String title, Widget valueWidget, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: theme.colorScheme.primary, size: 28),
          const SizedBox(height: 16),
          valueWidget,
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}
