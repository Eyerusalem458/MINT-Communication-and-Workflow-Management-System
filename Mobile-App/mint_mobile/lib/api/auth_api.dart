import 'package:dio/dio.dart';
import 'dio_client.dart';

class AuthApi {
  static Future<Response> login(String email, String password) {
    return DioClient.instance.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  static Future<Response> getMe() {
    return DioClient.instance.get('/auth/me');
  }

  static Future<Response> forgotPassword(String email) {
    return DioClient.instance.post('/auth/forgot-password', data: {'email': email});
  }

  static Future<Response> resetPassword(String token, String password) {
    return DioClient.instance.post('/auth/reset-password', data: {
      'token': token,
      'password': password,
    });
  }
}
