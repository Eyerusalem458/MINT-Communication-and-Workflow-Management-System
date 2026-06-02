class MessageModel {
  final String id;
  final String conversationId;
  final dynamic sender;
  final String text;
  final String? file;
  final String? media;
  final String? audio;
  final String fileType;
  final String fileName;
  final String fileSize;
  final dynamic replyTo;
  final bool isDeleted;
  final bool isEdited; // ← FIX 2: edit support
  final DateTime? createdAt;

  MessageModel({
    required this.id,
    required this.conversationId,
    this.sender,
    this.text = '',
    this.file,
    this.media,
    this.audio,
    this.fileType = '',
    this.fileName = '',
    this.fileSize = '',
    this.replyTo,
    this.isDeleted = false,
    this.isEdited = false, // ← FIX 2
    this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['_id'] ?? '',
      conversationId: json['conversationId'] ?? '',
      sender: json['sender'],
      text: json['text'] ?? '',
      file: json['file']?.toString().isNotEmpty == true ? json['file'] : null,
      media: json['media']?.toString().isNotEmpty == true ? json['media'] : null,
      audio: json['audio']?.toString().isNotEmpty == true ? json['audio'] : null,
      fileType: json['fileType'] ?? '',
      fileName: json['fileName'] ?? '',
      fileSize: json['fileSize'] ?? '',
      replyTo: json['replyTo'],
      isDeleted: json['isDeleted'] ?? false,
      isEdited: json['isEdited'] ?? false, // ← FIX 2
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
    );
  }

  String get senderId {
    if (sender is Map) return sender['_id'] ?? '';
    return sender?.toString() ?? '';
  }

  String get senderName {
    if (sender is Map) {
      return '${sender['firstName'] ?? ''} ${sender['lastName'] ?? ''}'.trim();
    }
    return '';
  }

  /// Returns the best available file URL across the 3 possible fields.
  /// Priority: audio > media > file
  String? get anyFile => audio ?? media ?? file;
}