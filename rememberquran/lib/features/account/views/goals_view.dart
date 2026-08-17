import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rememberquran/core/theme/app_theme.dart';
import 'package:rememberquran/core/theme/app_colors.dart';
import 'package:rememberquran/data/models/goal.dart';
import 'package:rememberquran/features/account/controllers/goals_controller.dart';

class GoalsView extends GetView<GoalsController> {
  const GoalsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Goals'),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final snapshot = controller.snapshot.value;
        if (snapshot == null || snapshot.goal == null) {
          return _buildNoGoalView(context);
        }

        return _buildGoalDashboard(context, snapshot);
      }),
    );
  }

  Widget _buildNoGoalView(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.track_changes_rounded,
              size: 80,
              color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
            ),
            const SizedBox(height: 24),
            Text(
              'Set a Daily Goal',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              'Build a consistent reading habit by setting a daily goal for Ayahs or Pages.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: () => _showSetGoalBottomSheet(context),
              icon: const Icon(Icons.add),
              label: const Text('Create Goal'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGoalDashboard(BuildContext context, GoalSnapshot snapshot) {
    return RefreshIndicator(
      onRefresh: controller.loadGoalData,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildStreakCard(context, snapshot),
          const SizedBox(height: 20),
          _buildProgressCard(context, snapshot),
          const SizedBox(height: 20),
          _buildWeeklyActivity(context, snapshot),
          const SizedBox(height: 32),
          OutlinedButton.icon(
            onPressed: () => _showSetGoalBottomSheet(context),
            icon: const Icon(Icons.edit),
            label: const Text('Change Goal'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Clear Goal'),
                  content: const Text('Are you sure you want to remove your daily goal?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    FilledButton(
                      onPressed: () {
                        controller.clearGoal();
                        Navigator.pop(context);
                      },
                      style: FilledButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.error,
                        foregroundColor: Theme.of(context).colorScheme.onError,
                      ),
                      child: const Text('Clear'),
                    ),
                  ],
                ),
              );
            },
            child: Text(
              'Clear Goal',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStreakCard(BuildContext context, GoalSnapshot snapshot) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.4),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: Text(
              '🔥',
              style: const TextStyle(fontSize: 32),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${snapshot.streak.currentStreak} Day Streak',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Longest: ${snapshot.streak.longestStreak} Days',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context)
                            .colorScheme
                            .onPrimaryContainer
                            .withOpacity(0.7),
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressCard(BuildContext context, GoalSnapshot snapshot) {
    final nurColors = Theme.of(context).extension<NurColorsExtension>()!;
    final target = snapshot.goal!.target;
    final current = snapshot.todayCount;
    final progress = (current / target).clamp(0.0, 1.0);
    final unit = snapshot.goal!.type == GoalType.pages ? 'Pages' : 'Ayahs';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant.withOpacity(0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Today\'s Progress',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 24),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 140,
                height: 140,
                child: CircularProgressIndicator(
                  value: progress,
                  strokeWidth: 12,
                  backgroundColor:
                      Theme.of(context).colorScheme.surfaceContainerHighest,
                  color: snapshot.metToday
                      ? nurColors.brandGold
                      : Theme.of(context).colorScheme.primary,
                  strokeCap: StrokeCap.round,
                ),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '$current',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: snapshot.metToday ? nurColors.brandGold : null,
                        ),
                  ),
                  Text(
                    'of $target $unit',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (snapshot.metToday)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: nurColors.brandGold.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'Goal Met! 🎉',
                style: TextStyle(
                  color: nurColors.brandGold,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          else
            Text(
              '${target - current} more to go!',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
        ],
      ),
    );
  }

  Widget _buildWeeklyActivity(BuildContext context, GoalSnapshot snapshot) {
    final nurColors = Theme.of(context).extension<NurColorsExtension>()!;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant.withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Last 7 Days',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: snapshot.week.map((daily) {
              final isToday =
                  DateUtils.isSameDay(daily.date, DateTime.now());
              return Column(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: daily.met
                          ? nurColors.brandGold
                          : Theme.of(context).colorScheme.surfaceContainerHighest,
                      border: isToday
                          ? Border.all(
                              color: Theme.of(context).colorScheme.primary,
                              width: 2,
                            )
                          : null,
                    ),
                    child: daily.met
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    DateFormat('E').format(daily.date).substring(0, 1),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: isToday ? FontWeight.bold : null,
                          color: isToday
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  void _showSetGoalBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _SetGoalSheet(),
    );
  }
}

class _SetGoalSheet extends StatefulWidget {
  const _SetGoalSheet();

  @override
  State<_SetGoalSheet> createState() => _SetGoalSheetState();
}

class _SetGoalSheetState extends State<_SetGoalSheet> {
  GoalType _selectedType = GoalType.pages;
  int _customTarget = 1;
  final TextEditingController _customController = TextEditingController();

  final List<Map<String, dynamic>> _presets = [
    {'label': '1 Page', 'type': GoalType.pages, 'target': 1},
    {'label': '5 Pages', 'type': GoalType.pages, 'target': 5},
    {'label': '10 Pages', 'type': GoalType.pages, 'target': 10},
    {'label': '1 Juz (20 Pgs)', 'type': GoalType.pages, 'target': 20},
    {'label': '50 Ayahs', 'type': GoalType.ayahs, 'target': 50},
    {'label': '100 Ayahs', 'type': GoalType.ayahs, 'target': 100},
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Set Daily Goal',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _presets.map((preset) {
              return ChoiceChip(
                label: Text(preset['label'] as String),
                selected: _selectedType == preset['type'] &&
                    _customTarget == preset['target'],
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      _selectedType = preset['type'] as GoalType;
                      _customTarget = preset['target'] as int;
                      _customController.text = _customTarget.toString();
                    });
                  }
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),
          Text(
            'Custom Goal',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: SegmentedButton<GoalType>(
                  segments: const [
                    ButtonSegment(
                      value: GoalType.pages,
                      label: Text('Pages'),
                    ),
                    ButtonSegment(
                      value: GoalType.ayahs,
                      label: Text('Ayahs'),
                    ),
                  ],
                  selected: {_selectedType},
                  onSelectionChanged: (set) {
                    setState(() {
                      _selectedType = set.first;
                    });
                  },
                ),
              ),
              const SizedBox(width: 16),
              SizedBox(
                width: 100,
                child: TextField(
                  controller: _customController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  onChanged: (val) {
                    final num = int.tryParse(val);
                    if (num != null && num > 0) {
                      setState(() {
                        _customTarget = num;
                      });
                    }
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          FilledButton(
            onPressed: () {
              final controller = Get.find<GoalsController>();
              controller.setGoal(_selectedType, _customTarget);
              Get.back();
            },
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: const Text('Save Goal'),
          ),
        ],
      ),
    );
  }
}
