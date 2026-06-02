// Manager settings reuses the shared SettingsScreen
// Just re-export it under the manager folder name
export '../shared/settings_screen.dart' show SettingsScreen;

import '../shared/settings_screen.dart';
import 'package:flutter/material.dart';

class ManagerSettingsScreen extends StatelessWidget {
  const ManagerSettingsScreen({super.key});
  @override
  Widget build(BuildContext context) => const SettingsScreen();
}