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
}
