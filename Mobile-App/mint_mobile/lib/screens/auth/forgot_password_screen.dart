import 'package:flutter/material.dart';
import '../../api/auth_api.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _isLoading = false;
  bool _emailSent = false;

  Future<void> _handleForgotPassword() async {
    final email = _emailCtrl.text.trim();

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await AuthApi.forgotPassword(email);

      if (!mounted) return;

      setState(() {
        _emailSent = true;
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
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forgot Password'),
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
              if (_emailSent)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(width: double.infinity),
                    // FIX 1: AppColors.success → Colors.green
                    const Icon(
                      Icons.check_circle,
                      size: 80,
                      color: Colors.green,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Check Your Email',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // FIX 2: Switched to double-quoted string to avoid backslash escapes
                    Text(
                      "We've sent a password reset link to ${_emailCtrl.text}. Check your email and click the link to reset your password. The link expires in 30 minutes.",
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        color: AppColors.textMuted,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 40),
                    SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        label: 'Back to Login',
                        // FIX 3: pushReplacementNamed so the forgot-password screen
                        // is removed from the stack — user can't go back to it from login
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
                      'Reset Your Password',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // FIX 2 (also here): double-quoted string, no escape needed
                    const Text(
                      "Enter your email address and we'll send you a link to reset your password.",
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textMuted,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 40),
                    TextField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                        labelText: 'Email Address',
                        hintText: 'Enter your email',
                        prefixIcon: const Icon(Icons.email_outlined),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        label: _isLoading ? 'Sending...' : 'Send Reset Link',
                        onTap: _handleForgotPassword,
                        loading: _isLoading,
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: AppButton(
                        label: 'Back to Login',
                        variant: 'ghost',
                        // Navigator.pop is correct here — this button appears
                        // before the email is sent, so just go back normally
                        onTap: () => Navigator.pop(context),
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
