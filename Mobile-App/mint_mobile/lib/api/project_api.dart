import 'package:dio/dio.dart';
import 'dio_client.dart';

class ProjectApi {
  static Future<Response> getProjects() =>
      DioClient.instance.get('/projects');

  static Future<Response> getProjectStats() =>
      DioClient.instance.get('/projects/stats');

  static Future<Response> createProject(FormData formData) =>
      DioClient.instance.post(
        '/projects',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

  static Future<Response> updateProject(String id, FormData formData) =>
      DioClient.instance.put(
        '/projects/$id',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

  static Future<Response> cancelProject(String id) =>
      DioClient.instance.patch('/projects/$id/cancel');

  static Future<Response> approveProject(String id) =>
      DioClient.instance.patch('/projects/$id/approve');

  static Future<Response> rejectProject(String id, String comment) =>
      DioClient.instance.patch('/projects/$id/reject', data: {'comment': comment});
}
