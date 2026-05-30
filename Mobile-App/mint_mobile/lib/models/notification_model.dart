class NotificationModel {
  final String id;
  final String message;
  final String type;
  final bool unseen;
  final DateTime? createdAt;

  NotificationModel({
    required this.id,
    required this.message,
    this.type = 'System',
    this.unseen = false,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'System',
      unseen: json['unseen'] ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}