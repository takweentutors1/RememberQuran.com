import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/reader_settings_controller.dart';
import '../../../../core/models/translation.dart';
import '../../../../core/theme/app_fonts.dart';

class ReaderSettingsSheet extends GetView<ReaderSettingsController> {
  const ReaderSettingsSheet({Key? key}) : super(key: key);

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
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
        return ListView(
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
            Obx(() => SegmentedButton<DisplayMode>(
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
            )),
            const SizedBox(height: 24),

            _buildSectionTitle(context, 'Arabic Font'),
            Obx(() => SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: AppFonts.uthmanicHafs,
                  label: Text('Hafs'),
                ),
                ButtonSegment(
                  value: AppFonts.amiri,
                  label: Text('Amiri'),
                ),
                ButtonSegment(
                  value: AppFonts.amiriQuran,
                  label: Text('Amiri Quran'),
                ),
              ],
              selected: {controller.font.value},
              onSelectionChanged: (set) {
                controller.setFont(set.first);
              },
            )),
            const SizedBox(height: 24),

            _buildSectionTitle(context, 'Theme'),
            Obx(() => SegmentedButton<ThemeMode>(
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
            )),
            const SizedBox(height: 24),

            _buildSectionTitle(context, 'Font Size'),
            Obx(() => Row(
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
            )),
            const SizedBox(height: 24),

            _buildSectionTitle(context, 'Memorisation Testing'),
            Obx(() => SwitchListTile(
              title: const Text('Hide Arabic (Hifz Mode)'),
              subtitle: const Text('Tap on empty spaces to reveal ayahs one by one.'),
              value: controller.isHifzMode.value,
              onChanged: (_) => controller.toggleHifzMode(),
              contentPadding: EdgeInsets.zero,
            )),
            const Divider(),
            Obx(() => SwitchListTile(
              title: const Text('Tajweed Color Coding'),
              subtitle: const Text('Show pronunciation rules with distinct colors.'),
              value: controller.rxTajweedEnabled.value,
              onChanged: (_) => controller.toggleTajweed(),
              contentPadding: EdgeInsets.zero,
            )),
          ],
        );
      },
    );
  }

  Widget _buildTranslationPicker(BuildContext context) {
    return Obx(() {
      final arabicOnly = !controller.showTranslation.value || controller.activeTranslations.isEmpty;
      final atCap = !arabicOnly && controller.activeTranslations.length >= maxActiveTranslations;

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
                value: !arabicOnly && controller.activeTranslations.contains(t.id),
                onChanged: (atCap && !controller.activeTranslations.contains(t.id))
                    ? null
                    : (_) => controller.selectTranslation(t.id),
                title: Text(t.name),
                subtitle: Text('${t.isRtl ? 'RTL · ' : ''}${t.author ?? t.language}'),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
                dense: true,
              ),
          ],
        ],
      );
    });
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
