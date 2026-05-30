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

  Future<void> _handleLogin() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text.trim();

    if (email.isEmpty || pass.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Enter email and password'),
        ),
      );
      return;
    }

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
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
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
                  color: Colors.white.withOpacity(0.12),
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
                  color: Colors.white.withOpacity(0.08),
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
                          color: Color(0xFFF4AE2B),
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
                          color: Colors.white.withOpacity(0.18),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            // EMAIL
                            TextField(
                              controller: _emailCtrl,
                              decoration: InputDecoration(
                                hintText: 'Email',
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.9),
                                prefixIcon: const Icon(
                                  Icons.email_outlined,
                                  color: Color(0xFF0B4F63),
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),

                            const SizedBox(height: 18),

                            // PASSWORD
                            TextField(
                              controller: _passCtrl,
                              obscureText: !_showPass,
                              decoration: InputDecoration(
                                hintText: 'Password',
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.9),
                                prefixIcon: const Icon(
                                  Icons.lock_outline,
                                  color: Color(0xFF0B4F63),
                                ),
                                suffixIcon: IconButton(
                                  onPressed: () {
                                    setState(() {
                                      _showPass = !_showPass;
                                    });
                                  },
                                  icon: Icon(
                                    _showPass
                                        ? Icons.visibility_off
                                        : Icons.visibility,
                                  ),
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(18),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),

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

                            // BUTTON
                            SizedBox(
                              width: double.infinity,
                              height: 58,
                              child: ElevatedButton(
                                onPressed: auth.loading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFF4AE2B),
                                  elevation: 8,
                                  shadowColor: const Color(0x66F4AE2B),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(40),
                                  ),
                                ),
                                child: auth.loading
                                    ? const CircularProgressIndicator(
                                        color: Colors.white,
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
