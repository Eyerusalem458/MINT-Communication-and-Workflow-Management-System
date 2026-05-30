import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../providers/task_provider.dart';
import '../../models/task_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class MyTasksScreen extends StatefulWidget {
  const MyTasksScreen({super.key});
  @override
  State<MyTasksScreen> createState() => _MyTasksScreenState();
}

class _MyTasksScreenState extends State<MyTasksScreen> {
  String _query = '';
  final Map<String, String?> _selectedFiles = {};
  final Map<String, String?> _selectedFileNames = {};
  final Map<String, bool> _busy = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) =>
        context.read<TaskProvider>().fetchTasks());
  }

  List<TaskModel> get _filtered {
    final q = _query.toLowerCase();
    return context.read<TaskProvider>().tasks
        .where((t) => t.title.toLowerCase().contains(q) || t.project.toLowerCase().contains(q))
        .toList();
  }

  Future<void> _pickFile(String taskId) async {
    final result = await FilePicker.platform.pickFiles();
    if (result == null || result.files.isEmpty) return;
    final f = result.files.first;
    setState(() {
      _selectedFiles[taskId] = f.path;
      _selectedFileNames[taskId] = f.name;
    });
  }

  Future<void> _submitWork(TaskModel task) async {
    setState(() => _busy[task.id] = true);
    try {
      await context.read<TaskProvider>().submitWork(
        task.id,
        filePath: _selectedFiles[task.id],
        fileName: _selectedFileNames[task.id],
      );
      if (!mounted) return;
      showSnack(context, task.status == 'Rejected'
          ? 'Resubmitted "${task.title}"'
          : 'Submitted "${task.title}"');
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Submission failed', isError: true);
    }
    setState(() => _busy[task.id] = false);
  }

  Future<void> _markCompleted(TaskModel task) async {
    if (task.status != 'Approved') {
      showSnack(context, 'Task must be approved by manager first', isError: true);
      return;
    }
    try {
      await context.read<TaskProvider>().updateTaskStatus(task.id, 'Completed');
      if (!mounted) return;
      showSnack(context, '"${task.title}" marked as completed');
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Failed', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<TaskProvider>();
    final tasks = _filtered;

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(title: const Text('My Tasks')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: SearchInput(hint: 'Search tasks...', onChanged: (v) => setState(() => _query = v)),
          ),
          Expanded(
            child: prov.loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : tasks.isEmpty
                    ? const EmptyState(message: 'No tasks assigned', icon: Icons.task_outlined)
                    : RefreshIndicator(
                        onRefresh: () => prov.fetchTasks(),
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          itemCount: tasks.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (_, i) => _TaskCard(
                            task: tasks[i],
                            selectedFileName: _selectedFileNames[tasks[i].id],
                            isBusy: _busy[tasks[i].id] ?? false,
                            onPickFile: () => _pickFile(tasks[i].id),
                            onSubmit: () => _submitWork(tasks[i]),
                            onComplete: () => _markCompleted(tasks[i]),
                            onTap: () => _showDetail(context, tasks[i]),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  void _showDetail(BuildContext context, TaskModel task) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        expand: false, initialChildSize: 0.6,
        builder: (_, ctrl) => SingleChildScrollView(
          controller: ctrl,
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(task.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            _detailRow('Project', task.project.isEmpty ? '—' : task.project),
            _detailRow('Due Date', task.due),
            _detailRow('Priority', task.priority),
            Row(children: [
              const SizedBox(width: 90, child: Text('Status', style: TextStyle(color: AppColors.textMuted, fontSize: 13))),
              StatusBadge(task.status),
            ]),
            if (task.description.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Description', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text(task.description, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
            ],
            if (task.comment.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: const Border(left: BorderSide(color: AppColors.warning, width: 3)),
                ),
                child: Row(children: [
                  const Text('💬 Manager: ', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  Expanded(child: Text(task.comment, style: const TextStyle(fontSize: 13))),
                ]),
              ),
            ],
          ]),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(children: [
      SizedBox(width: 90, child: Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 13))),
      Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
    ]),
  );
}

class _TaskCard extends StatelessWidget {
  final TaskModel task;
  final String? selectedFileName;
  final bool isBusy;
  final VoidCallback onPickFile, onSubmit, onComplete, onTap;

  const _TaskCard({
    required this.task, required this.selectedFileName,
    required this.isBusy, required this.onPickFile,
    required this.onSubmit, required this.onComplete, required this.onTap,
  });

  bool get _canSubmit => !['Completed', 'Approved'].contains(task.status);
  bool get _canComplete => task.status == 'Approved';

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text(task.title,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600))),
            StatusBadge(task.status),
          ]),
          const SizedBox(height: 6),
          Row(children: [
            const Icon(Icons.calendar_today_outlined, size: 13, color: AppColors.textMuted),
            const SizedBox(width: 4),
            Text('Due: ${task.due}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(width: 12),
            const Icon(Icons.folder_outlined, size: 13, color: AppColors.textMuted),
            const SizedBox(width: 4),
            Text(task.project.isEmpty ? '—' : task.project,
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ]),
          if (task.comment.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text('💬 ${task.comment}',
              style: const TextStyle(fontSize: 11, color: AppColors.warning),
              maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
          const SizedBox(height: 10),
          Row(children: [
            // File pick
            Expanded(
              child: GestureDetector(
                onTap: onPickFile,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(children: [
                    const Icon(Icons.attach_file, size: 14, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Expanded(child: Text(
                      selectedFileName ?? 'Choose File',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      maxLines: 1, overflow: TextOverflow.ellipsis,
                    )),
                  ]),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Submit
            AppButton(
              label: task.status == 'Rejected' ? 'Resubmit' : 'Submit',
              variant: 'primary', small: true,
              loading: isBusy,
              onTap: _canSubmit ? onSubmit : null,
            ),
            const SizedBox(width: 6),
            // Mark complete
            AppButton(
              label: 'Done', variant: 'approve', small: true,
              onTap: _canComplete ? onComplete : null,
            ),
          ]),
        ]),
      ),
    );
  }
}