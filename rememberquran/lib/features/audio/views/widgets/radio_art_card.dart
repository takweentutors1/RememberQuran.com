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
  final double size;

  const RadioArtCard({
    Key? key,
    required this.surahId,
    required this.surahNameArabic,
    required this.isBusy,
    required this.hasError,
    required this.isPlaying,
    required this.onRetry,
    this.size = 280,
  }) : super(key: key);

  @override
  State<RadioArtCard> createState() => _RadioArtCardState();
}

class _RadioArtCardState extends State<RadioArtCard> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _glowController;
  late AnimationController _rotationController;
  
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

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 24), // Slow, elegant rotation
    );
    
    if (widget.isPlaying) {
      _rotationController.repeat();
    }
  }

  @override
  void didUpdateWidget(RadioArtCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying && !oldWidget.isPlaying) {
      _rotationController.repeat();
    } else if (!widget.isPlaying && oldWidget.isPlaying) {
      _rotationController.stop();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _glowController.dispose();
    _rotationController.dispose();
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
    final scale = widget.size / 280;

    return AnimatedBuilder(
      animation: Listenable.merge([_pulseController, _glowController, _rotationController]),
      builder: (context, child) {
        final glowOpacity = widget.isPlaying ? (0.1 + _glowController.value * 0.35) : 0.05;

        return TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.95, end: 1.0),
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOutBack,
          key: ValueKey(widget.surahId),
          builder: (context, entranceScale, child) {
            return Transform.scale(
              scale: entranceScale,
              child: Container(
                width: widget.size,
                height: widget.size,
                margin: EdgeInsets.symmetric(vertical: 16 * scale),
                decoration: BoxDecoration(
                  color: cardColor,
                  shape: BoxShape.circle, // Circular shape for the "record"
                  boxShadow: [
                    BoxShadow(
                      color: brandGold.withOpacity(glowOpacity),
                      blurRadius: 40,
                      spreadRadius: widget.isPlaying ? 8 : 2,
                    ),
                    BoxShadow(
                      color: theme.shadowColor.withOpacity(isDark ? 0.4 : 0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    )
                  ],
                ),
                child: ClipOval(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Gradient Background
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: SweepGradient(
                            center: Alignment.center,
                            colors: [
                              brandGoldSoft.withOpacity(0.1),
                              brandGoldSoft.withOpacity(0.3),
                              cardColor,
                              brandGoldSoft.withOpacity(0.3),
                              brandGoldSoft.withOpacity(0.1),
                            ],
                            transform: GradientRotation(_rotationController.value * 2 * 3.14159),
                          ),
                        ),
                      ),
                      
                      // Rotating Arabesque Pattern
                      Transform.rotate(
                        angle: _rotationController.value * 2 * 3.14159,
                        child: Opacity(
                          opacity: widget.hasError ? 0.02 : 0.12,
                          child: CustomPaint(
                            size: Size.square(widget.size),
                            painter: ArabesquePainter(color: brandGold),
                          ),
                        ),
                      ),
                      
                      // Stationary Content
                      if (widget.hasError)
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.wifi_off_rounded, size: 48 * scale, color: theme.colorScheme.error),
                            SizedBox(height: 16 * scale),
                            Text(
                              'Connection Error',
                              style: theme.textTheme.titleMedium?.copyWith(
                                color: theme.colorScheme.error,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(height: 16 * scale),
                            ElevatedButton.icon(
                              onPressed: widget.onRetry,
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Retry'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: brandGold,
                                foregroundColor: theme.colorScheme.onPrimary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
                                  fontSize: 72 * scale,
                                  color: brandGold,
                                  height: 1.2,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (widget.isBusy) ...[
                                SizedBox(height: 16 * scale),
                                SizedBox(
                                  width: 24 * scale,
                                  height: 24 * scale,
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
