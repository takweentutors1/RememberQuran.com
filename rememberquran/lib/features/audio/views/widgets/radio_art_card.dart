import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import 'arabesque_painter.dart';

class RadioArtCard extends StatefulWidget {
  final int surahId;
  final String surahNameArabic;
  final bool isBusy;
  final bool hasError;
  final bool isPlaying;
  final VoidCallback onRetry;

  const RadioArtCard({
    Key? key,
    required this.surahId,
    required this.surahNameArabic,
    required this.isBusy,
    required this.hasError,
    required this.isPlaying,
    required this.onRetry,
  }) : super(key: key);

  @override
  State<RadioArtCard> createState() => _RadioArtCardState();
}

class _RadioArtCardState extends State<RadioArtCard> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _glowController;
  
  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final isDark = theme.brightness == Brightness.dark;
    
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
    final brandGoldSoft = nurColors?.brandGoldSoft ?? theme.colorScheme.primaryContainer;
    
    final cardColor = theme.cardColor;

    return AnimatedBuilder(
      animation: Listenable.merge([_pulseController, _glowController]),
      builder: (context, child) {
        final glowOpacity = widget.isPlaying ? (0.1 + _glowController.value * 0.35) : 0.05;
        
        return TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.95, end: 1.0),
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOutBack,
          key: ValueKey(widget.surahId),
          builder: (context, scale, child) {
            return Transform.scale(
              scale: scale,
              child: Container(
                width: double.infinity,
                height: 280,
                margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: brandGold.withOpacity(glowOpacity),
                      blurRadius: 30,
                      spreadRadius: 2,
                    ),
                    BoxShadow(
                      color: theme.shadowColor.withOpacity(isDark ? 0.3 : 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Gradient Background
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              brandGoldSoft.withOpacity(0.3),
                              cardColor,
                              cardColor,
                              brandGoldSoft.withOpacity(0.1),
                            ],
                          ),
                        ),
                      ),
                      
                      // Arabesque Pattern
                      Opacity(
                        opacity: widget.hasError ? 0.02 : 0.08,
                        child: CustomPaint(
                          size: const Size.square(280),
                          painter: ArabesquePainter(color: brandGold),
                        ),
                      ),
                      
                      // Content
                      if (widget.hasError)
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.wifi_off_rounded, size: 48, color: theme.colorScheme.error),
                            const SizedBox(height: 16),
                            Text(
                              'Could not reach server',
                              style: theme.textTheme.titleMedium?.copyWith(
                                color: theme.colorScheme.error,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: widget.onRetry,
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Retry'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: brandGold,
                                foregroundColor: theme.colorScheme.onPrimary,
                              ),
                            ),
                          ],
                        )
                      else
                        Opacity(
                          opacity: widget.isBusy ? (0.4 + _pulseController.value * 0.6) : 1.0,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                widget.surahNameArabic,
                                style: TextStyle(
                                  fontFamily: 'UthmanicHafs',
                                  fontSize: 64,
                                  color: brandGold,
                                  height: 1.2,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (widget.isBusy) ...[
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: brandGold.withOpacity(0.5),
                                  ),
                                ),
                              ]
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
