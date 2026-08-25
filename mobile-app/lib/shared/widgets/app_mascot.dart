import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Emotional state of the open-book mascot used across loading/error/empty/
/// success screens so the whole app speaks the same visual language.
enum MascotMood { loading, error, success, empty }

const _assetPath = 'assets/illustrations';

/// A small, playful open-book character that reacts to app state.
///
/// It breathes gently at rest, blinks while [MascotMood.loading], shakes
/// itself off when it enters [MascotMood.error], and pops with a happy
/// bounce on [MascotMood.success]. Tapping it always gets a little reaction
/// so it never feels like a static illustration.
class AppMascot extends StatefulWidget {
  final MascotMood mood;
  final double size;

  const AppMascot({super.key, required this.mood, this.size = 140});

  @override
  State<AppMascot> createState() => _AppMascotState();
}

class _AppMascotState extends State<AppMascot> with TickerProviderStateMixin {
  late final AnimationController _breathController;
  late final AnimationController _reactionController;
  late Animation<double> _reactionScale;
  late Animation<double> _reactionRotation;

  Timer? _blinkTimer;
  bool _eyesClosed = false;

  @override
  void initState() {
    super.initState();

    _breathController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1900),
    )..repeat(reverse: true);

    _reactionController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _setReactionForMood(widget.mood, autoplay: true);

    _scheduleBlink();
  }

  @override
  void didUpdateWidget(covariant AppMascot oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.mood != widget.mood) {
      _setReactionForMood(widget.mood, autoplay: true);
      _scheduleBlink();
    }
  }

  void _setReactionForMood(MascotMood mood, {required bool autoplay}) {
    switch (mood) {
      case MascotMood.success:
        _reactionScale = TweenSequence<double>([
          TweenSequenceItem(tween: Tween(begin: 0.6, end: 1.15), weight: 55),
          TweenSequenceItem(tween: Tween(begin: 1.15, end: 0.96), weight: 25),
          TweenSequenceItem(tween: Tween(begin: 0.96, end: 1.0), weight: 20),
        ]).animate(CurvedAnimation(parent: _reactionController, curve: Curves.easeOut));
        _reactionRotation = Tween(begin: 0.0, end: 0.0).animate(_reactionController);
        break;
      case MascotMood.error:
        _reactionScale = Tween(begin: 1.0, end: 1.0).animate(_reactionController);
        _reactionRotation = TweenSequence<double>([
          TweenSequenceItem(tween: Tween(begin: 0.0, end: -0.06), weight: 1),
          TweenSequenceItem(tween: Tween(begin: -0.06, end: 0.06), weight: 1),
          TweenSequenceItem(tween: Tween(begin: 0.06, end: -0.04), weight: 1),
          TweenSequenceItem(tween: Tween(begin: -0.04, end: 0.0), weight: 1),
        ]).animate(CurvedAnimation(parent: _reactionController, curve: Curves.easeInOut));
        break;
      case MascotMood.loading:
      case MascotMood.empty:
        _reactionScale = Tween(begin: 0.9, end: 1.0)
            .animate(CurvedAnimation(parent: _reactionController, curve: Curves.easeOutBack));
        _reactionRotation = Tween(begin: 0.0, end: 0.0).animate(_reactionController);
        break;
    }
    if (autoplay) {
      _reactionController.forward(from: 0);
    }
  }

  void _scheduleBlink() {
    _blinkTimer?.cancel();
    if (widget.mood != MascotMood.loading) {
      if (_eyesClosed) setState(() => _eyesClosed = false);
      return;
    }
    final wait = 2200 + Random().nextInt(2200);
    _blinkTimer = Timer(Duration(milliseconds: wait), () async {
      if (!mounted) return;
      setState(() => _eyesClosed = true);
      await Future.delayed(const Duration(milliseconds: 140));
      if (!mounted) return;
      setState(() => _eyesClosed = false);
      _scheduleBlink();
    });
  }

  void _onTap() {
    HapticFeedback.selectionClick();
    _reactionController.forward(from: 0);
  }

  String get _assetName {
    switch (widget.mood) {
      case MascotMood.loading:
        return _eyesClosed ? 'mascot_loading_blink' : 'mascot_loading_open';
      case MascotMood.error:
        return 'mascot_error';
      case MascotMood.success:
        return 'mascot_success';
      case MascotMood.empty:
        return 'mascot_empty';
    }
  }

  @override
  void dispose() {
    _blinkTimer?.cancel();
    _breathController.dispose();
    _reactionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedBuilder(
        animation: Listenable.merge([_breathController, _reactionController]),
        builder: (context, child) {
          final breath = 1.0 + (sin(_breathController.value * pi) * 0.02);
          final scale = breath * _reactionScale.value;
          return Transform.rotate(
            angle: _reactionRotation.value,
            child: Transform.scale(scale: scale, child: child),
          );
        },
        child: SizedBox(
          width: widget.size,
          height: widget.size * (220 / 240),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 110),
            child: SvgPicture.asset(
              '$_assetPath/$_assetName.svg',
              key: ValueKey(_assetName),
              width: widget.size,
              fit: BoxFit.contain,
            ),
          ),
        ),
      ),
    );
  }
}
