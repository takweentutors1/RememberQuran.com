import 'package:flutter/material.dart';

/// Purely cosmetic "equalizer" bars — not tied to real audio amplitude.
/// Each bar loops on its own slightly-offset duration so they drift out of
/// phase instead of bouncing in unison, which is what actually sells the
/// "alive" effect cheaply without analyzing the audio stream.
class WaveformBars extends StatefulWidget {
  final bool isPlaying;
  final Color? color;
  final int barCount;
  final double height;
  final double barWidth;

  const WaveformBars({
    Key? key,
    required this.isPlaying,
    this.color,
    this.barCount = 6,
    this.height = 28,
    this.barWidth = 4,
  })  : assert(barCount >= 5 && barCount <= 7, 'barCount should stay in the 5-7 range this was designed for'),
        super(key: key);

  @override
  State<WaveformBars> createState() => _WaveformBarsState();
}

class _WaveformBarsState extends State<WaveformBars> with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _heightFactors;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.barCount, (i) {
      final duration = Duration(milliseconds: 420 + (i % 3) * 90);
      return AnimationController(vsync: this, duration: duration);
    });
    _heightFactors = List.generate(widget.barCount, (i) {
      final restingFactor = 0.22 + (i % 2) * 0.08;
      return Tween<double>(begin: restingFactor, end: 1.0).animate(
        CurvedAnimation(parent: _controllers[i], curve: Curves.easeInOut),
      );
    });
    if (widget.isPlaying) {
      _startBouncing();
    }
  }

  void _startBouncing() {
    for (var i = 0; i < _controllers.length; i++) {
      // Stagger the starts too, not just the durations, so bars don't all
      // begin the loop in lockstep on the first frame.
      Future.delayed(Duration(milliseconds: i * 60), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  void _settleToRest() {
    for (final c in _controllers) {
      c.animateTo(0, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    }
  }

  @override
  void didUpdateWidget(covariant WaveformBars oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying != oldWidget.isPlaying) {
      if (widget.isPlaying) {
        _startBouncing();
      } else {
        _settleToRest();
      }
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? Theme.of(context).colorScheme.primary;

    return SizedBox(
      height: widget.height,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(widget.barCount, (i) {
          return Padding(
            padding: EdgeInsets.symmetric(horizontal: widget.barWidth * 0.4),
            child: AnimatedBuilder(
              animation: _heightFactors[i],
              builder: (context, child) {
                final barHeight = (widget.height * _heightFactors[i].value)
                    .clamp(widget.barWidth, widget.height);
                return Container(
                  width: widget.barWidth,
                  height: barHeight,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(widget.barWidth / 2),
                  ),
                );
              },
            ),
          );
        }),
      ),
    );
  }
}
