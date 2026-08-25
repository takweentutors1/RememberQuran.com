import 'package:flutter/material.dart';

class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    Key? key,
    required this.mobile,
    this.tablet,
    this.desktop,
  }) : super(key: key);

  static bool isMini(BuildContext context) =>
      MediaQuery.of(context).size.width < 360;

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 600;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 600 &&
      MediaQuery.of(context).size.width < 900;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 900;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 900) {
          return desktop ?? tablet ?? mobile;
        } else if (constraints.maxWidth >= 600) {
          return tablet ?? mobile;
        } else {
          return mobile;
        }
      },
    );
  }
}

// Extension to easily scale sizes based on screen width
extension ResponsiveSize on BuildContext {
  double get screenWidth => MediaQuery.of(this).size.width;
  double get screenHeight => MediaQuery.of(this).size.height;

  // Responsive padding
  EdgeInsets get responsivePadding {
    if (ResponsiveLayout.isDesktop(this)) {
      return const EdgeInsets.symmetric(horizontal: 48.0, vertical: 24.0);
    } else if (ResponsiveLayout.isTablet(this)) {
      return const EdgeInsets.symmetric(horizontal: 32.0, vertical: 24.0);
    } else if (ResponsiveLayout.isMini(this)) {
      return const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0);
    }
    return const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0);
  }

  // Dynamic font sizing (ensures min 18sp as requested, scales up on larger screens)
  double get responsiveBaseTextSize {
    if (ResponsiveLayout.isDesktop(this)) {
      return 24.0;
    } else if (ResponsiveLayout.isTablet(this)) {
      return 20.0;
    }
    return 18.0;
  }

  /// Pick a value by breakpoint, e.g. `context.rv(mini: 12.0, mobile: 16.0,
  /// tablet: 24.0, desktop: 32.0)` for padding, font sizes, spacing, etc.
  /// Falls back progressively: desktop → tablet → mobile → mini, so callers
  /// only need to specify the breakpoints that actually differ.
  T rv<T>({required T mobile, T? mini, T? tablet, T? desktop}) {
    if (ResponsiveLayout.isDesktop(this)) return desktop ?? tablet ?? mobile;
    if (ResponsiveLayout.isTablet(this)) return tablet ?? mobile;
    if (ResponsiveLayout.isMini(this)) return mini ?? mobile;
    return mobile;
  }

  /// Column count for grids of cards/tiles: 1 on phones, 2 on tablets, 3 on
  /// desktop. Screens with denser content may want their own thresholds
  /// (see e.g. home_view's 2/3 split starting at 600/900) — this is the
  /// shared default for screens that don't need to tune it further.
  int get gridColumns => rv(mobile: 1, tablet: 2, desktop: 3);

  /// Cap for reading/content width so lines don't stretch edge-to-edge on
  /// tablet/desktop. Unbounded on phones — there's no need to constrain a
  /// screen that's already narrow.
  double get maxContentWidth =>
      rv(mobile: double.infinity, tablet: 700.0, desktop: 900.0);
}

/// Drop-in replacement for `showModalBottomSheet` that shows a real bottom
/// sheet on phones but a centered dialog on tablet/desktop — a bottom sheet
/// that only occupies the center third of a wide screen while darkening the
/// rest reads as a mistake, not a deliberate layout.
///
/// [builder]'s content is unchanged between the two — the same widget
/// (typically a `Container` with top-rounded corners styled for a bottom
/// sheet) is reused as-is rather than forked into two variants. The dialog
/// path clips it with a uniform `ClipRRect` so it still reads as a single
/// rounded card even though the sheet's own decoration only rounds its top.
Future<T?> showResponsiveSheet<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  double maxWidth = 560,
}) {
  if (ResponsiveLayout.isMobile(context)) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      constraints: BoxConstraints(maxWidth: maxWidth),
      builder: builder,
    );
  }
  return showDialog<T>(
    context: context,
    builder: (context) => Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(40),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: maxWidth,
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: builder(context),
        ),
      ),
    ),
  );
}
