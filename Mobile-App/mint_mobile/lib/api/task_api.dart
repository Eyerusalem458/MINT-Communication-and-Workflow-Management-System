import 'package:dio/dio.dart';
import 'dio_client.dart';

class TaskApi {
  static Future<Response> getTasks() => DioClient.instance.get('/tasks');

  static Future<Response> getTaskById(String id) =>
      DioClient.instance.get('/tasks/$id');

  // FIX: send JSON instead of FormData so backend req.body can read it
  static Future<Response> createTask(Map<String, dynamic> data) =>
      DioClient.instance.post(
        '/tasks',
        data: data,
        options: Options(contentType: 'application/json'),
      );

  // Keep as FormData — handles file uploads
  static Future<Response> updateTask(String id, FormData formData) =>
      DioClient.instance.put(
        '/tasks/$id',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

  static Future<Response> deleteTask(String id) =>
      DioClient.instance.delete('/tasks/$id');

  static Future<Response> getTaskStats() =>
      DioClient.instance.get('/tasks/stats');
}
