import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../api/project_api.dart';
import '../models/project_model.dart';
import '../utils/storage.dart';

class ProjectProvider extends ChangeNotifier {
  List<ProjectModel> _projects = [];
  bool _loading = false;

  List<ProjectModel> get projects => _projects;
  bool get loading => _loading;

  Future<void> fetchProjects() async {
    if (Storage.getToken() == null) return;
    _loading = true;
    notifyListeners();
    try {
      final res = await ProjectApi.getProjects();
      _projects = (res.data as List).map((p) => ProjectModel.fromJson(p)).toList();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<void> addProject(FormData fd) async {
    await ProjectApi.createProject(fd);
    await fetchProjects();
  }

  Future<void> editProject(String id, FormData fd) async {
    await ProjectApi.updateProject(id, fd);
    await fetchProjects();
  }

  Future<void> cancelProject(String id) async {
    await ProjectApi.cancelProject(id);
    await fetchProjects();
  }

  Future<void> approveProject(String id) async {
    await ProjectApi.approveProject(id);
    await fetchProjects();
  }

  Future<void> rejectProject(String id, String comment) async {
    await ProjectApi.rejectProject(id, comment);
    await fetchProjects();
  }
}
