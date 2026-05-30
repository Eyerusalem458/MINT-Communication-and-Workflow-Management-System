import 'package:flutter/material.dart';
import 'package:mint_mobile/models/user_model.dart';
import 'package:provider/provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/user_provider.dart';
import '../../models/task_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class TaskMgmtScreen extends StatefulWidget {
  const TaskMgmtScreen({super.key});
  @override
  State<TaskMgmtScreen> createState() => _TaskMgmtScreenState();
}

class _TaskMgmtScreenState extends State<TaskMgmtScreen> {
  String _query = '';
  String _statusFilter = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskProvider>().fetchTasks();
      context.read<UserProvider>().fetchUsers('manager');
    });
  }

  List<TaskModel> get _filtered {
    final q = _query.toLowerCase();
    return context.read<TaskProvider>().tasks.where((t) {
      final matchQ = t.title.toLowerCase().contains(q) ||
          t.assigneeName.toLowerCase().contains(q);
      final matchS = _statusFilter.isEmpty || t.status == _statusFilter;
      return matchQ && matchS;
    }).toList();
  }

  void _showAssignSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => const _AssignTaskSheet(),
    );
  }

  void _showDetailSheet(BuildContext context, TaskModel task) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _TaskDetailSheet(task: task),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<TaskProvider>();
    final tasks = _filtered;

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(title: const Text('Task Management')),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Assign Task', style: TextStyle(color: Colors.white)),
        onPressed: () => _showAssignSheet(context),
      ),
      body: Column(children: [
        // Search + filter
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
          child: Column(children: [
            SearchInput(
                hint: 'Search tasks or assignee...',
                onChanged: (v) => setState(() => _query = v)),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['', 'Pending', 'In Progress', 'Approved', 'Rejected', 'Completed']
                    .map((s) {
                  final label = s.isEmpty ? 'All' : s;
                  final active = _statusFilter == s;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _statusFilter = s),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: active
                              ? AppColors.primary.withOpacity(0.12)
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                              color: active ? AppColors.primary : AppColors.border),
                        ),
                        child: Text(label,
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: active
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                                color: active
                                    ? AppColors.primary
                                    : AppColors.textMuted)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ]),
        ),

        // Task list
        Expanded(
          child: prov.loading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary))
              : tasks.isEmpty
                  ? const EmptyState(
                      message: 'No tasks found', icon: Icons.task_outlined)
                  : RefreshIndicator(
                      onRefresh: () => prov.fetchTasks(),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: tasks.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final task = tasks[i];
                          return GestureDetector(
                            onTap: () => _showDetailSheet(context, task),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(children: [
                                      Expanded(
                                          child: Text(task.title,
                                              style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600))),
                                      StatusBadge(task.status),
                                    ]),
                                    const SizedBox(height: 6),
                                    Row(children: [
                                      const Icon(Icons.person_outline,
                                          size: 13, color: AppColors.textMuted),
                                      const SizedBox(width: 4),
                                      Text(task.assigneeName,
                                          style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textMuted)),
                                      const SizedBox(width: 12),
                                      const Icon(Icons.calendar_today_outlined,
                                          size: 13, color: AppColors.textMuted),
                                      const SizedBox(width: 4),
                                      Text('Due: ${task.due}',
                                          style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textMuted)),
                                    ]),
                                    if (task.priority.isNotEmpty) ...[
                                      const SizedBox(height: 6),
                                      Row(children: [
                                        const Icon(Icons.flag_outlined,
                                            size: 13, color: AppColors.textMuted),
                                        const SizedBox(width: 4),
                                        Text('Priority: ${task.priority}',
                                            style: const TextStyle(
                                                fontSize: 12,
                                                color: AppColors.textMuted)),
                                      ]),
                                    ],
                                    // Manager actions for In Progress tasks
                                    if (task.status == 'In Progress') ...[
                                      const SizedBox(height: 10),
                                      Row(children: [
                                        Expanded(
                                          child: AppButton(
                                            label: 'Approve',
                                            variant: 'approve',
                                            small: true,
                                            onTap: () async {
                                              await context
                                                  .read<TaskProvider>()
                                                  .updateTaskStatus(
                                                      task.id, 'Approved');
                                              if (!context.mounted) return;
                                              showSnack(context,
                                                  'Task approved ✅');
                                            },
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: AppButton(
                                            label: 'Reject',
                                            variant: 'reject',
                                            small: true,
                                            onTap: () =>
                                                _showRejectDialog(context, task),
                                          ),
                                        ),
                                      ]),
                                    ],
                                  ]),
                            ),
                          );
                        },
                      ),
                    ),
        ),
      ]),
    );
  }

  void _showRejectDialog(BuildContext context, TaskModel task) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reject Task'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(
              hintText: 'Enter rejection reason...'),
          maxLines: 3,
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () async {
              Navigator.pop(ctx);
              await context
                  .read<TaskProvider>()
                  .updateTaskStatus(task.id, 'Rejected',
                      comment: ctrl.text.trim());
              if (!context.mounted) return;
              showSnack(context, 'Task rejected ❌');
            },
            child: const Text('Confirm Reject',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// ── Assign Task Sheet ─────────────────────────────────────────────────────────
class _AssignTaskSheet extends StatefulWidget {
  const _AssignTaskSheet();
  @override
  State<_AssignTaskSheet> createState() => _AssignTaskSheetState();
}

class _AssignTaskSheetState extends State<_AssignTaskSheet> {
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _project = TextEditingController();
  DateTime? _dueDate;
  String _priority = 'Medium';
  UserModel? _assignee;
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _project.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_title.text.trim().isEmpty || _assignee == null || _dueDate == null) {
      showSnack(context, 'Fill all required fields', isError: true);
      return;
    }
    setState(() => _busy = true);
    try {
      await context.read<TaskProvider>().assignTask({
        'title': _title.text.trim(),
        'description': _desc.text.trim(),
        'assignedTo': _assignee!.id,
        'due': '${_dueDate!.year}-${_dueDate!.month.toString().padLeft(2, '0')}-${_dueDate!.day.toString().padLeft(2, '0')}',
        'priority': _priority,
        'project': _project.text.trim(),
      });
      if (!mounted) return;
      showSnack(context, 'Task assigned successfully');
      Navigator.pop(context);
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Failed to assign task', isError: true);
    }
    setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final staff = context.watch<UserProvider>().users;

    return Padding(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: SingleChildScrollView(
        child: Column(mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Row(children: [
            const Expanded(
                child: Text('Assign Task',
                    style: TextStyle(
                        fontSize: 17, fontWeight: FontWeight.w700))),
            IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close)),
          ]),
          const SizedBox(height: 12),

          // Title
          TextField(
              controller: _title,
              decoration: const InputDecoration(labelText: 'Task Title *')),
          const SizedBox(height: 12),

          // Description
          TextField(
              controller: _desc,
              maxLines: 2,
              decoration:
                  const InputDecoration(labelText: 'Description')),
          const SizedBox(height: 12),

          // Project
          TextField(
              controller: _project,
              decoration:
                  const InputDecoration(labelText: 'Project (optional)')),
          const SizedBox(height: 12),

          // Assign to
          DropdownButtonFormField<UserModel>(
            value: _assignee,
            decoration: const InputDecoration(labelText: 'Assign to *'),
            items: staff
                .map((u) => DropdownMenuItem(
                    value: u, child: Text(u.fullName)))
                .toList(),
            onChanged: (v) => setState(() => _assignee = v),
          ),
          const SizedBox(height: 12),

          // Priority
          DropdownButtonFormField<String>(
            value: _priority,
            decoration: const InputDecoration(labelText: 'Priority'),
            items: ['Low', 'Medium', 'High']
                .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                .toList(),
            onChanged: (v) => setState(() => _priority = v ?? 'Medium'),
          ),
          const SizedBox(height: 12),

          // Due date
          GestureDetector(
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime.now().add(const Duration(days: 3)),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (picked != null) setState(() => _dueDate = picked);
            },
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.border)),
              child: Row(children: [
                const Icon(Icons.calendar_today_outlined,
                    size: 18, color: AppColors.textMuted),
                const SizedBox(width: 10),
                Text(
                  _dueDate == null
                      ? 'Pick Due Date *'
                      : '${_dueDate!.year}-${_dueDate!.month.toString().padLeft(2, '0')}-${_dueDate!.day.toString().padLeft(2, '0')}',
                  style: TextStyle(
                      fontSize: 14,
                      color: _dueDate == null
                          ? AppColors.textMuted
                          : AppColors.textPrimary),
                ),
              ]),
            ),
          ),
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: _busy ? null : _submit,
              child: _busy
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Assign Task'),
            ),
          ),
        ]),
      ),
    );
  }
}

