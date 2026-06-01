class UserModel {
  final String id;
  final String firstName;
  final String lastName;
  final String middleName;
  final String email;
  final String phone;
  final String role;
  final String department;
  final String gender;
  final String status;
  final String position;
  final String? avatar;

  UserModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.middleName = '',
    required this.email,
    this.phone = '',
    required this.role,
    this.department = '',
    this.gender = '',
    this.status = 'Active',
    this.position = '',
    this.avatar,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      middleName: json['middleName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'staff',
      department: json['department'] ?? '',
      gender: json['gender'] ?? '',
      status: json['status'] ?? 'Active',
      position: json['position'] ?? '',
      avatar: json['avatar'],
    );
  }

  String get fullName => '$firstName $lastName'.trim();
  String get initials {
    final f = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final l = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$f$l';
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'firstName': firstName,
    'lastName': lastName,
    'middleName': middleName,
    'email': email,
    'phone': phone,
    'role': role,
    'department': department,
    'gender': gender,
    'status': status,
    'position': position,
    'avatar': avatar,
  };
}