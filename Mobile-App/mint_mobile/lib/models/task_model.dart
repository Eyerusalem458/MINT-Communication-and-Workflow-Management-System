class TaskModel {
  final String id;
  final String title;
  final String description;
  final dynamic assignedTo;
  final dynamic assignedBy;
  final String project;
  final String due;
  final String priority;
  final String status;
  final String comment;
  final String? file;
  final DateTime? createdAt;

  TaskModel({
    required this.id,
    required this.title,
    this.description = '',
    this.assignedTo,
    this.assignedBy,
    this.project = '',
    required this.due,
    this.priority = 'Medium',
    this.status = 'Pending',
    this.comment = '',
    this.file,
    this.createdAt,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      assignedTo: json['assignedTo'],
      assignedBy: json['assignedBy'],
      project: json['project'] ?? '',
      due: json['due'] ?? '',
      priority: json['priority'] ?? 'Medium',
      status: json['status'] ?? 'Pending',
      comment: json['comment'] ?? '',
      file: json['file'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  String get assigneeName {
    if (assignedTo is Map) {
      final m = assignedTo as Map;
      return '${m['firstName'] ?? ''} ${m['lastName'] ?? ''}'.trim();
    }
    return '—';
  }
}
