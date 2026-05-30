import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../models/task_model.dart';
import '../utils/storage.dart';

class TaskProvider extends ChangeNotifier {
  List<TaskModel> _tasks = [];
  bool _loading = false;

  List<TaskModel> get tasks => _tasks;
  bool get loading => _loading;

  Future<void> fetchTasks() async {
    if (Storage.getToken() == null) return;
    _loading = true;
    notifyListeners();
    try {
      final res = await TaskApi.getTasks();
      _tasks = (res.data as List).map((t) => TaskModel.fromJson(t)).toList();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<void> assignTask(Map<String, dynamic> data) async {
    await TaskApi.createTask(data);
    await fetchTasks();
  }

  Future<void> updateTaskStatus(String id, String status, {String comment = ''}) async {
    final fd = FormData.fromMap({
      'status': status,
      if (comment.isNotEmpty) 'comment': comment,
    });
    await TaskApi.updateTask(id, fd);
    await fetchTasks();
  }

  Future<void> submitWork(String id, {String? filePath, String? fileName}) async {
    final Map<String, dynamic> map = {'status': 'In Progress'};
    if (filePath != null && fileName != null) {
      map['file'] = await MultipartFile.fromFile(filePath, filename: fileName);
    }
    final fd = FormData.fromMap(map);
    await TaskApi.updateTask(id, fd);
    await fetchTasks();
  }

  Future<void> deleteTask(String id) async {
    await TaskApi.deleteTask(id);
    _tasks.removeWhere((t) => t.id == id);
    notifyListeners();
  }

  int get totalTasks => _tasks.length;
  int get completedTasks => _tasks.where((t) => t.status == 'Completed').length;
  int get inProgressTasks => _tasks.where((t) => t.status == 'In Progress').length;
  int get pendingTasks => _tasks.where((t) => t.status == 'Pending').length;
  
  get TaskApi => null;
}
