class ActivityModel {
  final String id;
  final String action;
  final String? entity;
  final String? time; // server sends a pre-formatted string e.g. "May 17, 11:48 AM"

  ActivityModel({
    required this.id,
    required this.action,
    this.entity,
    this.time,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['id'] ?? '',           // ✅ server sends "id" not "_id"
      action: json['action'] ?? '',
      entity: json['entity'],
      time: json['time'],             // ✅ server sends "time" not "createdAt"
    );
  }
}