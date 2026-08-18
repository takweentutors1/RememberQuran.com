import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../controllers/splash_controller.dart';

class SplashLoadingView extends GetView<SplashController> {
  const SplashLoadingView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    
    // We get the controller directly since it is registered by Get.to() via routing,
    // but in case it's not, GetView handles finding it.

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              // App Logo
              Center(
                child: Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: nurColors?.surfaceSunk ?? theme.colorScheme.surfaceContainer,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: (nurColors?.brandGold ?? theme.colorScheme.primary).withOpacity(0.2),
                        blurRadius: 30,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Image.asset(
                        'assets/icon/app_icon.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              // App Title
              Text(
                'Remember Quran',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: nurColors?.brandGold ?? theme.colorScheme.primary,
                ),
              ),
              
              const Spacer(),

              // Loading Section
              Obx(() {
                if (controller.errorMsg.value.isNotEmpty) {
                  return Column(
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: theme.colorScheme.error,
                        size: 48,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        controller.errorMsg.value,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.error,
                        ),
                      ),
                    ],
                  );
                }

                return Column(
                  children: [
                    // Loading Text
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: Text(
                        controller.loadingText.value,
                        key: ValueKey<String>(controller.loadingText.value),
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: nurColors?.foregroundSubtle ?? theme.colorScheme.onSurfaceVariant,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Progress Bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: TweenAnimationBuilder<double>(
                        tween: Tween<double>(begin: 0, end: controller.loadingProgress.value),
                        duration: const Duration(milliseconds: 400),
                        builder: (context, value, _) {
                          return LinearProgressIndicator(
                            value: value,
                            minHeight: 6,
                            backgroundColor: nurColors?.surfaceSunk ?? theme.colorScheme.surfaceContainer,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              nurColors?.brandGold ?? theme.colorScheme.primary,
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
