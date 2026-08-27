import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';
import 'app_radius.dart';
import 'app_motion.dart';

class AppTheme {
  static ButtonStyle _filledButtonStyle({
    required Color base,
    required Color pressed,
    required Color foreground,
  }) {
    return FilledButton.styleFrom(
      backgroundColor: base,
      foregroundColor: foreground,
      disabledBackgroundColor: base.withOpacity(0.45),
      disabledForegroundColor: foreground.withOpacity(0.45),
      shape: RoundedRectangleBorder(borderRadius: AppRadius.fieldRadius),
      textStyle: AppTypography.sans(fontSize: 15, weight: FontWeight.w600),
      animationDuration: AppMotion.durFast,
    ).copyWith(
      overlayColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.pressed)) return pressed.withOpacity(0.16);
        return null;
      }),
    );
  }

  static ButtonStyle _outlinedButtonStyle({required Color color}) {
    return OutlinedButton.styleFrom(
      foregroundColor: color,
      side: BorderSide(color: color.withOpacity(0.4)),
      shape: RoundedRectangleBorder(borderRadius: AppRadius.fieldRadius),
      textStyle: AppTypography.sans(fontSize: 15, weight: FontWeight.w600),
    );
  }

  static InputDecorationTheme _inputTheme({
    required Color fill,
    required Color border,
    required Color focus,
    required Color hint,
  }) {
    OutlineInputBorder side(Color c, {double width = 1}) => OutlineInputBorder(
      borderRadius: AppRadius.fieldRadius,
      borderSide: BorderSide(color: c, width: width),
    );
    return InputDecorationTheme(
      filled: true,
      fillColor: fill,
      hintStyle: AppTypography.sans(fontSize: 15, weight: FontWeight.w400, color: hint),
      border: side(border),
      enabledBorder: side(border),
      focusedBorder: side(focus, width: 2),
      errorBorder: side(AppColors.danger500),
      focusedErrorBorder: side(AppColors.danger500, width: 2),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.lightBackground,
    splashFactory: InkRipple.splashFactory,
    colorScheme: const ColorScheme.light(
      primary: AppColors.lightPrimary,
      onPrimary: AppColors.lightPrimaryForeground,
      secondary: AppColors.lightSecondary,
      onSecondary: AppColors.lightSecondaryForeground,
      surface: AppColors.lightCard,
      onSurface: AppColors.lightForeground,
      error: AppColors.lightDestructive,
      onError: Colors.white,
      outline: AppColors.lightBorder,
    ),
    textTheme: AppTypography.textTheme(AppColors.lightForeground, AppColors.lightMutedForeground),
    dividerColor: AppColors.lightBorder,
    dividerTheme: const DividerThemeData(color: AppColors.lightBorder, thickness: 1, space: 1),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.lightBackground,
      foregroundColor: AppColors.lightForeground,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: AppTypography.sans(
        fontSize: 16,
        weight: FontWeight.w600,
        color: AppColors.lightForeground,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.lightCard,
      elevation: 1,
      shadowColor: const Color(0xFF2B2925).withOpacity(0.5),
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.cardRadius,
        side: const BorderSide(color: AppColors.lightBorder, width: 1),
      ),
    ),
    // Cascades to every AlertDialog/Dialog in the app instantly — these had
    // been calling the bare Material default (square-ish corners, generic
    // typography, no relation to the rest of the app's visual language) at
    // every one of ~9 separate call sites.
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.lightCard,
      surfaceTintColor: Colors.transparent,
      elevation: 3,
      shadowColor: const Color(0xFF2B2925).withOpacity(0.5),
      shape: RoundedRectangleBorder(borderRadius: AppRadius.xl2Radius),
      titleTextStyle: AppTypography.sans(
        fontSize: 18,
        weight: FontWeight.w600,
        color: AppColors.lightForeground,
      ),
      contentTextStyle: AppTypography.sans(
        fontSize: 15,
        weight: FontWeight.w400,
        color: AppColors.lightMutedForeground,
        height: 1.5,
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.lightMuted,
      selectedColor: AppColors.lightAccent,
      labelStyle: AppTypography.sans(fontSize: 13, weight: FontWeight.w600, color: AppColors.lightForeground),
      secondaryLabelStyle: AppTypography.sans(fontSize: 13, weight: FontWeight.w600, color: AppColors.jade700),
      shape: RoundedRectangleBorder(borderRadius: AppRadius.pillRadius),
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: _filledButtonStyle(
        base: AppColors.jade700,
        pressed: AppColors.jade900,
        foreground: Colors.white,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: _filledButtonStyle(
        base: AppColors.jade700,
        pressed: AppColors.jade900,
        foreground: Colors.white,
      ).copyWith(elevation: const WidgetStatePropertyAll(0)),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(style: _outlinedButtonStyle(color: AppColors.jade700)),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.jade700,
        textStyle: AppTypography.sans(fontSize: 15, weight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: _inputTheme(
      fill: Colors.white,
      border: AppColors.lightInput,
      focus: AppColors.jade700,
      hint: AppColors.lightForegroundFaint,
    ),
    tabBarTheme: TabBarThemeData(
      labelColor: AppColors.lightForeground,
      unselectedLabelColor: AppColors.lightForegroundSubtle,
      indicatorColor: AppColors.gold600,
      indicatorSize: TabBarIndicatorSize.label,
      dividerColor: Colors.transparent,
      labelStyle: AppTypography.sans(fontSize: 15, weight: FontWeight.w600),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: const WidgetStatePropertyAll(Colors.white),
      trackColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.selected) ? AppColors.jade700 : AppColors.lightBorderStrong,
      ),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.jade700),
    extensions: const <ThemeExtension<dynamic>>[
      NurColorsExtension(
        surfaceSunk: AppColors.lightSurfaceSunk,
        foregroundSubtle: AppColors.lightForegroundSubtle,
        foregroundFaint: AppColors.lightForegroundFaint,
        borderStrong: AppColors.lightBorderStrong,
        brandGold: AppColors.lightBrandGold,
        brandGoldStrong: AppColors.lightBrandGoldStrong,
        brandGoldSoft: AppColors.lightBrandGoldSoft,
        readerInk: AppColors.lightReaderInk,
      ),
    ],
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.darkBackground,
    splashFactory: InkRipple.splashFactory,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.darkPrimary,
      onPrimary: AppColors.darkPrimaryForeground,
      secondary: AppColors.darkSecondary,
      onSecondary: AppColors.darkSecondaryForeground,
      surface: AppColors.darkCard,
      onSurface: AppColors.darkForeground,
      error: AppColors.darkDestructive,
      onError: Colors.white,
      outline: AppColors.darkBorder,
    ),
    textTheme: AppTypography.textTheme(AppColors.darkForeground, AppColors.darkMutedForeground),
    dividerColor: AppColors.darkBorder,
    dividerTheme: const DividerThemeData(color: AppColors.darkBorder, thickness: 1, space: 1),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.darkBackground,
      foregroundColor: AppColors.darkForeground,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: AppTypography.sans(
        fontSize: 16,
        weight: FontWeight.w600,
        color: AppColors.darkForeground,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.darkCard,
      elevation: 1,
      shadowColor: Colors.black.withOpacity(0.4),
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.cardRadius,
        side: const BorderSide(color: AppColors.darkBorder, width: 1),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.darkCard,
      surfaceTintColor: Colors.transparent,
      elevation: 3,
      shadowColor: Colors.black.withOpacity(0.5),
      shape: RoundedRectangleBorder(borderRadius: AppRadius.xl2Radius),
      titleTextStyle: AppTypography.sans(
        fontSize: 18,
        weight: FontWeight.w600,
        color: AppColors.darkForeground,
      ),
      contentTextStyle: AppTypography.sans(
        fontSize: 15,
        weight: FontWeight.w400,
        color: AppColors.darkMutedForeground,
        height: 1.5,
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.darkMuted,
      selectedColor: AppColors.darkAccent,
      labelStyle: AppTypography.sans(fontSize: 13, weight: FontWeight.w600, color: AppColors.darkForeground),
      secondaryLabelStyle: AppTypography.sans(fontSize: 13, weight: FontWeight.w600, color: AppColors.jade400),
      shape: RoundedRectangleBorder(borderRadius: AppRadius.pillRadius),
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: _filledButtonStyle(
        base: AppColors.jade400,
        pressed: AppColors.jade500,
        foreground: AppColors.darkPrimaryForeground,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: _filledButtonStyle(
        base: AppColors.jade400,
        pressed: AppColors.jade500,
        foreground: AppColors.darkPrimaryForeground,
      ).copyWith(elevation: const WidgetStatePropertyAll(0)),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(style: _outlinedButtonStyle(color: AppColors.jade400)),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.jade400,
        textStyle: AppTypography.sans(fontSize: 15, weight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: _inputTheme(
      fill: AppColors.darkCard,
      border: AppColors.darkInput,
      focus: AppColors.jade400,
      hint: AppColors.darkForegroundFaint,
    ),
    tabBarTheme: TabBarThemeData(
      labelColor: AppColors.darkForeground,
      unselectedLabelColor: AppColors.darkForegroundSubtle,
      indicatorColor: AppColors.gold300,
      indicatorSize: TabBarIndicatorSize.label,
      dividerColor: Colors.transparent,
      labelStyle: AppTypography.sans(fontSize: 15, weight: FontWeight.w600),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: const WidgetStatePropertyAll(Colors.white),
      trackColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.selected) ? AppColors.jade400 : AppColors.darkBorderStrong,
      ),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.jade400),
    extensions: const <ThemeExtension<dynamic>>[
      NurColorsExtension(
        surfaceSunk: AppColors.darkSurfaceSunk,
        foregroundSubtle: AppColors.darkForegroundSubtle,
        foregroundFaint: AppColors.darkForegroundFaint,
        borderStrong: AppColors.darkBorderStrong,
        brandGold: AppColors.darkBrandGold,
        brandGoldStrong: AppColors.darkBrandGoldStrong,
        brandGoldSoft: AppColors.darkBrandGoldSoft,
        readerInk: AppColors.darkReaderInk,
      ),
    ],
  );
}
