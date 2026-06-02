import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../providers/user_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';
import '../shared/chat_screen.dart';
import '../shared/notifications_screen.dart';
import '../shared/activity_log_screen.dart';
import 'manager_dashboard_screen.dart';
import 'task_mgmt_screen.dart';
import 'staff_mgmt_screen.dart';
import 'reports_screen.dart';
import 'project_requests_screen.dart';
import 'manager_settings_screen.dart';

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String appBarTitle;
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.appBarTitle,
  });
}

class ManagerShell extends StatefulWidget {
  const ManagerShell({super.key});
  @override
  State<ManagerShell> createState() => _ManagerShellState();
}

class _ManagerShellState extends State<ManagerShell> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskProvider>().fetchTasks();
      context.read<ProjectProvider>().fetchProjects();
      context.read<UserProvider>().fetchUsers('manager');
      context.read<NotificationProvider>().startPolling();
    });
  }

  @override
  void dispose() {
    context.read<NotificationProvider>().stopPolling();
    super.dispose();
  }

  late final List<Widget> _screens = [
    ChatScreen(scaffoldKey: _scaffoldKey),
    const ManagerDashboardScreen(),
    const TaskMgmtScreen(),
    const StaffMgmtScreen(),
    const ReportsScreen(),
    const ProjectRequestsScreen(),
    const NotificationsScreen(),
    const ActivityLogScreen(),
    const ManagerSettingsScreen(),
  ];

  final List<_NavItem> _navItems = const [
    _NavItem(
        icon: Icons.chat_bubble_outline,
        activeIcon: Icons.chat_bubble,
        label: 'Chat',
        appBarTitle: 'Chats'),
    _NavItem(
        icon: Icons.dashboard_outlined,
        activeIcon: Icons.dashboard,
        label: 'Dashboard',
        appBarTitle: 'Manager Dashboard'),
    _NavItem(
        icon: Icons.task_outlined,
        activeIcon: Icons.task,
        label: 'Task Management',
        appBarTitle: 'Task Management'),
    _NavItem(
        icon: Icons.people_outline,
        activeIcon: Icons.people,
        label: 'Staff Management',
        appBarTitle: 'Staff Management'),
    _NavItem(
        icon: Icons.bar_chart_outlined,
        activeIcon: Icons.bar_chart,
        label: 'Reports',
        appBarTitle: 'Reports'),
    _NavItem(
        icon: Icons.folder_open_outlined,
        activeIcon: Icons.folder_open,
        label: 'Project Requests',
        appBarTitle: 'Project Requests'),
    _NavItem(
        icon: Icons.notifications_outlined,
        activeIcon: Icons.notifications,
        label: 'Notifications',
        appBarTitle: 'Notifications'),
    _NavItem(
        icon: Icons.history_outlined,
        activeIcon: Icons.history,
        label: 'Activity Log',
        appBarTitle: 'Activity Log'),
    _NavItem(
        icon: Icons.settings_outlined,
        activeIcon: Icons.settings,
        label: 'Settings',
        appBarTitle: 'Settings'),
  ];

  void _selectTab(int index) {
    setState(() => _currentIndex = index);
    _scaffoldKey.currentState?.closeDrawer();
  }

  @override
  Widget build(BuildContext context) {
    final unseenCount = context.watch<NotificationProvider>().unseenCount;
    final user = context.watch<AuthProvider>().user;
    final currentItem = _navItems[_currentIndex];
    final bool isChatTab = _currentIndex == 0;

    return Scaffold(
      key: _scaffoldKey,
      appBar: isChatTab
          ? null
          : AppBar(
              backgroundColor: AppColors.primary,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.menu, color: Colors.white),
                tooltip: 'Menu',
                onPressed: () => _scaffoldKey.currentState?.openDrawer(),
              ),
              title: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(currentItem.appBarTitle,
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Colors.white)),
                  Text('Hello, ${user?.firstName ?? ''} 👋',
                      style: const TextStyle(
                          fontSize: 11, color: Colors.white70)),
                ],
              ),
              actions: [
                Stack(clipBehavior: Clip.none, children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined,
                        color: Colors.white),
                    onPressed: () => _selectTab(6),
                  ),
                  if (unseenCount > 0)
                    Positioned(
                      top: 6,
                      right: 6,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: const BoxDecoration(
                            color: AppColors.danger, shape: BoxShape.circle),
                        child: Center(
                          child: Text('$unseenCount',
                              style: const TextStyle(
                                  fontSize: 9,
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                ]),
              ],
            ),
      body: IndexedStack(index: _currentIndex, children: _screens),
      drawer: _AppDrawer(
        currentIndex: _currentIndex,
        navItems: _navItems,
        unseenCount: unseenCount,
        notifIndex: 6,
        user: user,
        onSelect: _selectTab,
        role: 'Manager',
      ),
    );
  }
}

