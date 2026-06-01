import 'package:dio/dio.dart';
import 'dio_client.dart';

class NotificationApi {
  static Future<Response> getNotifications() =>
      DioClient.instance.get('/notifications');

  static Future<Response> getUnseenCount() =>
      DioClient.instance.get('/notifications/unseen-count');

  static Future<Response> markAllAsRead() =>
      DioClient.instance.patch('/notifications/read-all');

  static Future<Response> markAsRead(String id) =>
      DioClient.instance.patch('/notifications/$id/read');
}

class ActivityApi {
  static Future<Response> getActivityLogs() =>
      DioClient.instance.get('/activity');
}
