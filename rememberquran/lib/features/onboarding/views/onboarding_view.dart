import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:introduction_screen/introduction_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../app/routes/app_routes.dart';

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

    PageViewModel page({required IconData icon, required String title, required String body}) {
      return PageViewModel(
        title: title,
        body: body,
        image: Center(
          child: Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 56, color: theme.colorScheme.primary),
          ),
        ),
        decoration: PageDecoration(
          pageColor: theme.scaffoldBackgroundColor,
          titleTextStyle: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold) ??
              const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          bodyTextStyle: theme.textTheme.bodyLarge?.copyWith(color: theme.textTheme.bodySmall?.color) ??
              const TextStyle(fontSize: 16),
          imagePadding: const EdgeInsets.only(top: 48, bottom: 24),
          bodyPadding: const EdgeInsets.symmetric(horizontal: 24),
        ),
      );
    }

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: IntroductionScreen(
            globalBackgroundColor: Colors.transparent, // Use scaffold background
            pages: [
              page(
                icon: Icons.auto_stories_outlined,
                title: 'Read anytime, anywhere',
                body: "The full Qur'an with word-by-word translation, cached on your "
                    'device so it works offline.',
              ),
              page(
                icon: Icons.headphones_outlined,
                title: 'Listen & follow along',
                body: 'Choose from 20 reciters, download surahs for offline listening, '
                    "and watch each word highlight in sync as it's recited.",
              ),
              page(
                icon: Icons.local_fire_department_outlined,
                title: 'Build a daily habit',
                body: 'Set a reading goal, track your streak, and get a gentle '
                    'reminder if you\'re about to lose it.',
              ),
            ],
            onDone: () => _finish(),
            onSkip: () => _finish(),
            showSkipButton: true,
            skip: const Text('Skip'),
            next: const Icon(Icons.arrow_forward),
            done: const Text('Get Started', style: TextStyle(fontWeight: FontWeight.bold)),
            dotsDecorator: DotsDecorator(
              activeColor: theme.colorScheme.primary,
              color: theme.colorScheme.primary.withOpacity(0.25),
              size: const Size(8, 8),
              activeSize: const Size(20, 8),
              activeShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            ),
          ),
        ),
      ),
    );
  }
}
