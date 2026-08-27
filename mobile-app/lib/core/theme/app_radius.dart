import 'package:flutter/material.dart';

/// Corner radii — chips/fields/cards/canvases each have one fixed radius,
/// never mixed within a surface.
class AppRadius {
  static const double pill = 999; // chips, filters, search fields, badges
  static const double field = 10; // inputs and buttons
  static const double card = 14; // the house card
  static const double xl2 = 28; // media-maker canvases and modals

  static final BorderRadius pillRadius = BorderRadius.circular(pill);
  static final BorderRadius fieldRadius = BorderRadius.circular(field);
  static final BorderRadius cardRadius = BorderRadius.circular(card);
  static final BorderRadius xl2Radius = BorderRadius.circular(xl2);
}
