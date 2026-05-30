import 'package:flutter/material.dart';
import '../shared/settings_screen.dart';

/// Admin settings reuses the exact same SettingsScreen as staff/manager.
/// It handles profile update, password change, and account info
/// for any logged-in user regardless of role.
class AdminSettingsScreen extends StatelessWidget {
  const AdminSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) => const SettingsScreen();
}