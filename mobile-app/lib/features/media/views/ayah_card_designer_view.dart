import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/ayah_card_designer_controller.dart';
import '../models/card_preset.dart';
import '../../../../core/theme/app_colors.dart';

import '../../../../core/utils/responsive_layout.dart';

class AyahCardDesignerView extends GetView<AyahCardDesignerController> {
  const AyahCardDesignerView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Design Ayah Card'),
        actions: [
          Obx(
            () => IconButton(
              icon: controller.isSaving.value
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.download_rounded),
              tooltip: 'Save to Gallery',
              onPressed: controller.isSaving.value ? null : controller.saveToGallery,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.share_rounded),
            tooltip: 'Share Card',
            onPressed: controller.shareCard,
          ),
        ],
      ),
      body: ResponsiveLayout(
        mobile: _buildMobileLayout(context),
        desktop: _buildDesktopLayout(context),
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    // Was a Column + Spacer pinning controls to the bottom — fine while
    // controls were a single button row, but the added theme picker made
    // (card + controls) tall enough to overflow on shorter phones, with no
    // scroll fallback (Spacer just clips silently in release builds).
    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 40),
          Center(
            child: RepaintBoundary(
              key: controller.repaintKey,
              child: _buildCard(context),
            ),
          ),
          const SizedBox(height: 24),
          _buildControls(context),
        ],
      ),
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: RepaintBoundary(
                key: controller.repaintKey,
                child: _buildCard(context),
              ),
            ),
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 1,
          child: Padding(
            padding: const EdgeInsets.only(top: 40),
            child: _buildControls(context),
          ),
        ),
      ],
    );
  }

  Widget _buildControls(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Background Theme',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 12),
          _buildThemePicker(context),
          const SizedBox(height: 24),
          _buildActionButtons(context),
          const SizedBox(height: 12),
          _buildVideoExportButton(context),
        ],
      ),
    );
  }

  Widget _buildVideoExportButton(BuildContext context) {
    return Obx(
      () => OutlinedButton.icon(
        onPressed: controller.isExportingVideo.value ? null : controller.exportVideo,
        icon: controller.isExportingVideo.value
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.videocam_rounded),
        label: Text(
          controller.isExportingVideo.value
              ? 'Rendering Video…'
              : 'Export Video (Audio)',
        ),
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildThemePicker(BuildContext context) {
    return Obx(() {
      final selected = controller.selectedTheme.value;
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: kCardPresets.map((preset) {
          final isSelected = preset.id == selected;
          return GestureDetector(
            onTap: () => controller.selectTheme(preset.id),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: preset.background,
                    ),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected
                          ? preset.accent
                          : Theme.of(context).dividerColor.withValues(alpha: 0.3),
                      width: isSelected ? 3 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: preset.accent.withValues(alpha: 0.4),
                              blurRadius: 8,
                            ),
                          ]
                        : null,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  preset.label,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    fontWeight: isSelected ? FontWeight.bold : null,
                    color: isSelected ? preset.accent : null,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      );
    });
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
            child: Obx(
              () => OutlinedButton.icon(
                onPressed: controller.isSaving.value ? null : controller.saveToGallery,
                icon: controller.isSaving.value
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.download_rounded),
                label: const Text('Save'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: FilledButton.icon(
              onPressed: controller.shareCard,
              icon: const Icon(Icons.ios_share_rounded),
              label: const Text('Share'),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(56),
                backgroundColor: Theme.of(context).extension<NurColorsExtension>()?.brandGold,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ],
      );
  }

  Widget _buildCard(BuildContext context) {
    return Obx(() {
      final preset = getCardPreset(controller.selectedTheme.value);
      return Container(
        width: 350,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: preset.background,
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: preset.accent.withValues(alpha: 0.25)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(
              Icons.format_quote_rounded,
              size: 40,
              color: preset.accent.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              controller.textUthmani,
              textAlign: TextAlign.center,
              textDirection: TextDirection.rtl,
              style: TextStyle(
                fontSize: 32,
                fontFamily: 'UthmanicHafs',
                color: preset.foreground,
                height: 1.6,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              controller.translation,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: preset.muted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  height: 1,
                  width: 40,
                  color: preset.accent.withValues(alpha: 0.5),
                ),
                const SizedBox(width: 12),
                Text(
                  controller.reference,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                    color: preset.accent,
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  height: 1,
                  width: 40,
                  color: preset.accent.withValues(alpha: 0.5),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Branding — previously the app name only appeared in the share
            // sheet's caption text, not the image itself, so it disappeared
            // the moment someone saved/reposted the PNG on its own.
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/icon/app_icon_foreground.png',
                  width: 16,
                  height: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  'RememberQuran.com',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.3,
                    color: preset.muted,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }
}
