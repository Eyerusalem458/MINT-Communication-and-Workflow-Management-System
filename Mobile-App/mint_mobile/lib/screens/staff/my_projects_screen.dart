import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
import '../../providers/project_provider.dart';
import '../../models/project_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class MyProjectsScreen extends StatefulWidget {
  const MyProjectsScreen({super.key});
  @override
  State<MyProjectsScreen> createState() => _MyProjectsScreenState();
}

class _MyProjectsScreenState extends State<MyProjectsScreen> {
  String _query = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) =>
        context.read<ProjectProvider>().fetchProjects());
  }

  List<ProjectModel> get _filtered {
    final q = _query.toLowerCase();
    return context.read<ProjectProvider>().projects
        .where((p) => p.title.toLowerCase().contains(q) || p.description.toLowerCase().contains(q))
        .toList();
  }

  void _showProjectModal(BuildContext context, {ProjectModel? editing}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _ProjectFormSheet(editing: editing),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<ProjectProvider>();
    final projects = _filtered;

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(title: const Text('My Projects')),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
        onPressed: () => _showProjectModal(context),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: SearchInput(hint: 'Search projects...', onChanged: (v) => setState(() => _query = v)),
          ),
          Expanded(
            child: prov.loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : projects.isEmpty
                    ? const EmptyState(message: 'No projects yet. Submit one!', icon: Icons.folder_outlined)
                    : RefreshIndicator(
                        onRefresh: () => prov.fetchProjects(),
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          itemCount: projects.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (_, i) {
                            final p = projects[i];
                            return Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Row(children: [
                                  Expanded(child: Text(p.title,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600))),
                                  StatusBadge(p.status),
                                ]),
                                const SizedBox(height: 6),
                                Text(p.description, maxLines: 2, overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                if (p.comment.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text('💬 ${p.comment}',
                                    style: const TextStyle(fontSize: 11, color: AppColors.danger),
                                    maxLines: 1, overflow: TextOverflow.ellipsis),
                                ],
                                const SizedBox(height: 10),
                                Row(children: [
                                  Text(p.createdAt?.toString().substring(0, 10) ?? '',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
                                  const Spacer(),
                                  if (p.status == 'Pending')
                                    AppButton(label: 'Edit', variant: 'ghost', small: true,
                                      onTap: () => _showProjectModal(context, editing: p)),
                                  const SizedBox(width: 6),
                                  if (['Pending', 'Rejected'].contains(p.status))
                                    AppButton(label: 'Cancel', variant: 'danger', small: true,
                                      onTap: () async {
                                        await prov.cancelProject(p.id);
                                        if (!context.mounted) return;
                                        showSnack(context, 'Project cancelled');
                                      }),
                                ]),
                              ]),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _ProjectFormSheet extends StatefulWidget {
  final ProjectModel? editing;
  const _ProjectFormSheet({this.editing});
  @override
  State<_ProjectFormSheet> createState() => _ProjectFormSheetState();
}

class _ProjectFormSheetState extends State<_ProjectFormSheet> {
  late TextEditingController _title, _description;
  String? _filePath, _fileName;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _title = TextEditingController(text: widget.editing?.title ?? '');
    _description = TextEditingController(text: widget.editing?.description ?? '');
  }

  @override
  void dispose() { _title.dispose(); _description.dispose(); super.dispose(); }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result == null || result.files.isEmpty) return;
    setState(() { _filePath = result.files.first.path; _fileName = result.files.first.name; });
  }

  Future<void> _submit() async {
    if (_title.text.trim().isEmpty || _description.text.trim().isEmpty) {
      showSnack(context, 'Title and description are required', isError: true); return;
    }
    setState(() => _busy = true);
    try {
      final map = <String, dynamic>{
        'title': _title.text.trim(),
        'description': _description.text.trim(),
      };
      if (_filePath != null && _fileName != null) {
        map['file'] = await MultipartFile.fromFile(_filePath!, filename: _fileName);
      }
      final fd = FormData.fromMap(map);
      final prov = context.read<ProjectProvider>();
      if (widget.editing != null) {
        await prov.editProject(widget.editing!.id, fd);
        if (!context.mounted) return;
        showSnack(context, 'Project updated');
      } else {
        await prov.addProject(fd);
        if (!context.mounted) return;
        showSnack(context, 'Project submitted');
      }
      Navigator.pop(context);
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Failed to save project', isError: true);
    }
    setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text(widget.editing != null ? 'Edit Project' : 'New Project',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
          const Spacer(),
          IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
        ]),
        const SizedBox(height: 12),
        TextField(controller: _title,
          decoration: const InputDecoration(labelText: 'Project Title', hintText: 'Enter project title')),
        const SizedBox(height: 12),
        TextField(controller: _description, maxLines: 3,
          decoration: const InputDecoration(labelText: 'Description', hintText: 'Describe your project...')),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: _pickFile,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.surface, borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border)),
            child: Row(children: [
              const Icon(Icons.attach_file, color: AppColors.primary, size: 18),
              const SizedBox(width: 8),
              Expanded(child: Text(_fileName ?? 'Upload File',
                style: TextStyle(fontSize: 13, color: _fileName != null ? AppColors.textPrimary : AppColors.textMuted))),
            ]),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(width: double.infinity, height: 48,
          child: ElevatedButton(
            onPressed: _busy ? null : _submit,
            child: _busy
                ? const SizedBox(width: 18, height: 18,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text(widget.editing != null ? 'Update Project' : 'Submit Project'),
          )),
      ]),
    );
  }
}