class _AppDrawer extends StatelessWidget {
  final int currentIndex;
  final List<_NavItem> navItems;
  final int unseenCount;
  final int notifIndex;
  final dynamic user;
  final void Function(int) onSelect;
  final String role;

  const _AppDrawer({
    required this.currentIndex,
    required this.navItems,
    required this.unseenCount,
    required this.notifIndex,
    required this.user,
    required this.onSelect,
    required this.role,
  });

  @override
  Widget build(BuildContext context) {
    final avatarUrl =
        user?.avatar != null ? '$kMediaBaseUrl${user!.avatar}' : null;

    return Drawer(
      width: 290,
      backgroundColor: Colors.white,
      child: Column(
        children: [
          // ── Header ────────────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 20,
              left: 20,
              right: 20,
              bottom: 24,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── FIXED: show avatar photo, fallback to initials ──────
                Container(
                  width: 62,
                  height: 62,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.5), width: 2),
                  ),
                  child: ClipOval(
                    child: avatarUrl != null
                        ? Image.network(
                            avatarUrl,
                            width: 62,
                            height: 62,
                            fit: BoxFit.cover,
                            loadingBuilder: (_, child, progress) =>
                                progress == null
                                    ? child
                                    : _initialsCircle(),
                            errorBuilder: (_, __, ___) => _initialsCircle(),
                          )
                        : _initialsCircle(),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  _fullName(user?.firstName, user?.lastName, role),
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white),
                ),
                const SizedBox(height: 3),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(role,
                      style: const TextStyle(
                          fontSize: 11, color: Colors.white70)),
                ),
              ],
            ),
          ),

          // ── Nav items ─────────────────────────────────────────────────
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 10),
              itemCount: navItems.length,
              itemBuilder: (context, i) {
                final item = navItems[i];
                final isActive = currentIndex == i;
                final isNotif = i == notifIndex;

                return Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                  child: Material(
                    color: isActive
                        ? AppColors.primary.withValues(alpha: 0.1)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () => onSelect(i),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 13),
                        child: Row(
                          children: [
                            Icon(
                              isActive ? item.activeIcon : item.icon,
                              color: isActive
                                  ? AppColors.primary
                                  : const Color(0xFF607D8B),
                              size: 22,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                item.label,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: isActive
                                      ? FontWeight.w700
                                      : FontWeight.w500,
                                  color: isActive
                                      ? AppColors.primary
                                      : const Color(0xFF37474F),
                                ),
                              ),
                            ),
                            if (isNotif && unseenCount > 0)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 7, vertical: 3),
                                decoration: const BoxDecoration(
                                  color: Color(0xFFE53935),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(10)),
                                ),
                                child: Text('$unseenCount',
                                    style: const TextStyle(
                                        fontSize: 10,
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold)),
                              ),
                            if (isActive && !(isNotif && unseenCount > 0))
                              Container(
                                width: 7,
                                height: 7,
                                decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const Divider(height: 1, color: Color(0xFFECEFF1)),

          // ── Logout ────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            child: Material(
              color: const Color(0xFFFFF0F0),
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () async {
                  await context.read<AuthProvider>().logout();
                  if (!context.mounted) return;
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    '/login',
                    (route) => false,
                  );
                },
                child: const Padding(
                  padding:
                      EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                  child: Row(
                    children: [
                      Icon(Icons.power_settings_new,
                          color: Color(0xFFE53935), size: 22),
                      SizedBox(width: 16),
                      Text('Log out',
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFE53935))),
                    ],
                  ),
                ),
              ),
            ),
          ),

          Padding(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 14,
              bottom: MediaQuery.of(context).padding.bottom + 16,
            ),
            child: Row(children: [
              const Icon(Icons.info_outline,
                  size: 16, color: Color(0xFF90A4AE)),
              const SizedBox(width: 8),
              Text('MINT App · $role',
                  style: const TextStyle(
                      fontSize: 11, color: Color(0xFF90A4AE))),
            ]),
          ),
        ],
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  /// Fallback circle shown while the avatar loads or when there is no avatar.
  Widget _initialsCircle() {
    return Container(
      width: 62,
      height: 62,
      color: Colors.white.withValues(alpha: 0.25),
      child: Center(
        child: Text(
          _initials(user?.firstName, user?.lastName),
          style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white),
        ),
      ),
    );
  }

  String _initials(String? first, String? last) {
    final f = (first?.isNotEmpty == true) ? first![0].toUpperCase() : '';
    final l = (last?.isNotEmpty == true) ? last![0].toUpperCase() : '';
    return '$f$l'.isEmpty ? '?' : '$f$l';
  }

  String _fullName(String? first, String? last, String fallback) {
    final name = '${first ?? ''} ${last ?? ''}'.trim();
    return name.isEmpty ? fallback : name;
  }
}