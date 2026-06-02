class ProjectModel {
  final String id;
  final String title;
  final String description;
  final dynamic createdBy;
  final String department;
  final String status;
  final String? file;
  final String comment;
  final DateTime? createdAt;

  ProjectModel({
    required this.id,
    required this.title,
    this.description = '',
    this.createdBy,
    this.department = '',
    this.status = 'Pending',
    this.file,
    this.comment = '',
    this.createdAt,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      createdBy: json['createdBy'],
      department: json['department'] ?? '',
      status: json['status'] ?? 'Pending',
      file: json['file'],
      comment: json['comment'] ?? '',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  String get createdByName {
    if (createdBy is Map) {
      final m = createdBy as Map;
      return '${m['firstName'] ?? ''} ${m['lastName'] ?? ''}'.trim();
    }
    return createdBy?.toString() ?? '—';
  }
}
