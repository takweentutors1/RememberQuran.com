import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:introduction_screen/introduction_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../app/routes/app_routes.dart';
import '../../../core/utils/responsive_layout.dart';

class OnboardingView extends StatelessWidget {
  const OnboardingView({super.key});

  static const prefsKey = 'has_seen_onboarding';

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(prefsKey, true);
    Get.offAllNamed(Routes.HOME);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // The introduction_screen package renders image-above-title-above-body
    // as a fixed internal layout — it doesn't expose a landscape/side-by-side
    // mode, so a true side-by-side tablet layout would mean replacing this
    // whole package-driven flow. Scaling everything up proportionally is the
    // safe, contained improvement that doesn't risk breaking the working
    // swipe/skip/done behavior the package already provides.
    final circleSize = context.rv(mobile: 120.0, tablet: 160.0, desktop: 180.0);
    final iconSize = context.rv(mobile: 56.0, tablet: 72.0, desktop: 80.0);

    PageViewModel page({
      required IconData icon,
      required String title,
      required String body,
    }) {
      return PageViewModel(
        title: title,
        body: body,
        image: Center(
          child: Container(
            width: circleSize,
            height: circleSize,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: iconSize, color: theme.colorScheme.primary),
          ),
        ),
        decoration: PageDecoration(
          pageColor: theme.scaffoldBackgroundColor,
          titleTextStyle:
              theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: context.rv(mobile: 22.0, tablet: 26.0, desktop: 28.0),
              ) ??
              const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          bodyTextStyle:
              theme.textTheme.bodyLarge?.copyWith(
                color: theme.textTheme.bodySmall?.color,
                fontSize: context.rv(mobile: 16.0, tablet: 18.0, desktop: 18.0),
                height: 1.6,
              ) ??
              const TextStyle(fontSize: 16),
          // Push image down from top status bar and give generous space below
          imagePadding: const EdgeInsets.only(top: 72, bottom: 40),
          // Side padding for body text, plus bottom padding so text doesn't
          // crowd the dots/buttons row on short devices
          bodyPadding: const EdgeInsets.fromLTRB(28, 0, 28, 24),
          titlePadding: const EdgeInsets.only(bottom: 16),
          // Vertically center the full page block
          contentMargin: const EdgeInsets.symmetric(horizontal: 0),
          footerPadding: const EdgeInsets.only(bottom: 16),
        ),
      );
    }

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: IntroductionScreen(
              globalBackgroundColor: Colors.transparent,
              pages: [
                page(
                  icon: Icons.auto_stories_outlined,
                  title: 'Read anytime, anywhere',
                  body:
                      "The full Qur'an with word-by-word translation, cached on your "
                      'device so it works offline.',
                ),
                page(
                  icon: Icons.headphones_outlined,
                  title: 'Listen & follow along',
                  body:
                      'Choose from 20 reciters, download surahs for offline listening, '
                      "and watch each word highlight in sync as it's recited.",
                ),
                page(
                  icon: Icons.local_fire_department_outlined,
                  title: 'Build a daily habit',
                  body:
                      'Set a reading goal, track your streak, and get a gentle '
                      'reminder if you\'re about to lose it.',
                ),
              ],
              onDone: () => _finish(),
              onSkip: () => _finish(),
              showSkipButton: true,
              animationDuration: 400,
              curve: Curves.easeInOutCubic,
              skip: Text(
                'Skip',
                style: TextStyle(
                  color: theme.colorScheme.primary.withOpacity(0.7),
                  fontWeight: FontWeight.w500,
                ),
              ),
              next: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.arrow_forward,
                  color: theme.colorScheme.onPrimary,
                  size: 20,
                ),
              ),
              done: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: theme.colorScheme.primary.withOpacity(0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Text(
                  'Get Started',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onPrimary,
                    fontSize: 15,
                  ),
                ),
              ),
              dotsDecorator: DotsDecorator(
                activeColor: theme.colorScheme.primary,
                color: theme.colorScheme.primary.withOpacity(0.25),
                size: const Size(8, 8),
                activeSize: const Size(20, 8),
                activeShape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              dotsContainerDecorator: const ShapeDecoration(
                color: Colors.transparent,
                shape: RoundedRectangleBorder(),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

