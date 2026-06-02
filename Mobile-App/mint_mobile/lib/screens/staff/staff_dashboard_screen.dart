import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class StaffDashboardScreen extends StatefulWidget {
  const StaffDashboardScreen({super.key});
  @override
  State<StaffDashboardScreen> createState() => _StaffDashboardScreenState();
}

class _StaffDashboardScreenState extends State<StaffDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskProvider>().fetchTasks();
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tasks = context.watch<TaskProvider>();
    final notifs = context.watch<NotificationProvider>();
    final user = context.watch<AuthProvider>().user;
    final total = tasks.totalTasks;

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Hello, ${user?.firstName ?? ''} 👋',
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
          const Text('Track your tasks and stay on top',
            style: TextStyle(fontSize: 11, color: Colors.white70)),
        ]),
        actions: [
          Stack(children: [
            IconButton(icon: const Icon(Icons.notifications_outlined, color: Colors.white), onPressed: () {}),
            if (notifs.unseenCount > 0)
              Positioned(top: 8, right: 8,
                child: Container(
                  width: 16, height: 16,
                  decoration: const BoxDecoration(color: AppColors.danger, shape: BoxShape.circle),
                  child: Center(child: Text('${notifs.unseenCount}',
                    style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold))),
                )),
          ]),
        ],
      ),
      body: tasks.loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: () => tasks.fetchTasks(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Metric cards
                    GridView.count(
                      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 3, crossAxisSpacing: 10, mainAxisSpacing: 10,
                      childAspectRatio: 0.85,
                      children: [
                        MetricCard(label: 'Assigned', value: '${tasks.totalTasks}',
                          caption: 'Total tasks'),
                        MetricCard(label: 'In Progress', value: '${tasks.inProgressTasks}',
                          caption: 'Stay focused', valueColor: AppColors.warning),
                        MetricCard(label: 'Completed', value: '${tasks.completedTasks}',
                          caption: 'Great work!', valueColor: AppColors.success),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Task completion chart
                    SectionCard(
                      title: 'Task Overview',
                      child: Column(
                        children: [
                          ProgressBarRow(label: 'Completed', value: tasks.completedTasks,
                            total: total, color: AppColors.success),
                          ProgressBarRow(label: 'In Progress', value: tasks.inProgressTasks,
                            total: total, color: AppColors.warning),
                          ProgressBarRow(label: 'Pending', value: tasks.pendingTasks,
                            total: total, color: const Color(0xFF9CA3AF)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Recent tasks
                    SectionCard(
                      title: 'Deadline Alerts',
                      child: tasks.tasks.isEmpty
                          ? const EmptyState(message: 'No tasks assigned', icon: Icons.task_outlined)
                          : Column(
                              children: tasks.tasks.take(5).map((t) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  children: [
                                    Expanded(child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(t.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                                        Text('${t.project.isNotEmpty ? t.project : 'No project'} · Due ${t.due}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                      ],
                                    )),
                                    const SizedBox(width: 8),
                                    StatusBadge(t.priority),
                                  ],
                                ),
                              )).toList(),
                            ),
                    ),
                    const SizedBox(height: 16),

                    // Recent notifications
                    SectionCard(
                      title: 'Recent Notifications',
                      child: notifs.notifications.isEmpty
                          ? const EmptyState(message: 'No notifications', icon: Icons.notifications_none)
                          : Column(
                              children: notifs.notifications.take(5).map((n) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  children: [
                                    Expanded(child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(n.message, style: const TextStyle(fontSize: 13)),
                                        if (n.createdAt != null)
                                          Text(_formatDate(n.createdAt!),
                                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                      ],
                                    )),
                                    StatusBadge(n.type),
                                  ],
                                ),
                              )).toList(),
                            ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  String _formatDate(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${dt.day}/${dt.month}';
  }
}