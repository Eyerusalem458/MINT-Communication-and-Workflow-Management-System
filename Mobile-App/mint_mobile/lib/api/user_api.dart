import 'package:dio/dio.dart';
import 'dio_client.dart';

class UserApi {
  static Future<Response> getAllUsers() =>
      DioClient.instance.get('/users');

  static Future<Response> getStaff() =>
      DioClient.instance.get('/users/staff');

  static Future<Response> getUserStats() =>
      DioClient.instance.get('/users/stats');

  // ✅ NEW: fetch a single user by ID
  static Future<Response> getUserById(String id) =>
      DioClient.instance.get('/users/$id');

  static Future<Response> createUser(Map<String, dynamic> data) =>
      DioClient.instance.post('/users', data: data);

  static Future<Response> updateUser(String id, Map<String, dynamic> data) =>
      DioClient.instance.put('/users/$id', data: data);

  static Future<Response> toggleUserStatus(String id) =>
      DioClient.instance.patch('/users/$id/toggle-status');

  static Future<Response> updateMyProfile(FormData formData) =>
      DioClient.instance.put(
        '/users/profile/me',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

  static Future<Response> changeMyPassword(String current, String newPw) =>
      DioClient.instance.put('/users/password/me', data: {
        'currentPassword': current,
        'newPassword': newPw,
      });
}