import 'package:flutter/material.dart';
import '../../api/auth_api.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String token;

  const ResetPasswordScreen({super.key, required this.token});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _showPassword = false;
  bool _showConfirm = false;
  bool _isLoading = false;
  bool _resetSuccess = false;

  Future<void> _handleResetPassword() async {
    final password = _passwordCtrl.text.trim();
    final confirm = _confirmCtrl.text.trim();

    if (password.isEmpty || confirm.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    if (password != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    if (password.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password must be at least 6 characters')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await AuthApi.resetPassword(widget.token, password);

      if (!mounted) return;

      setState(() {
        _resetSuccess = true;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() => _isLoading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  @override
  void dispose() {
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reset Password'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              if (_resetSuccess)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(width: double.infinity),
                    // FIX 1: Replaced AppColors.success with Colors.green
                    // since AppColors.success is likely not defined in constants.dart.
                    // Add `static const Color success = Color(0xFF4CAF50);` to AppColors if preferred.
                    const Icon(
                      Icons.check_circle,
                      size: 80,
                      color: Colors.green,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Password Reset Successful',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      // FIX 2: Removed unnecessary backslash escape before apostrophe.
                      // Dart double-quoted strings don't need \' — it was causing a lint warning.
                      "Your password has been reset successfully. You can now log in with your new password.",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textMuted,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 40),
                    SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        label: 'Go to Login',
                        // FIX 3: Use pushReplacementNamed so the user can't navigate
                        // back to the reset screen after a successful password reset.
                        onTap: () =>
                            Navigator.pushReplacementNamed(context, '/login'),
                      ),
                    ),
                  ],
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Create New Password',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      "Enter a new password for your account. Make sure it's strong and secure.",
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textMuted,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 40),
                    TextField(
                      controller: _passwordCtrl,
                      obscureText: !_showPassword,
                      decoration: InputDecoration(
                        labelText: 'New Password',
                        hintText: 'Enter new password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () {
                            setState(() => _showPassword = !_showPassword);
                          },
                          icon: Icon(
                            _showPassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                          ),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _confirmCtrl,
                      obscureText: !_showConfirm,
                      decoration: InputDecoration(
                        labelText: 'Confirm Password',
                        hintText: 'Confirm your password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () {
                            setState(() => _showConfirm = !_showConfirm);
                          },
                          icon: Icon(
                            _showConfirm
                                ? Icons.visibility_off
                                : Icons.visibility,
                          ),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        label: _isLoading ? 'Resetting...' : 'Reset Password',
                        onTap: _handleResetPassword,
                        loading: _isLoading,
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        label: 'Back to Login',
                        variant: 'ghost',
                        // FIX 3 (also here): Use pushReplacementNamed to avoid
                        // stacking the login screen on top of the reset screen.
                        onTap: () =>
                            Navigator.pushReplacementNamed(context, '/login'),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
