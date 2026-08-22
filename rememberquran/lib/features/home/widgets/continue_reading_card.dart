import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../account/controllers/auth_controller.dart';
import '../../../core/utils/responsive_layout.dart';

class ContinueReadingCard extends GetView<AuthController> {
  const ContinueReadingCard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final pos = controller.lastPosition.value;
      if (pos == null) return const SizedBox.shrink();

      final theme = Theme.of(context);

      return Card(
        margin: const EdgeInsets.only(bottom: 24),
        elevation: 0,
        color: theme.colorScheme.secondaryContainer.withOpacity(0.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: theme.colorScheme.secondary.withOpacity(0.2)),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            Get.toNamed('/surah/${pos.surahId}?ayahId=${pos.ayahId}');
          },
          child: Padding(
            padding: EdgeInsets.all(
              context.rv(mobile: 20.0, tablet: 24.0, desktop: 28.0),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.secondary,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.menu_book_rounded,
                    color: theme.colorScheme.onSecondary,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CONTINUE READING',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                          color: theme.colorScheme.secondary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Surah ${pos.surahId}, Ayah ${pos.ayahId}',
                        style: TextStyle(
                          fontSize: context.rv(
                            mobile: 18.0,
                            tablet: 20.0,
                            desktop: 22.0,
                          ),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Last read ${timeago.format(pos.updatedAt)}',
                        style: TextStyle(
                          fontSize: 12,
                          color: theme.textTheme.bodySmall?.color,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 16,
                  color: theme.colorScheme.secondary,
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}
