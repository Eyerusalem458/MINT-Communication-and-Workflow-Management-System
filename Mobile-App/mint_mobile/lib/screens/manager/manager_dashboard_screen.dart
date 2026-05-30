import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../providers/notification_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class ManagerDashboardScreen extends StatefulWidget {
  const ManagerDashboardScreen({super.key});
  @override
  State<ManagerDashboardScreen> createState() => _ManagerDashboardScreenState();
}

class _ManagerDashboardScreenState extends State<ManagerDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskProvider>().fetchTasks();
      context.read<ProjectProvider>().fetchProjects();
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tasks = context.watch<TaskProvider>();
    final projects = context.watch<ProjectProvider>();
    final notifs = context.watch<NotificationProvider>();
    final user = context.watch<AuthProvider>().user;

    final totalTasks = tasks.totalTasks;
    final totalProjects = projects.projects.length;
    final pendingProjects = projects.projects.where((p) => p.status == 'Pending').length;
    final approvedProjects = projects.projects.where((p) => p.status == 'Approved').length;

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Hello, ${user?.firstName ?? ''} 👋',
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
          const Text('Manage your team and projects',
            style: TextStyle(fontSize: 11, color: Colors.white70)),
        ]),
        actions: [
          Stack(children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: Colors.white),
              onPressed: () {},
            ),
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
      body: RefreshIndicator(
        onRefresh: () async {
          await tasks.fetchTasks();
          await projects.fetchProjects();
          await notifs.fetchNotifications();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(children: [
            // Task metric cards
            GridView.count(
              shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3, crossAxisSpacing: 10, mainAxisSpacing: 10,
              childAspectRatio: 0.85,
              children: [
                MetricCard(label: 'Total Tasks', value: '$totalTasks', caption: 'Assigned by you'),
                MetricCard(label: 'In Progress', value: '${tasks.inProgressTasks}',
                  caption: 'Being worked on', valueColor: AppColors.warning),
                MetricCard(label: 'Completed', value: '${tasks.completedTasks}',
                  caption: 'Done', valueColor: AppColors.success),
              ],
            ),
            const SizedBox(height: 16),

            // Project metric cards
            GridView.count(
              shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3, crossAxisSpacing: 10, mainAxisSpacing: 10,
              childAspectRatio: 0.85,
              children: [
                MetricCard(label: 'Projects', value: '$totalProjects', caption: 'Total requests'),
                MetricCard(label: 'Pending', value: '$pendingProjects',
                  caption: 'Awaiting review', valueColor: AppColors.warning),
                MetricCard(label: 'Approved', value: '$approvedProjects',
                  caption: 'Approved', valueColor: AppColors.success),
              ],
            ),
            const SizedBox(height: 16),

            // Task overview chart
            SectionCard(
              title: 'Task Overview',
              child: Column(children: [
                ProgressBarRow(label: 'Completed', value: tasks.completedTasks,
                  total: totalTasks, color: AppColors.success),
                ProgressBarRow(label: 'In Progress', value: tasks.inProgressTasks,
                  total: totalTasks, color: AppColors.warning),
                ProgressBarRow(label: 'Pending', value: tasks.pendingTasks,
                  total: totalTasks, color: const Color(0xFF9CA3AF)),
              ]),
            ),
            const SizedBox(height: 16),

            // Recent tasks
            SectionCard(
              title: 'Recent Tasks',
              child: tasks.tasks.isEmpty
                ? const EmptyState(message: 'No tasks yet', icon: Icons.task_outlined)
                : Column(
                    children: tasks.tasks.take(5).map((t) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(children: [
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(t.title,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                            Text('${t.assigneeName} · Due ${t.due}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        )),
                        const SizedBox(width: 8),
                        StatusBadge(t.status),
                      ]),
                    )).toList(),
                  ),
            ),
            const SizedBox(height: 16),

            // Recent project requests
            SectionCard(
              title: 'Recent Project Requests',
              child: projects.projects.isEmpty
                ? const EmptyState(message: 'No project requests', icon: Icons.folder_outlined)
                : Column(
                    children: projects.projects.take(5).map((p) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(children: [
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p.title,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                            Text(p.createdByName,
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        )),
                        const SizedBox(width: 8),
                        StatusBadge(p.status),
                      ]),
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
                      child: Row(children: [
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
                      ]),
                    )).toList(),
                  ),
            ),
          ]),
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