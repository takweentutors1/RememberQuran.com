import 'package:flutter/material.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

class AnimatedActionButton extends StatefulWidget {
  final Widget icon;
  final Future<void> Function() onPressed;
  final double iconSize;
  final String? tooltip;

  const AnimatedActionButton({
    Key? key,
    required this.icon,
    required this.onPressed,
    this.iconSize = 20,
    this.tooltip,
  }) : super(key: key);

  @override
  State<AnimatedActionButton> createState() => _AnimatedActionButtonState();
}

class _AnimatedActionButtonState extends State<AnimatedActionButton> {
  bool _isLoading = false;

  Future<void> _handlePress() async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
    });

    try {
      // Ensure the animation is visible for at least a brief moment for very fast sync actions
      await Future.wait([
        widget.onPressed(),
        Future.delayed(const Duration(milliseconds: 500)), // Shows the beautiful animation
      ]);
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: _isLoading
          ? LoadingAnimationWidget.inkDrop(
              color: Theme.of(context).colorScheme.primary,
              size: widget.iconSize - 2,
            )
          : widget.icon,
      onPressed: _handlePress,
      iconSize: widget.iconSize,
      tooltip: widget.tooltip,
    );
  }
}
