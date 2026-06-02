class ConversationModel {
  final String id;
  final String type;
  final String name;
  final List<dynamic> participants;
  final String lastMessage;
  final DateTime? lastMessageAt;

  ConversationModel({
    required this.id,
    this.type = 'direct',
    this.name = '',
    this.participants = const [],
    this.lastMessage = '',
    this.lastMessageAt,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['_id'] ?? '',
      type: json['type'] ?? 'direct',
      name: json['name'] ?? '',
      participants: json['participants'] ?? [],
      lastMessage: json['lastMessage'] ?? '',
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.tryParse(json['lastMessageAt'])
          : null,
    );
  }

  String getDisplayName(String myId) {
    if (type == 'group') return name.isNotEmpty ? name : 'Group';
    try {
      final other = participants.firstWhere(
        (p) => (p is Map ? p['_id'] : p) != myId,
        orElse: () => null,
      );
      if (other is Map) {
        return '${other['firstName'] ?? ''} ${other['lastName'] ?? ''}'.trim();
      }
    } catch (_) {}
    return name;
  }

  String getInitial(String myId) {
    final n = getDisplayName(myId);
    return n.isNotEmpty ? n[0].toUpperCase() : '?';
  }
}