// ── Task Detail Sheet ─────────────────────────────────────────────────────────
class _TaskDetailSheet extends StatelessWidget {
  final TaskModel task;
  const _TaskDetailSheet({required this.task});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.65,
      builder: (_, ctrl) => SingleChildScrollView(
        controller: ctrl,
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(task.title,
              style: const TextStyle(
                  fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 14),
          _row('Assigned To', task.assigneeName),
          _row('Due Date', task.due),
          _row('Priority', task.priority),
          _row('Project', task.project.isEmpty ? '—' : task.project),
          Row(children: [
            const SizedBox(
                width: 100,
                child: Text('Status',
                    style: TextStyle(
                        color: AppColors.textMuted, fontSize: 13))),
            StatusBadge(task.status),
          ]),
          if (task.description.isNotEmpty) ...[
            const SizedBox(height: 14),
            const Text('Description',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 4),
            Text(task.description,
                style: const TextStyle(
                    fontSize: 13, color: AppColors.textMuted)),
          ],
          if (task.comment.isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: const Border(
                      left: BorderSide(
                          color: AppColors.warning, width: 3))),
              child: Row(children: [
                const Text('💬 Comment: ',
                    style: TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
                Expanded(
                    child: Text(task.comment,
                        style: const TextStyle(fontSize: 13))),
              ]),
            ),
          ],
          if (task.file != null && task.file!.isNotEmpty) ...[
            const SizedBox(height: 14),
            Row(children: [
              const Icon(Icons.attach_file,
                  size: 16, color: AppColors.primary),
              const SizedBox(width: 6),
              Text('Submitted file attached',
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.primary)),
            ]),
          ],
        ]),
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(children: [
          SizedBox(
              width: 100,
              child: Text(label,
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 13))),
          Text(value,
              style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w500)),
        ]),
      );
}