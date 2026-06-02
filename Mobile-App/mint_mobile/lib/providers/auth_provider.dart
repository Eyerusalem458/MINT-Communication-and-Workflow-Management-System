import 'package:flutter/foundation.dart';
import '../api/auth_api.dart';
import '../models/user_model.dart';
import '../utils/storage.dart';
import '../utils/socket_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _loading = false;
  String? _error;

  UserModel? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;

  /// INIT USER FROM STORAGE + SERVER SYNC
  Future<void> initFromStorage() async {
    final userData = Storage.getUser();

    if (userData != null) {
      try {
        final res = await AuthApi.getMe();
        _user = UserModel.fromJson(res.data);

        // ✅ FIX: always persist the latest server user (includes updated avatar)
        await Storage.setUser(_user!.toJson());

        SocketService.connect(_user!.id);
      } catch (_) {
        await Storage.clear();
        _user = null;
      }
    }

    notifyListeners();
  }

  /// LOGIN
  Future<UserModel> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await AuthApi.login(email, password);

      final token = res.data['token'];
      final user = UserModel.fromJson(res.data['user']);

      await Storage.setToken(token);
      await Storage.setUser(user.toJson());

      _user = user;
      SocketService.connect(user.id);

      return user;
    } catch (e) {
      _error = _parseError(e);
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// LOCAL UPDATE ONLY (for non-avatar field updates without a server round-trip)
  Future<void> updateUser(UserModel updated) async {
    _user = updated;
    await Storage.setUser(updated.toJson());
    notifyListeners();
  }

  /// REAL SERVER REFRESH
  /// Fetches the latest user from the server and persists it to storage.
  /// This ensures the updated avatar URL survives logout and app restarts.
  Future<void> refreshUser() async {
    try {
      final res = await AuthApi.getMe();
      final freshUser = UserModel.fromJson(res.data);

      _user = freshUser;

      // ✅ FIX: persist fresh user (with new avatar path) so it survives restarts
      await Storage.setUser(freshUser.toJson());

      notifyListeners();
    } catch (e) {
      // keep existing user in memory if refresh fails
      debugPrint('refreshUser failed: $e');
    }
  }

  /// LOGOUT
  Future<void> logout() async {
    SocketService.disconnect();
    await Storage.clear();
    _user = null;
    notifyListeners();
  }

  String _parseError(dynamic e) {
  try {
    final statusCode = e.response?.statusCode;

    switch (statusCode) {
      case 401:
        return 'Incorrect email or password.';
      case 404:
        return 'Account not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return e.response?.data['message'] ??
            'Unable to login. Please try again.';
    }
  } catch (_) {
    return 'Network error. Please check your internet connection.';
  }
}}