import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/reader_settings_controller.dart';
import '../../controllers/reader_controller.dart';
import '../../../../core/models/translation.dart';
import '../../../../core/theme/app_fonts.dart';
import '../../../../core/utils/responsive_layout.dart';

class ReaderSettingsSheet extends GetView<ReaderSettingsController> {
  const ReaderSettingsSheet({Key? key}) : super(key: key);

  static void show(BuildContext context) {
    showResponsiveSheet(
      context: context,
      builder: (_) => const ReaderSettingsSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, scrollController) {
        // The modal route is transparent (showResponsiveSheet), so this
        // has to paint its own background — previously it relied on the
        // route's own opaque default, which the Dialog path on
        // tablet/desktop doesn't provide.
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(24.0),
            children: [
              Text(
                'Reader Settings',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 24),

              _buildSectionTitle(context, 'Translation'),
              _buildTranslationPicker(context),
              const SizedBox(height: 24),

              _buildSectionTitle(context, 'Display Mode'),
              Obx(
                () => SegmentedButton<DisplayMode>(
                  segments: const [
                    ButtonSegment(
                      value: DisplayMode.verseByVerse,
                      label: Text('Verse by Verse'),
                    ),
                    ButtonSegment(
                      value: DisplayMode.continuous,
                      label: Text('Continuous'),
                    ),
                  ],
                  selected: {controller.displayMode.value},
                  onSelectionChanged: (set) {
                    controller.setDisplayMode(set.first);
                  },
                ),
              ),
              const SizedBox(height: 24),

              _buildSectionTitle(context, 'Arabic Font'),
              Obx(
                () => SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(
                      value: AppFonts.uthmanicHafs,
                      label: Text('Hafs'),
                    ),
                    ButtonSegment(value: AppFonts.amiri, label: Text('Amiri')),
                    ButtonSegment(
                      value: AppFonts.amiriQuran,
                      label: Text('Amiri Quran'),
                    ),
                  ],
                  selected: {controller.font.value},
                  onSelectionChanged: (set) {
                    controller.setFont(set.first);
                  },
                ),
              ),
              const SizedBox(height: 24),

              _buildSectionTitle(context, 'Theme'),
              Obx(
                () => SegmentedButton<ThemeMode>(
                  segments: const [
                    ButtonSegment(
                      value: ThemeMode.system,
                      label: Text('System'),
                      icon: Icon(Icons.brightness_auto_outlined),
                    ),
                    ButtonSegment(
                      value: ThemeMode.light,
                      label: Text('Light'),
                      icon: Icon(Icons.light_mode_outlined),
                    ),
                    ButtonSegment(
                      value: ThemeMode.dark,
                      label: Text('Dark'),
                      icon: Icon(Icons.dark_mode_outlined),
                    ),
                  ],
                  selected: {controller.themeMode.value},
                  onSelectionChanged: (set) {
                    controller.setThemeMode(set.first);
                  },
                ),
              ),
              const SizedBox(height: 24),

              _buildSectionTitle(context, 'Font Size'),
              Obx(
                () => Row(
                  children: [
                    const Icon(Icons.text_decrease),
                    Expanded(
                      child: Slider(
                        value: controller.fontSize.value,
                        min: 16.0,
                        max: 64.0,
                        divisions: 8,
                        onChanged: controller.setFontSize,
                      ),
                    ),
                    const Icon(Icons.text_increase),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              _buildSectionTitle(context, 'Memorisation Testing'),
              Obx(
                () => SwitchListTile(
                  title: const Text('Hide Arabic (Hifz Mode)'),
                  subtitle: const Text(
                    'Tap on empty spaces to reveal ayahs one by one.',
                  ),
                  value: controller.isHifzMode.value,
                  onChanged: (_) => controller.toggleHifzMode(),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              _buildHifzRangePicker(context),
              const Divider(),
              Obx(
                () => SwitchListTile(
                  title: const Text('Tajweed Color Coding'),
                  subtitle: const Text(
                    'Show pronunciation rules with distinct colors.',
                  ),
                  value: controller.rxTajweedEnabled.value,
                  onChanged: (_) => controller.toggleTajweed(),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTranslationPicker(BuildContext context) {
    return Obx(() {
      final arabicOnly =
          !controller.showTranslation.value ||
          controller.activeTranslations.isEmpty;
      final atCap =
          !arabicOnly &&
          controller.activeTranslations.length >= maxActiveTranslations;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CheckboxListTile(
            value: arabicOnly,
            onChanged: (_) => controller.setShowTranslation(false),
            title: const Text('Arabic only'),
            subtitle: const Text('Hide translations while you read'),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 4.0, bottom: 8.0),
            child: Text(
              'Choose up to $maxActiveTranslations translations'
              '${arabicOnly ? '' : ' · ${controller.activeTranslations.length}/$maxActiveTranslations'}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          for (final group in translationsByLanguage()) ...[
            Padding(
              padding: const EdgeInsets.only(left: 4.0, top: 8.0, bottom: 4.0),
              child: Text(
                group.key.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.0,
                ),
              ),
            ),
            for (final t in group.value)
              CheckboxListTile(
                value:
                    !arabicOnly && controller.activeTranslations.contains(t.id),
                onChanged:
                    (atCap && !controller.activeTranslations.contains(t.id))
                    ? null
                    : (_) => controller.selectTranslation(t.id),
                title: Text(t.name),
                subtitle: Text(
                  '${t.isRtl ? 'RTL · ' : ''}${t.author ?? t.language}',
                ),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
                dense: true,
              ),
          ],
        ],
      );
    });
  }

  /// Lets the user restrict hifz hiding to a specific ayah range instead of
  /// the whole surah — only shown while hifz mode is on, and only once a
  /// chapter is actually loaded (needed to know the max ayah number).
  Widget _buildHifzRangePicker(BuildContext context) {
    if (!Get.isRegistered<ReaderController>()) return const SizedBox.shrink();
    final reader = Get.find<ReaderController>();

    return Obx(() {
      if (!controller.isHifzMode.value) return const SizedBox.shrink();
      final maxAyah = reader.verses.length;
      if (maxAyah == 0) return const SizedBox.shrink();

      final start = controller.hifzRangeStart.value;
      final end = controller.hifzRangeEnd.value;

      return Padding(
        padding: const EdgeInsets.only(top: 8.0, bottom: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hide only a range (optional)',
              style: Theme.of(context).textTheme.labelLarge,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<int>(
                    decoration: const InputDecoration(
                      labelText: 'From ayah',
                      isDense: true,
                    ),
                    value: start,
                    items: [
                      for (int i = 1; i <= maxAyah; i++)
                        DropdownMenuItem(value: i, child: Text('$i')),
                    ],
                    onChanged: (value) {
                      if (value == null) return;
                      final newEnd = (end != null && end < value)
                          ? value
                          : end;
                      controller.setHifzRange(value, newEnd);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<int>(
                    decoration: const InputDecoration(
                      labelText: 'To ayah',
                      isDense: true,
                    ),
                    value: end,
                    items: [
                      for (int i = 1; i <= maxAyah; i++)
                        DropdownMenuItem(value: i, child: Text('$i')),
                    ],
                    onChanged: (value) {
                      if (value == null) return;
                      final newStart = (start != null && start > value)
                          ? value
                          : start;
                      controller.setHifzRange(newStart, value);
                    },
                  ),
                ),
                if (start != null || end != null)
                  IconButton(
                    icon: const Icon(Icons.clear),
                    tooltip: 'Clear range (hide whole surah)',
                    onPressed: controller.clearHifzRange,
                  ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: Theme.of(
          context,
        ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
      ),
    );
  }
}
