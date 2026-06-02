import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  String _taskFilter = '';
  String _projectFilter = '';

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskProvider>().fetchTasks();
      context.read<ProjectProvider>().fetchProjects();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tasks = context.watch<TaskProvider>();
    final projects = context.watch<ProjectProvider>();
    final auth = context.watch<AuthProvider>();

    final totalTasks = tasks.totalTasks;
    final completedTasks = tasks.completedTasks;
    final inProgressTasks = tasks.inProgressTasks;
    final pendingTasks = tasks.pendingTasks;

    final totalProjects = projects.projects.length;
    final approvedProjects =
        projects.projects.where((p) => p.status == 'Approved').length;
    final pendingProjects =
        projects.projects.where((p) => p.status == 'Pending').length;
    final rejectedProjects =
        projects.projects.where((p) => p.status == 'Rejected').length;

    final completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks * 100).round() : 0;

    return Scaffold(
      backgroundColor: AppColors.bgLight,

      // ❌ AppBar removed safely

      body: Column(
        children: [
          // ── TAB BAR (moved from AppBar to body) ─────────────────────
          Container(
            color: Theme.of(context).primaryColor,
            child: SafeArea(
              bottom: false,
              child: TabBar(
                controller: _tabs,
                indicatorColor: Colors.white,
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white60,
                tabs: const [
                  Tab(text: 'Tasks'),
                  Tab(text: 'Projects'),
                ],
              ),
            ),
          ),

          // ── TAB CONTENT ─────────────────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabs,
              children: [
                // ── Tasks tab ────────────────────────────────────────
                SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(children: [
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.4,
                      children: [
                        MetricCard(
                            label: 'Total Tasks',
                            value: '$totalTasks',
                            caption: 'All assigned'),
                        MetricCard(
                            label: 'Completed',
                            value: '$completedTasks',
                            caption: 'Done',
                            valueColor: AppColors.success),
                        MetricCard(
                            label: 'In Progress',
                            value: '$inProgressTasks',
                            caption: 'Ongoing',
                            valueColor: AppColors.warning),
                        MetricCard(
                            label: 'Completion',
                            value: '$completionRate%',
                            caption: 'Rate',
                            valueColor: AppColors.primary),
                      ],
                    ),
                    const SizedBox(height: 16),

                    SectionCard(
                      title: 'Task Status Breakdown',
                      child: Column(children: [
                        ProgressBarRow(
                            label: 'Completed',
                            value: completedTasks,
                            total: totalTasks,
                            color: AppColors.success),
                        ProgressBarRow(
                            label: 'In Progress',
                            value: inProgressTasks,
                            total: totalTasks,
                            color: AppColors.warning),
                        ProgressBarRow(
                            label: 'Pending',
                            value: pendingTasks,
                            total: totalTasks,
                            color: const Color(0xFF9CA3AF)),
                      ]),
                    ),
                    const SizedBox(height: 16),

                    SectionCard(
                      title: 'Task List',
                      child: Column(children: [
                        SearchInput(
                          hint: 'Search tasks...',
                          onChanged: (v) =>
                              setState(() => _taskFilter = v.toLowerCase()),
                        ),
                        const SizedBox(height: 12),
                        ...tasks.tasks
                            .where((t) =>
                                t.title.toLowerCase().contains(_taskFilter) ||
                                t.assigneeName
                                    .toLowerCase()
                                    .contains(_taskFilter))
                            .take(20)
                            .map((t) => Container(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 10, horizontal: 12),
                                  margin: const EdgeInsets.only(bottom: 8),
                                  decoration: BoxDecoration(
                                    color: AppColors.surface,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            t.title,
                                            style: const TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          Text(
                                            '${t.assigneeName} · Due ${t.due}',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    StatusBadge(t.status),
                                  ]),
                                )),
                      ]),
                    ),
                  ]),
                ),

                // ── Projects tab ─────────────────────────────────────
                SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(children: [
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.4,
                      children: [
                        MetricCard(
                            label: 'Total',
                            value: '$totalProjects',
                            caption: 'Projects'),
                        MetricCard(
                            label: 'Approved',
                            value: '$approvedProjects',
                            caption: 'Approved',
                            valueColor: AppColors.success),
                        MetricCard(
                            label: 'Pending',
                            value: '$pendingProjects',
                            caption: 'Awaiting',
                            valueColor: AppColors.warning),
                        MetricCard(
                            label: 'Rejected',
                            value: '$rejectedProjects',
                            caption: 'Rejected',
                            valueColor: AppColors.danger),
                      ],
                    ),
                    const SizedBox(height: 16),

                    SectionCard(
                      title: 'Project Status Breakdown',
                      child: Column(children: [
                        ProgressBarRow(
                            label: 'Approved',
                            value: approvedProjects,
                            total: totalProjects,
                            color: AppColors.success),
                        ProgressBarRow(
                            label: 'Pending',
                            value: pendingProjects,
                            total: totalProjects,
                            color: AppColors.warning),
                        ProgressBarRow(
                            label: 'Rejected',
                            value: rejectedProjects,
                            total: totalProjects,
                            color: AppColors.danger),
                      ]),
                    ),
                    const SizedBox(height: 16),

                    SectionCard(
                      title: 'Project List',
                      child: Column(children: [
                        SearchInput(
                          hint: 'Search projects...',
                          onChanged: (v) => setState(
                              () => _projectFilter = v.toLowerCase()),
                        ),
                        const SizedBox(height: 12),
                        ...projects.projects
                            .where((p) =>
                                p.title
                                    .toLowerCase()
                                    .contains(_projectFilter) ||
                                p.createdByName
                                    .toLowerCase()
                                    .contains(_projectFilter))
                            .where((p) =>
                                p.department == auth.user?.department ||
                                auth.user?.role == 'admin')
                            .take(20)
                            .map((p) => Container(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 10, horizontal: 12),
                                  margin: const EdgeInsets.only(bottom: 8),
                                  decoration: BoxDecoration(
                                    color: AppColors.surface,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            p.title,
                                            style: const TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          Text(
                                            '${p.createdByName} · ${p.createdAt?.toString().substring(0, 10) ?? ''}',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    StatusBadge(p.status),
                                  ]),
                                )),
                      ]),
                    ),
                  ]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}