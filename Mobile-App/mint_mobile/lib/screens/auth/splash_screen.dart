import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // ── Ring pulse ─────────────────────────────────────────────────────────────
  late final AnimationController _ringCtrl;
  late final Animation<double> _ringScale;
  late final Animation<double> _ringOpacity;

  // ── Logo entry ─────────────────────────────────────────────────────────────
  late final AnimationController _logoCtrl;
  late final Animation<double> _logoScale;
  late final Animation<double> _logoFade;
  late final Animation<double> _logoRotate; // gentle tilt-in

  // ── Shimmer sweep ──────────────────────────────────────────────────────────
  late final AnimationController _shimmerCtrl;
  late final Animation<double> _shimmerOffset;

  // ── Tag-line fade ──────────────────────────────────────────────────────────
  late final AnimationController _textCtrl;
  late final Animation<double> _textFade;
  late final Animation<Offset> _textSlide;

  // ── Dot indicators ─────────────────────────────────────────────────────────
  late final AnimationController _dotCtrl;

  @override
  void initState() {
    super.initState();

    // 1. Outer ring pulse – starts immediately, loops
    _ringCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
    _ringScale = Tween<double>(begin: 0.72, end: 1.35).animate(
      CurvedAnimation(parent: _ringCtrl, curve: Curves.easeOut),
    );
    _ringOpacity = Tween<double>(begin: 0.55, end: 0.0).animate(
      CurvedAnimation(parent: _ringCtrl, curve: Curves.easeOut),
    );

    // 2. Logo springs in after 200 ms
    _logoCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _logoScale = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _logoCtrl, curve: Curves.elasticOut),
    );
    _logoFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoCtrl,
        curve: const Interval(0.0, 0.4, curve: Curves.easeIn),
      ),
    );
    _logoRotate = Tween<double>(begin: -0.08, end: 0.0).animate(
      CurvedAnimation(parent: _logoCtrl, curve: Curves.elasticOut),
    );

    // 3. Shimmer sweeps across logo once after logo settles
    _shimmerCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _shimmerOffset = Tween<double>(begin: -1.5, end: 1.5).animate(
      CurvedAnimation(parent: _shimmerCtrl, curve: Curves.easeInOut),
    );

    // 4. Tag-line slides up
    _textCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _textFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _textCtrl, curve: Curves.easeOut),
    );
    _textSlide = Tween<Offset>(
      begin: const Offset(0, 0.6),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _textCtrl, curve: Curves.easeOut));

    // 5. Loading dots pulse
    _dotCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);

    // ── Sequence ──────────────────────────────────────────────────────────────
    Future.delayed(const Duration(milliseconds: 200), () {
      if (!mounted) return;
      _logoCtrl.forward().then((_) {
        if (!mounted) return;
        _shimmerCtrl.forward().then((_) {
          if (!mounted) return;
          _textCtrl.forward();
        });
      });
    });

    // Navigate after 2.8 s
    Future.delayed(const Duration(milliseconds: 2800), () {
      if (mounted) Navigator.pushReplacementNamed(context, '/welcome');
    });
  }

  @override
  void dispose() {
    _ringCtrl.dispose();
    _logoCtrl.dispose();
    _shimmerCtrl.dispose();
    _textCtrl.dispose();
    _dotCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFF4F5EC),
              Color(0xFFDDEFE9),
              Color(0xFF63C0C7),
            ],
          ),
        ),
        child: Stack(
          children: [
            // ── Decorative background circles (matching welcome page) ──────
            Positioned(
              top: -180,
              left: -150,
              child: Container(
                width: 450,
                height: 450,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.12),
                ),
              ),
            ),
            Positioned(
              bottom: -220,
              right: -180,
              child: Container(
                width: 550,
                height: 550,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),

            // ── Centre content ────────────────────────────────────────────
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // ── Pulsing ring + logo stack ─────────────────────────
                  SizedBox(
                    width: 200,
                    height: 200,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Outer pulse ring
                        AnimatedBuilder(
                          animation: _ringCtrl,
                          builder: (_, __) => Transform.scale(
                            scale: _ringScale.value,
                            child: Opacity(
                              opacity: _ringOpacity.value,
                              child: Container(
                                width: 160,
                                height: 160,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: const Color(0xFF0B4F63),
                                    width: 2.5,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),

                        // Second, delayed ring for depth
                        AnimatedBuilder(
                          animation: _ringCtrl,
                          builder: (_, __) {
                            final t = (_ringCtrl.value + 0.45) % 1.0;
                            final scale = 0.72 + (1.35 - 0.72) * t;
                            final opacity = (0.55 * (1.0 - t)).clamp(0.0, 1.0);
                            return Transform.scale(
                              scale: scale,
                              child: Opacity(
                                opacity: opacity,
                                child: Container(
                                  width: 160,
                                  height: 160,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: const Color(0xFF29586B),
                                      width: 1.5,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),

                        // Logo with spring + shimmer
                        AnimatedBuilder(
                          animation: Listenable.merge(
                              [_logoCtrl, _shimmerCtrl]),
                          builder: (_, __) => FadeTransition(
                            opacity: _logoFade,
                            child: Transform.rotate(
                              angle: _logoRotate.value,
                              child: Transform.scale(
                                scale: _logoScale.value,
                                child: ClipOval(
                                  child: Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      Image.asset(
                                        'assets/images/logo2.png',
                                        width: 130,
                                        height: 130,
                                        fit: BoxFit.contain,
                                      ),
                                      // Shimmer sweep
                                      if (_shimmerCtrl.value > 0 &&
                                          _shimmerCtrl.value < 1)
                                        Positioned.fill(
                                          child: Transform.translate(
                                            offset: Offset(
                                              _shimmerOffset.value * 130,
                                              0,
                                            ),
                                            child: Container(
                                              width: 40,
                                              decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                  colors: [
                                                    Colors.white
                                                        .withValues(alpha: 0.0),
                                                    Colors.white
                                                        .withValues(alpha: 0.45),
                                                    Colors.white
                                                        .withValues(alpha: 0.0),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 36),

                  // ── Tag-line ──────────────────────────────────────────
                  FadeTransition(
                    opacity: _textFade,
                    child: SlideTransition(
                      position: _textSlide,
                      child: Column(
                        children: [
                          const Text(
                            'MINT',
                            style: TextStyle(
                              fontSize: 30,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0B4F63),
                              letterSpacing: 8,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Ministry of Innovation & Technology',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF29586B)
                                  .withValues(alpha: 0.85),
                              letterSpacing: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 48),

                  // ── Animated loading dots ─────────────────────────────
                  FadeTransition(
                    opacity: _textFade,
                    child: _LoadingDots(controller: _dotCtrl),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Three staggered pulsing dots ─────────────────────────────────────────────
class _LoadingDots extends StatelessWidget {
  final AnimationController controller;
  const _LoadingDots({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (i) {
        final start = i * 0.25;
        final end = (start + 0.5).clamp(0.0, 1.0);
        final anim = Tween<double>(begin: 0.3, end: 1.0).animate(
          CurvedAnimation(
            parent: controller,
            curve: Interval(start, end, curve: Curves.easeInOut),
          ),
        );
        return AnimatedBuilder(
          animation: anim,
          builder: (_, __) => Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: 7,
            height: 7,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Color.lerp(
                const Color(0xFF63C0C7).withValues(alpha: 0.4),
                const Color(0xFF0B4F63),
                anim.value,
              ),
            ),
          ),
        );
      }),
    );
  }
}