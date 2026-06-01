import 'package:flutter/material.dart';
import 'screens/auth/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/welcome_screen.dart'; // 👈 ADD THIS
import 'screens/auth/forgot_password_screen.dart';
import 'screens/auth/reset_password_screen.dart';
import 'screens/staff/staff_shell.dart';
import 'screens/manager/manager_shell.dart';
import 'screens/admin/admin_shell.dart';

class AppRoutes {
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return _fade(const SplashScreen());

      case '/welcome':
        return _fade(const WelcomeScreen());

      case '/login':
        return _fade(const LoginScreen());

      case '/forgot-password':
        return _fade(const ForgotPasswordScreen());

      case '/reset-password':
        final token = settings.arguments as String;
        return _fade(ResetPasswordScreen(token: token));

      case '/staff':
        return _fade(const StaffShell());

      case '/manager':
        return _fade(const ManagerShell());

      case '/admin':
        return _fade(const AdminShell());

      default:
        return _fade(const LoginScreen());
    }
  }

  static PageRoute _fade(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, anim, __, child) {
        return FadeTransition(
          opacity: anim,
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 250),
    );
  }
}
