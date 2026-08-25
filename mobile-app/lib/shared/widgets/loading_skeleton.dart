import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class AppShimmer extends StatelessWidget {
  final Widget child;

  const AppShimmer({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey[800]! : Colors.grey[300]!,
      highlightColor: isDark ? Colors.grey[700]! : Colors.grey[100]!,
      child: child,
    );
  }

  /// Shimmer element representing a single block of text or shape
  static Widget block({
    double? width,
    double? height,
    double borderRadius = 8.0,
    EdgeInsetsGeometry? margin,
  }) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }

  /// Specialized skeleton for a list of Surahs
  static Widget surahList({int count = 10}) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: count,
      itemBuilder: (context, index) {
        return AppShimmer(
          child: Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: Colors.white),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  AppShimmer.block(width: 40, height: 40, borderRadius: 20),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppShimmer.block(width: 120, height: 16),
                        const SizedBox(height: 8),
                        AppShimmer.block(width: 160, height: 12),
                      ],
                    ),
                  ),
                  AppShimmer.block(width: 60, height: 24),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  /// Specialized skeleton for Ayahs in reading mode
  static Widget ayahList({int count = 5}) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
      itemCount: count,
      itemBuilder: (context, index) {
        return AppShimmer(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    AppShimmer.block(width: 80, height: 40, margin: const EdgeInsets.only(left: 8)),
                    AppShimmer.block(width: 60, height: 40, margin: const EdgeInsets.only(left: 8)),
                    AppShimmer.block(width: 100, height: 40, margin: const EdgeInsets.only(left: 8)),
                    AppShimmer.block(width: 50, height: 40, margin: const EdgeInsets.only(left: 8)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    AppShimmer.block(width: 120, height: 40, margin: const EdgeInsets.only(left: 8)),
                    AppShimmer.block(width: 90, height: 40, margin: const EdgeInsets.only(left: 8)),
                    AppShimmer.block(width: 70, height: 40, margin: const EdgeInsets.only(left: 8)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Specialized generic skeleton for a Card (like Ayah of the day, stats)
  static Widget card({double height = 150}) {
    return AppShimmer(
      child: AppShimmer.block(
        width: double.infinity,
        height: height,
        borderRadius: 16,
      ),
    );
  }

  /// Specialized skeleton for generic ListTiles
  static Widget listTile({int count = 5}) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: count,
      itemBuilder: (context, index) {
        return AppShimmer(
          child: ListTile(
            leading: AppShimmer.block(width: 40, height: 40, borderRadius: 8),
            title: AppShimmer.block(width: 120, height: 16),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: AppShimmer.block(width: 200, height: 12),
            ),
            trailing: AppShimmer.block(width: 24, height: 24, borderRadius: 12),
          ),
        );
      },
    );
  }
}
