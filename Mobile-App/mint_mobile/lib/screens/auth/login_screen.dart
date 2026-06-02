import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  bool _showPass = false;

  // Inline error state for each field + a general login error
  String? _emailError;
  String? _passError;
  String? _loginError;

  /// Validates fields locally. Returns true if all inputs are valid.
  bool _validate() {
    String? emailErr;
    String? passErr;

    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text.trim();

    if (email.isEmpty) {
      emailErr = 'Email is required.';
    } else if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(email)) {
      emailErr = 'Please enter a valid email address.';
    }

    if (pass.isEmpty) {
      passErr = 'Password is required.';
    } else if (pass.length < 6) {
      passErr = 'Password must be at least 6 characters.';
    }

    setState(() {
      _emailError = emailErr;
      _passError = passErr;
      _loginError = null; // clear any previous server error
    });

    return emailErr == null && passErr == null;
  }

  Future<void> _handleLogin() async {
    if (!_validate()) return;

    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text.trim();

    try {
      final user = await context.read<AuthProvider>().login(email, pass);

      if (!mounted) return;

      switch (user.role) {
        case 'admin':
          Navigator.pushReplacementNamed(context, '/admin');
          break;
        case 'manager':
          Navigator.pushReplacementNamed(context, '/manager');
          break;
        default:
          Navigator.pushReplacementNamed(context, '/staff');
      }
    } catch (_) {
      if (!mounted) return;

      final auth = context.read<AuthProvider>();

      // Show the error inline inside the card — no raw SnackBar
      setState(() {
        _loginError =
            auth.error ?? 'Login failed. Please try again.';
      });
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,

        // BACKGROUND
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFF4F5EC),
              Color(0xFFDDEFE9),
              Color(0xFF7BC5C8),
            ],
          ),
        ),

        child: Stack(
          children: [
            // TOP SOFT SHAPE
            Positioned(
              top: -120,
              left: -120,
              child: Container(
                width: 320,
                height: 320,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.12),
                ),
              ),
            ),

            // BOTTOM SOFT SHAPE
            Positioned(
              bottom: -180,
              right: -140,
              child: Container(
                width: 500,
                height: 500,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),

            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 20,
                  ),
                  child: Column(
                    children: [
                      // LOGO
                      Image.asset(
                        'assets/images/logo2.png',
                        height: 120,
                      ),

                      const SizedBox(height: 20),

                      // TITLE
                      const Text(
                        'Welcome Back',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0B4F63),
                        ),
                      ),

                      const SizedBox(height: 10),

                      // GOLD LINE
                      Container(
                        width: 70,
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF4AE2B),
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // SUBTEXT
                      const Text(
                        'Login to continue your journey with MINT',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          height: 1.5,
                          color: Color(0xFF40606E),
                        ),
                      ),

                      const SizedBox(height: 40),

                      // LOGIN CARD
                      Container(
                        width: 380,
                        padding: const EdgeInsets.all(26),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.2),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // ── SERVER / AUTH ERROR BANNER ──────────────────
                            if (_loginError != null) ...[
                              _ErrorBanner(message: _loginError!),
                              const SizedBox(height: 18),
                            ],

                            // EMAIL FIELD
                            TextField(
                              controller: _emailCtrl,
                              keyboardType: TextInputType.emailAddress,
                              onChanged: (_) {
                                // Clear field error as the user starts typing
                                if (_emailError != null) {
                                  setState(() => _emailError = null);
                                }
                              },
                              decoration: InputDecoration(
                                hintText: 'Email',
                                filled: true,
                                fillColor: Colors.white.withValues(alpha: 0.9),
                                prefixIcon: const Icon(
                                  Icons.email_outlined,
                                  color: Color(0xFF0B4F63),
                                ),
                                // Red border when there is a field error
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: _emailError != null
                                      ? const BorderSide(
                                          color: Color(0xFFD93025),
                                          width: 1.5,
                                        )
                                      : BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: BorderSide(
                                    color: _emailError != null
                                        ? const Color(0xFFD93025)
                                        : const Color(0xFF0B4F63),
                                    width: 1.5,
                                  ),
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),

                            // EMAIL INLINE ERROR
                            if (_emailError != null)
                              _FieldError(message: _emailError!),

                            const SizedBox(height: 18),

                            // PASSWORD FIELD
                            TextField(
                              controller: _passCtrl,
                              obscureText: !_showPass,
                              onChanged: (_) {
                                if (_passError != null) {
                                  setState(() => _passError = null);
                                }
                              },
                              decoration: InputDecoration(
                                hintText: 'Password',
                                filled: true,
                                fillColor: Colors.white.withValues(alpha: 0.9),
                                prefixIcon: const Icon(
                                  Icons.lock_outline,
                                  color: Color(0xFF0B4F63),
                                ),
                                suffixIcon: IconButton(
                                  onPressed: () {
                                    setState(() => _showPass = !_showPass);
                                  },
                                  icon: Icon(
                                    _showPass
                                        ? Icons.visibility_off
                                        : Icons.visibility,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: _passError != null
                                      ? const BorderSide(
                                          color: Color(0xFFD93025),
                                          width: 1.5,
                                        )
                                      : BorderSide.none,
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: BorderSide(
                                    color: _passError != null
                                        ? const Color(0xFFD93025)
                                        : const Color(0xFF0B4F63),
                                    width: 1.5,
                                  ),
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),

                            // PASSWORD INLINE ERROR
                            if (_passError != null)
                              _FieldError(message: _passError!),

                            const SizedBox(height: 10),

                            // FORGOT PASSWORD
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () {
                                  Navigator.pushNamed(
                                    context,
                                    '/forgot-password',
                                  );
                                },
                                child: const Text(
                                  'Forgot Password?',
                                  style: TextStyle(
                                    color: Color(0xFF0B4F63),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            // LOGIN BUTTON
                            SizedBox(
                              width: double.infinity,
                              height: 58,
                              child: ElevatedButton(
                                onPressed: auth.loading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFF4AE2B),
                                  disabledBackgroundColor:
                                      const Color(0xFFF4AE2B).withValues(alpha: 0.6),
                                  elevation: 8,
                                  shadowColor: const Color(0x66F4AE2B),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(40),
                                  ),
                                ),
                                child: auth.loading
                                    ? const SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2.5,
                                        ),
                                      )
                                    : const Text(
                                        'Login',
                                        style: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 30),

                      // FOOTER
                      const Text(
                        '© 2026 Ministry of Innovation & Technology',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helper widgets kept in the same file for simplicity.
// ─────────────────────────────────────────────────────────────────────────────

/// Red inline text shown directly under a field that failed validation.
class _FieldError extends StatelessWidget {
  const _FieldError({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 6, left: 4),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline,
            size: 14,
            color: Color(0xFFD93025),
          ),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              message,
              style: const TextStyle(
                color: Color(0xFFD93025),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Soft red banner shown at the top of the card for server-side errors
/// (wrong credentials, account not found, network issues, etc.).
class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEDED),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD93025).withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.cancel_outlined,
            color: Color(0xFFD93025),
            size: 20,
          ),
          const SizedBox(width: 10),
          Flexible(
            child: Text(
              message,
              style: const TextStyle(
                color: Color(0xFFB71C1C),
                fontSize: 13,
                height: 1.4,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}