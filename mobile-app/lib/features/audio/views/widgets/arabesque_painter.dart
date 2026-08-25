import 'package:flutter/material.dart';
import 'dart:math' as math;

class ArabesquePainter extends CustomPainter {
  final Color color;

  ArabesquePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2.5;

    // Draw a 12-pointed star pattern
    final path = Path();
    for (int i = 0; i < 12; i++) {
      final angle = i * math.pi / 6;
      final nextAngle = (i + 1) * math.pi / 6;
      
      final p1 = Offset(
        center.dx + radius * math.cos(angle),
        center.dy + radius * math.sin(angle),
      );
      
      final p2 = Offset(
        center.dx + radius * 0.7 * math.cos(angle + math.pi / 12),
        center.dy + radius * 0.7 * math.sin(angle + math.pi / 12),
      );
      
      final p3 = Offset(
        center.dx + radius * math.cos(nextAngle),
        center.dy + radius * math.sin(nextAngle),
      );

      if (i == 0) {
        path.moveTo(p1.dx, p1.dy);
      }
      path.quadraticBezierTo(p2.dx, p2.dy, p3.dx, p3.dy);
    }
    
    path.close();
    canvas.drawPath(path, paint);
    
    // Add an outer circle
    canvas.drawCircle(center, radius * 1.2, paint);
  }

  @override
  bool shouldRepaint(covariant ArabesquePainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
