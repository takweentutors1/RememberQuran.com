import 'package:flutter/material.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../../../../data/datasources/local/quran_db.dart';

class AyahPickerSheet extends StatelessWidget {
  final Chapter chapter;

  const AyahPickerSheet({super.key, required this.chapter});

  static Future<int?> show(BuildContext context, Chapter chapter) async {
    return showResponsiveSheet<int>(
      context: context,
      builder: (_) => AyahPickerSheet(chapter: chapter),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final ayahCount = chapter.versesCount;

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      builder: (_, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            chapter.nameSimple,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${chapter.versesCount} verses',
                            style: TextStyle(
                              fontSize: 14,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      chapter.nameArabic,
                      style: const TextStyle(
                        fontSize: 24,
                        fontFamily: 'Amiri',
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Divider(height: 1),
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: ayahCount,
                  itemBuilder: (context, index) {
                    final ayahNumber = index + 1;
                    return ListTile(
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: theme.colorScheme.outlineVariant,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '$ayahNumber',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ),
                      title: Text(
                        'Ayah $ayahNumber',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      subtitle: Text(
                        '${chapter.nameSimple} : $ayahNumber',
                        style: TextStyle(
                          fontSize: 12,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      trailing: Icon(
                        Icons.chevron_right,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      onTap: () => Navigator.of(context).pop(ayahNumber),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
