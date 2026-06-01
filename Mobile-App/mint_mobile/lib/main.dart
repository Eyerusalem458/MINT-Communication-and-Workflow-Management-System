import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'utils/constants.dart';
import 'utils/storage.dart';

import 'providers/auth_provider.dart';
import 'providers/task_provider.dart';
import 'providers/project_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/user_provider.dart';
import 'providers/chat_provider.dart';

import 'routes.dart';

// IMPORT THIS
import 'screens/shared/chat_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Storage.init();
  runApp(const MintApp());
}

class MintApp extends StatelessWidget {
  const MintApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TaskProvider()),
        ChangeNotifierProvider(create: (_) => ProjectProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),

        // ADD THIS
        ChangeNotifierProvider(
          create: (_) => ThemeModeNotifier(),
        ),
      ],

      child: Builder(
        builder: (context) {
          final themeNotifier = context.watch<ThemeModeNotifier>();

          return MaterialApp(
            title: 'MINT',
            debugShowCheckedModeBanner: false,

            // LIGHT THEME
            theme: buildAppTheme(),

            // DARK THEME
            darkTheme: ThemeData.dark(),

            // THEME MODE
            themeMode: themeNotifier.mode,

            // 🔥 IMPORTANT: Mobile-like responsive layout for web
            builder: (context, child) {
              return Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: child!,
                ),
              );
            },

            initialRoute: '/',
            onGenerateRoute: AppRoutes.onGenerateRoute,
          );
        },
      ),
    );
  }
}