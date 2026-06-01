import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class Storage {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<void> setToken(String token) async {
    await _prefs?.setString('token', token);
  }

  static String? getToken() => _prefs?.getString('token');

  static Future<void> setUser(Map<String, dynamic> user) async {
    await _prefs?.setString('user', jsonEncode(user));
  }

  static Map<String, dynamic>? getUser() {
    final str = _prefs?.getString('user');
    if (str == null) return null;
    return jsonDecode(str);
  }

  static String? getRole() {
    final user = getUser();
    return user?['role'];
  }

  static Future<void> clear() async {
    await _prefs?.clear();
  }

  static bool get isLoggedIn => getToken() != null;
}
