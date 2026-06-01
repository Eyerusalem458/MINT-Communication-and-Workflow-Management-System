import 'package:flutter/material.dart';

// ─── BASE URL ─────────────────────────────────────────────────────────────────
// Change this to your server IP when testing on a real device
const String kBaseUrl = 'http://localhost:5000/api';
const String kSocketUrl = 'http://localhost:5000';
const String kMediaBaseUrl = 'http://localhost:5000';

// ─── ROLES ────────────────────────────────────────────────────────────────────
const String kRoleStaff = 'staff';
const String kRoleManager = 'manager';
const String kRoleAdmin = 'admin';

// ─── APP COLORS (matches web frontend exactly) ────────────────────────────────
class AppColors {
  // Primary gradient (sidebar background)
  static const Color primary = Color(0xFF1A7A8A);
  static const Color primaryDark = Color(0xFF0B3F91);
  static const Color primaryDeep = Color(0xFF041935);

  // Accent
  static const Color accent = Color(0xFFFF9800);

  // Background
  static const Color bgLight = Color(0xFFF4F7FB);
  static const Color bgLight2 = Color(0xFFE4EDF9);

  // Surface
  static const Color card = Colors.white;
  static const Color surface = Color(0xFFF1F5F9);
  static const Color surface2 = Color(0xFFF9FAFB);

  // Text
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textLight = Color(0xFF94A3B8);

  // Borders
  static const Color border = Color(0xFFE5E7EB);

  // Semantic
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFD97706);
  static const Color danger = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Chat bubbles
  static const Color bubbleOutgoing = Color(0xFF6396D0);
  static const Color bubbleIncoming = Color(0xFFE5E7EB);

  // Status badges
  static const Color statusPendingBg = Color(0xFFFFF3CD);
  static const Color statusPendingText = Color(0xFF856404);
  static const Color statusApprovedBg = Color(0xFFD4EDDA);
  static const Color statusApprovedText = Color(0xFF155724);
  static const Color statusRejectedBg = Color(0xFFF8D7DA);
  static const Color statusRejectedText = Color(0xFF721C24);
  static const Color statusActiveBg = Color(0xFFDCFCE7);
  static const Color statusActiveText = Color(0xFF166534);
  static const Color statusInactiveBg = Color(0xFFFEE2E2);
  static const Color statusInactiveText = Color(0xFF991B1B);
}

// ─── THEME ────────────────────────────────────────────────────────────────────
ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    fontFamily: 'Inter',
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      secondary: AppColors.accent,
      surface: AppColors.bgLight,
    ),
    scaffoldBackgroundColor: AppColors.bgLight,
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: AppColors.border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(999),
        borderSide: BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(999),
        borderSide: BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(999),
        borderSide: BorderSide(color: AppColors.primary, width: 1.5),
      ),
      hintStyle: const TextStyle(color: AppColors.textLight, fontSize: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textMuted,
      showUnselectedLabels: true,
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
      unselectedLabelStyle: TextStyle(fontSize: 10),
      elevation: 8,
    ),
  );
}

// ─── STATUS BADGE HELPER ──────────────────────────────────────────────────────
Color statusBgColor(String status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return AppColors.statusPendingBg;
    case 'approved':
    case 'completed':
      return AppColors.statusApprovedBg;
    case 'rejected':
    case 'cancelled':
      return AppColors.statusRejectedBg;
    case 'in progress':
      return const Color(0xFFDBEAFE);
    case 'active':
      return AppColors.statusActiveBg;
    case 'inactive':
      return AppColors.statusInactiveBg;
    default:
      return AppColors.surface;
  }
}

Color statusTextColor(String status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return AppColors.statusPendingText;
    case 'approved':
    case 'completed':
      return AppColors.statusApprovedText;
    case 'rejected':
    case 'cancelled':
      return AppColors.statusRejectedText;
    case 'in progress':
      return const Color(0xFF1D4ED8);
    case 'active':
      return AppColors.statusActiveText;
    case 'inactive':
      return AppColors.statusInactiveText;
    default:
      return AppColors.textMuted;
  }
}
