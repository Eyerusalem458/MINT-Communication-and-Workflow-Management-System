import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
//import '../../providers/auth_provider.dart';
import '../../providers/notification_provider.dart';
import '../../api/user_api.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});
  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  Map<String, int> _stats = {
    'total': 0,
    'managers': 0,
    'staff': 0,
    'activeUsers': 0,
  };
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
    WidgetsBinding.instance.addPostFrameCallback((_) =>
        context.read<NotificationProvider>().fetchNotifications());
  }

  Future<void> _loadStats() async {
    try {
      final res = await UserApi.getUserStats();
      setState(() {
        _stats = {
          'total': res.data['total'] ?? 0,
          'managers': res.data['managers'] ?? 0,
          'staff': res.data['staff'] ?? 0,
          'activeUsers': res.data['activeUsers'] ?? 0,
        };
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // No Scaffold or AppBar here — the shell (AdminShell) owns the AppBar
    // and drawer so the hamburger menu works across all tabs.
    final notifs = context.watch<NotificationProvider>();

    return RefreshIndicator(
      onRefresh: _loadStats,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // ── Summary banner ─────────────────────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('System Overview',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text('Overview of admin activity and user statistics',
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.8), fontSize: 12)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _BannerStat(
                          label: 'Total Users',
                          value: '${_stats['total']}',
                          icon: Icons.people),
                      _BannerStat(
                          label: 'Managers',
                          value: '${_stats['managers']}',
                          icon: Icons.manage_accounts),
                      _BannerStat(
                          label: 'Staff',
                          value: '${_stats['staff']}',
                          icon: Icons.badge),
                      _BannerStat(
                          label: 'Active',
                          value: '${_stats['activeUsers']}',
                          icon: Icons.check_circle_outline),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Metric cards ───────────────────────────────────────────────────
            _loading
                ? const Center(
                    child:
                        CircularProgressIndicator(color: AppColors.primary))
                : GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.2,
                    children: [
                      _ColoredMetricCard(
                        label: 'Total Users',
                        value: '${_stats['total']}',
                        color: const Color(0xFF4CAF50),
                        icon: Icons.people,
                      ),
                      _ColoredMetricCard(
                        label: 'Total Managers',
                        value: '${_stats['managers']}',
                        color: const Color(0xFF2196F3),
                        icon: Icons.manage_accounts,
                      ),
                      _ColoredMetricCard(
                        label: 'Total Staff',
                        value: '${_stats['staff']}',
                        color: const Color(0xFFFF9800),
                        icon: Icons.badge,
                      ),
                      _ColoredMetricCard(
                        label: 'Active Users',
                        value: '${_stats['activeUsers']}',
                        color: const Color(0xFFF44336),
                        icon: Icons.check_circle_outline,
                      ),
                    ],
                  ),
            const SizedBox(height: 16),

            // ── Recent notifications ───────────────────────────────────────────
            SectionCard(
              title: 'Recent Notifications',
              child: notifs.notifications.isEmpty
                  ? const EmptyState(
                      message: 'No notifications',
                      icon: Icons.notifications_none)
                  : Column(
                      children: notifs.notifications.take(5).map((n) =>
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Row(children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  shape: BoxShape.circle),
                              child: Center(
                                  child: Text(_typeEmoji(n.type),
                                      style:
                                          const TextStyle(fontSize: 14))),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                                child: Text(n.message,
                                    style: const TextStyle(fontSize: 12),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis)),
                            const SizedBox(width: 8),
                            StatusBadge(n.type),
                          ]),
                        )).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  String _typeEmoji(String type) {
    switch (type.toLowerCase()) {
      case 'task':    return '✅';
      case 'project': return '📁';
      case 'system':  return '⚙️';
      default:        return '🔔';
    }
  }
}

// ─── Private widgets ──────────────────────────────────────────────────────────

class _BannerStat extends StatelessWidget {
  final String label, value;
  final IconData icon;
  const _BannerStat(
      {required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Icon(icon, color: Colors.white70, size: 20),
      const SizedBox(height: 4),
      Text(value,
          style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700)),
      Text(label,
          style: const TextStyle(color: Colors.white70, fontSize: 10)),
    ]);
  }
}

class _ColoredMetricCard extends StatelessWidget {
  final String label, value;
  final Color color;
  final IconData icon;
  const _ColoredMetricCard(
      {required this.label,
      required this.value,
      required this.color,
      required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 8,
                offset: const Offset(0, 2))
          ]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
              color: color, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
        const SizedBox(height: 10),
        Text(label,
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary)),
      ]),
    );
  }
}