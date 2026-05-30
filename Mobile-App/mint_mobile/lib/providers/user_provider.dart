import 'package:flutter/foundation.dart';
import 'package:mint_mobile/models/user_model.dart';
import '../api/user_api.dart';
import '../utils/storage.dart';

class UserProvider extends ChangeNotifier {
  List<UserModel> _users = [];
  bool _loading = false;

  List<UserModel> get users => _users;
  bool get loading => _loading;

  Future<void> fetchUsers(String role) async {
    if (Storage.getToken() == null) return;
    if (role == 'staff') return; // Staff don't need user list

    _loading = true;
    notifyListeners();
    try {
      final res = role == 'admin'
          ? await UserApi.getAllUsers()
          : await UserApi.getStaff();
      _users = (res.data as List).map((u) => UserModel.fromJson(u)).toList();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<void> editUser(String id, Map<String, dynamic> data) async {
    await UserApi.updateUser(id, data);
    final idx = _users.indexWhere((u) => u.id == id);
    if (idx != -1) {
      // Refresh from server response
      await fetchUsers(_users.isNotEmpty ? 'admin' : 'manager');
    }
  }

  Future<void> toggleStatus(String id) async {
    await UserApi.toggleUserStatus(id);
    final idx = _users.indexWhere((u) => u.id == id);
    if (idx != -1) {
      final u = _users[idx];
      _users[idx] = UserModel(
        id: u.id, firstName: u.firstName, lastName: u.lastName,
        email: u.email, role: u.role,
        status: u.status == 'Active' ? 'Inactive' : 'Active',
        department: u.department, gender: u.gender, avatar: u.avatar,
      );
      notifyListeners();
    }
  }
}
