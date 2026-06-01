import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/project_provider.dart';
import '../../models/project_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class ProjectRequestsScreen extends StatefulWidget {
  const ProjectRequestsScreen({super.key});
  @override
  State<ProjectRequestsScreen> createState() => _ProjectRequestsScreenState();
}

class _ProjectRequestsScreenState extends State<ProjectRequestsScreen> {
  String _statusFilter = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
        (_) => context.read<ProjectProvider>().fetchProjects());
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<ProjectProvider>();
    final projects = prov.projects.where((p) {
      return _statusFilter.isEmpty || p.status == _statusFilter;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      body: Column(children: [
        // Status filter chips
        SizedBox(
          height: 52,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            children:
                ['', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) {
              final label = s.isEmpty ? 'All' : s;
              final active = _statusFilter == s;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => setState(() => _statusFilter = s),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: active
                          ? AppColors.primary.withValues(alpha: 0.12)
                          : AppColors.surface,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                          color: active ? AppColors.primary : AppColors.border),
                    ),
                    child: Text(label,
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight:
                                active ? FontWeight.w600 : FontWeight.normal,
                            color: active
                                ? AppColors.primary
                                : AppColors.textMuted)),
                  ),
                ),
              );
            }).toList(),
          ),
        ),

        Expanded(
          child: prov.loading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary))
              : projects.isEmpty
                  ? const EmptyState(
                      message: 'No projects found', icon: Icons.folder_outlined)
                  : RefreshIndicator(
                      onRefresh: () => prov.fetchProjects(),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: projects.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final p = projects[i];
                          return _ProjectCard(
                            project: p,
                            onView: () => _showDetail(context, p),
                            onApprove: p.status == 'Pending'
                                ? () => _approve(context, p)
                                : null,
                            onReject: p.status == 'Pending'
                                ? () => _showRejectDialog(context, p)
                                : null,
                          );
                        },
                      ),
                    ),
        ),
      ]),
    );
  }

  Future<void> _approve(BuildContext context, ProjectModel p) async {
    try {
      await context.read<ProjectProvider>().approveProject(p.id);
      if (!context.mounted) return;
      showSnack(context, 'Project approved ✅');
    } catch (_) {
      if (!context.mounted) return;
      showSnack(context, 'Failed to approve', isError: true);
    }
  }

  void _showRejectDialog(BuildContext context, ProjectModel p) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Reject: ${p.title}'),
        content: TextField(
          controller: ctrl,
          decoration:
              const InputDecoration(hintText: 'Enter rejection reason...'),
          maxLines: 3,
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () async {
              if (ctrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              try {
                await context
                    .read<ProjectProvider>()
                    .rejectProject(p.id, ctrl.text.trim());
                if (!context.mounted) return;
                showSnack(context, 'Project rejected ❌');
              } catch (_) {
                if (!context.mounted) return;
                showSnack(context, 'Failed to reject', isError: true);
              }
            },
            child: const Text('Confirm Reject',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showDetail(BuildContext context, ProjectModel p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.65,
        builder: (_, ctrl) => SingleChildScrollView(
          controller: ctrl,
          padding: const EdgeInsets.all(20),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(p.title,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 14),
            _row('Created By', p.createdByName),
            _row('Department', p.department),
            Row(children: [
              const SizedBox(
                  width: 110,
                  child: Text('Status',
                      style:
                          TextStyle(color: AppColors.textMuted, fontSize: 13))),
              StatusBadge(p.status),
            ]),
            _row('Date', p.createdAt?.toString().substring(0, 10) ?? ''),
            if (p.description.isNotEmpty) ...[
              const SizedBox(height: 14),
              const Text('Description',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 6),
              Text(p.description,
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textMuted)),
            ],
            if (p.comment.isNotEmpty) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.07),
                    borderRadius: BorderRadius.circular(8),
                    border: const Border(
                        left: BorderSide(color: AppColors.danger, width: 3))),
                child: Text('💬 ${p.comment}',
                    style: const TextStyle(fontSize: 13)),
              ),
            ],
            if (p.file != null && p.file!.isNotEmpty) ...[
              const SizedBox(height: 14),
              Row(children: [
                const Icon(Icons.attach_file,
                    size: 16, color: AppColors.primary),
                const SizedBox(width: 6),
                Text('File attached',
                    style: const TextStyle(
                        fontSize: 13, color: AppColors.primary)),
              ]),
            ],
            if (p.status == 'Pending') ...[
              const SizedBox(height: 20),
              Row(children: [
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.success),
                    onPressed: () {
                      Navigator.pop(context);
                      _approve(context, p);
                    },
                    child: const Text('Approve',
                        style: TextStyle(color: Colors.white)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.danger),
                    onPressed: () {
                      Navigator.pop(context);
                      _showRejectDialog(context, p);
                    },
                    child: const Text('Reject',
                        style: TextStyle(color: Colors.white)),
                  ),
                ),
              ]),
            ],
          ]),
        ),
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(children: [
          SizedBox(
              width: 110,
              child: Text(label,
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 13))),
          Expanded(
              child: Text(value,
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w500))),
        ]),
      );
}

// ── Project Card ──────────────────────────────────────────────────────────────
class _ProjectCard extends StatelessWidget {
  final ProjectModel project;
  final VoidCallback onView;
  final VoidCallback? onApprove;
  final VoidCallback? onReject;

  const _ProjectCard({
    required this.project,
    required this.onView,
    this.onApprove,
    this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
              child: Text(project.title,
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis)),
          StatusBadge(project.status),
        ]),
        const SizedBox(height: 6),
        Text('By: ${project.createdByName}',
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        Text('Dept: ${project.department}',
            style: const TextStyle(fontSize: 11, color: AppColors.textLight),
            maxLines: 1,
            overflow: TextOverflow.ellipsis),
        if (project.comment.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text('💬 ${project.comment}',
              style: const TextStyle(fontSize: 11, color: AppColors.danger),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
        ],
        const SizedBox(height: 10),
        Row(children: [
          AppButton(
              label: 'View Details',
              variant: 'ghost',
              small: true,
              onTap: onView),
          const Spacer(),
          if (onApprove != null) ...[
            AppButton(
                label: 'Approve',
                variant: 'approve',
                small: true,
                onTap: onApprove),
            const SizedBox(width: 6),
            AppButton(
                label: 'Reject',
                variant: 'reject',
                small: true,
                onTap: onReject),
          ],
        ]),
      ]),
    );
  }
}
