import 'package:flutter/material.dart';
import '../../../core/models/reciter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/responsive_layout.dart';

/// Shared reciter-picker bottom sheet. Previously private to
/// `RadioView._showReciterPicker`, which meant reciter selection only
/// existed inside Quran Radio — the reading-mode "Now Playing" sheet had no
/// way to change reciters at all. Extracted here so both call sites share
/// one implementation instead of drifting apart.
void showReciterPicker({
  required BuildContext context,
  required int selectedReciterId,
  required ValueChanged<int> onReciterSelected,
}) {
  showResponsiveSheet(
    context: context,
    builder: (context) {
      final theme = Theme.of(context);
      final nurColors = theme.extension<NurColorsExtension>();
      final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

      return Container(
        decoration: BoxDecoration(
          color: theme.scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.outline.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Select Reciter',
                  style: TextStyle(
                    fontSize: context.responsiveBaseTextSize,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: reciters.length,
                  itemBuilder: (context, index) {
                    final r = reciters[index];
                    final isSelected = r.id == selectedReciterId;
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isSelected
                            ? brandGold.withOpacity(0.2)
                            : theme.cardColor,
                        child: Icon(
                          Icons.person,
                          color: isSelected
                              ? brandGold
                              : theme.iconTheme.color,
                        ),
                      ),
                      title: Text(
                        r.name,
                        style: TextStyle(
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                      subtitle: Text(
                        'Riwaya: ${r.style}',
                        style: const TextStyle(fontSize: 12),
                      ),
                      trailing: isSelected
                          ? Icon(Icons.check_circle, color: brandGold)
                          : null,
                      onTap: () {
                        Navigator.pop(context);
                        onReciterSelected(r.id);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}
