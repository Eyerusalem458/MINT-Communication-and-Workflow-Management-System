import 'package:flutter/foundation.dart';
import 'dart:async';
import '../api/notification_api.dart';
import '../models/notification_model.dart';
import '../utils/storage.dart';

class NotificationProvider extends ChangeNotifier {
  List<NotificationModel> _notifications = [];
  int _unseenCount = 0;
  bool _loading = false;
  Timer? _timer;

  List<NotificationModel> get notifications => _notifications;
  int get unseenCount => _unseenCount;
  bool get loading => _loading;

  void startPolling() {
    fetchNotifications();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => fetchNotifications());
  }

  void stopPolling() => _timer?.cancel();

  Future<void> fetchNotifications() async {
    if (Storage.getToken() == null) return;
    try {
      _loading = true;
      notifyListeners();
      final res = await NotificationApi.getNotifications();
      _notifications = (res.data as List)
          .map((n) => NotificationModel.fromJson(n))
          .toList();
      _unseenCount = _notifications.where((n) => n.unseen).length;
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<void> markAllAsRead() async {
    try {
      await NotificationApi.markAllAsRead();
      _notifications = _notifications.map((n) => NotificationModel(
        id: n.id,
        message: n.message,
        type: n.type,
        unseen: false,
        createdAt: n.createdAt,
      )).toList();
      _unseenCount = 0;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> markOneAsRead(String id) async {
    try {
      await NotificationApi.markAsRead(id);
      _notifications = _notifications.map((n) => n.id == id
          ? NotificationModel(id: n.id, message: n.message, type: n.type, unseen: false, createdAt: n.createdAt)
          : n).toList();
      _unseenCount = _notifications.where((n) => n.unseen).length;
      notifyListeners();
    } catch (_) {}
  }
}
