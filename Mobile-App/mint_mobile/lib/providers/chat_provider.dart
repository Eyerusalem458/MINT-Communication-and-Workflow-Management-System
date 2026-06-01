import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:mint_mobile/models/user_model.dart';
import '../api/message_api.dart';
import '../models/conversation_model.dart';
import '../models/message_model.dart';
import '../utils/socket_service.dart';

class ChatProvider extends ChangeNotifier {
  ChatProvider() {
    _setupSocketListeners();
  }

  List<ConversationModel> _conversations = [];
  List<MessageModel> _messages = [];
  List<UserModel> _chatUsers = [];
  ConversationModel? _activeConversation;
  bool _loadingConversations = false;
  bool _loadingMessages = false;
  String? _typingUser;
  String? _lastError;

  List<ConversationModel> get conversations => _conversations;
  List<MessageModel> get messages => _messages;
  List<UserModel> get chatUsers => _chatUsers;
  ConversationModel? get activeConversation => _activeConversation;
  bool get loadingConversations => _loadingConversations;
  bool get loadingMessages => _loadingMessages;
  String? get typingUser => _typingUser;
  String? get lastError => _lastError;

  Future<void> refresh() async {
    await fetchAll();
  }

  Future<void> fetchAll() async {
    _loadingConversations = true;
    notifyListeners();
    try {
      final results = await Future.wait([
        MessageApi.getConversations(),
        MessageApi.getChatUsers(),
      ]);
      _conversations = (results[0].data as List)
          .map((c) => ConversationModel.fromJson(c))
          .toList();
      _chatUsers =
          (results[1].data as List).map((u) => UserModel.fromJson(u)).toList();
    } catch (e) {
      _lastError = e.toString();
    }
    _loadingConversations = false;
    notifyListeners();
  }

  Future<void> selectConversation(ConversationModel conv) async {
    if (_activeConversation != null) {
      SocketService.leaveConversation(_activeConversation!.id);
    }
    _activeConversation = conv;
    _messages = [];
    _loadingMessages = true;
    notifyListeners();

    SocketService.joinConversation(conv.id);

    try {
      final res = await MessageApi.getMessages(conv.id);
      _messages =
          (res.data as List).map((m) => MessageModel.fromJson(m)).toList();
    } catch (e) {
      _lastError = e.toString();
    }
    _loadingMessages = false;
    notifyListeners();
  }

  void _setupSocketListeners() {
    SocketService.offAll();

    SocketService.onNewMessage((data) {
      final msg = MessageModel.fromJson(data);

      if (msg.conversationId == _activeConversation?.id) {
        // Remove any optimistic placeholder with same tempId if present
        _messages.removeWhere((m) => m.id == '__temp__${msg.id}');

        final alreadyExists = _messages.any((m) => m.id == msg.id);
        if (!alreadyExists) {
          _messages.add(msg);
          notifyListeners();
        }
      }

      final idx = _conversations.indexWhere((c) => c.id == msg.conversationId);
      if (idx != -1) {
        final c = _conversations[idx];
        _conversations[idx] = ConversationModel(
          id: c.id,
          type: c.type,
          name: c.name,
          participants: c.participants,
          lastMessage: msg.text.isNotEmpty ? msg.text : '📎 file',
          lastMessageAt: DateTime.now(),
        );
        notifyListeners();
      }
    });

    SocketService.onMessageDeleted((data) {
      final messageId = data['messageId'];
      final idx = _messages.indexWhere((m) => m.id == messageId);
      if (idx != -1) {
        _messages[idx] = MessageModel(
          id: _messages[idx].id,
          conversationId: _messages[idx].conversationId,
          sender: _messages[idx].sender,
          text: 'This message was deleted',
          isDeleted: true,
        );
        notifyListeners();
      }
    });

    SocketService.onMessageEdited((data) {
      final messageId = data['messageId'] ?? data['_id'] ?? '';
      final newText = data['text'] ?? '';
      final idx = _messages.indexWhere((m) => m.id == messageId);
      if (idx != -1) {
        final old = _messages[idx];
        _messages[idx] = MessageModel(
          id: old.id,
          conversationId: old.conversationId,
          sender: old.sender,
          text: newText,
          isDeleted: old.isDeleted,
          isEdited: true,
          replyTo: old.replyTo,
          file: old.file,
          fileName: old.fileName,
          createdAt: old.createdAt,
        );
        notifyListeners();
      }
    });

    SocketService.onTyping((data) {
      _typingUser = 'Someone is typing…';
      notifyListeners();
    });

    SocketService.onStopTyping((_) {
      _typingUser = null;
      notifyListeners();
    });
  }

  Future<void> sendTextMessage(String text, {String? replyToId}) async {
    if (_activeConversation == null || text.trim().isEmpty) return;

    final map = <String, dynamic>{'text': text};
    if (replyToId != null) map['replyTo'] = replyToId;

    final fd = FormData.fromMap(map);
    try {
      await MessageApi.sendMessage(_activeConversation!.id, fd);
    } catch (e) {
      _lastError = 'Failed to send message: $e';
      notifyListeners();
      rethrow; // Let UI handle it
    }
  }

  /// Uploads a file as multipart/form-data.
  /// Returns true on success, false on failure.
  /// Adds an optimistic placeholder bubble immediately so the user sees
  /// something while the upload is in progress, then replaces it once the
  /// socket confirms the real message.
  Future<bool> sendFile(
    String filePath,
    String fileName, {
    String? mimeType,
    void Function(int sent, int total)? onProgress,
  }) async {
    if (_activeConversation == null) return false;

    // --- Optimistic placeholder so UI feels instant ---
    final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}';
    final placeholder = MessageModel(
      id: tempId,
      conversationId: _activeConversation!.id,
      sender: null, // will be filled by socket response
      text: '',
      file: filePath, // show local path while uploading
      fileName: fileName,
      createdAt: DateTime.now(),
    );
    _messages.add(placeholder);
    notifyListeners();

    try {
      final multipartFile = await MultipartFile.fromFile(
        filePath,
        filename: fileName,
        // Dio infers content-type from extension by default;
        // pass mimeType explicitly if you have it (e.g. 'image/jpeg')
        contentType: mimeType != null ? DioMediaType.parse(mimeType) : null,
      );

      final fd = FormData.fromMap({'file': multipartFile});

      await MessageApi.sendMessage(
        _activeConversation!.id,
        fd,
        onSendProgress: onProgress != null
            ? (sent, total) => onProgress(sent, total)
            : null,
      );

      // Socket's onNewMessage will replace the placeholder automatically.
      // But if your backend doesn't emit back to sender, remove placeholder
      // and reload messages as a fallback after a short delay.
      await Future.delayed(const Duration(seconds: 3), () {
        final stillHasPlaceholder = _messages.any((m) => m.id == tempId);
        if (stillHasPlaceholder) {
          _messages.removeWhere((m) => m.id == tempId);
          // Re-fetch to get the real message from server
          if (_activeConversation != null) {
            MessageApi.getMessages(_activeConversation!.id).then((res) {
              _messages = (res.data as List)
                  .map((m) => MessageModel.fromJson(m))
                  .toList();
              notifyListeners();
            }).catchError((_) {});
          }
        }
      });

      return true;
    } on DioException catch (e) {
      // Remove the placeholder on failure
      _messages.removeWhere((m) => m.id == tempId);

      // Build a human-readable error
      String msg = 'Upload failed';
      if (e.response != null) {
        final status = e.response!.statusCode;
        final body = e.response!.data;
        msg = 'Server error $status: ${body ?? e.message}';
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        msg = 'Upload timed out — check your connection';
      } else {
        msg = e.message ?? msg;
      }

      _lastError = msg;
      notifyListeners();
      throw Exception(msg); // Re-throw so the UI can show a snackbar
    } catch (e) {
      _messages.removeWhere((m) => m.id == tempId);
      _lastError = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  /// Web-only: upload from raw bytes (FilePicker gives bytes, not a path, on web).
  /// Returns true on success, throws on failure.
  Future<bool> sendFileBytes(
    Uint8List bytes,
    String fileName, {
    String? mimeType,
  }) async {
    if (_activeConversation == null) return false;

    final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}';
    final placeholder = MessageModel(
      id: tempId,
      conversationId: _activeConversation!.id,
      sender: null,
      text: '',
      file: null,
      fileName: fileName,
      createdAt: DateTime.now(),
    );
    _messages.add(placeholder);
    notifyListeners();

    try {
      final multipartFile = MultipartFile.fromBytes(
        bytes,
        filename: fileName,
        contentType: mimeType != null ? DioMediaType.parse(mimeType) : null,
      );

      final fd = FormData.fromMap({'file': multipartFile});
      await MessageApi.sendMessage(_activeConversation!.id, fd);

      // Fallback: if socket doesn't fire within 3 s, re-fetch messages
      await Future.delayed(const Duration(seconds: 3), () {
        final stillHasPlaceholder = _messages.any((m) => m.id == tempId);
        if (stillHasPlaceholder) {
          _messages.removeWhere((m) => m.id == tempId);
          if (_activeConversation != null) {
            MessageApi.getMessages(_activeConversation!.id).then((res) {
              _messages = (res.data as List)
                  .map((m) => MessageModel.fromJson(m))
                  .toList();
              notifyListeners();
            }).catchError((_) {});
          }
        }
      });

      return true;
    } on DioException catch (e) {
      _messages.removeWhere((m) => m.id == tempId);
      String msg = 'Upload failed';
      if (e.response != null) {
        msg =
            'Server error ${e.response!.statusCode}: ${e.response!.data ?? e.message}';
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        msg = 'Upload timed out — check your connection';
      } else {
        msg = e.message ?? msg;
      }
      _lastError = msg;
      notifyListeners();
      throw Exception(msg);
    } catch (e) {
      _messages.removeWhere((m) => m.id == tempId);
      _lastError = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> deleteMessage(String messageId) async {
    try {
      await MessageApi.deleteMessage(messageId);
      final idx = _messages.indexWhere((m) => m.id == messageId);
      if (idx != -1) {
        _messages[idx] = MessageModel(
          id: _messages[idx].id,
          conversationId: _messages[idx].conversationId,
          sender: _messages[idx].sender,
          text: 'This message was deleted',
          isDeleted: true,
        );
        notifyListeners();
      }
    } catch (e) {
      _lastError = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> editMessage(String messageId, String newText) async {
    try {
      await MessageApi.editMessage(messageId, newText);

      final idx = _messages.indexWhere((m) => m.id == messageId);
      if (idx != -1) {
        final old = _messages[idx];
        _messages[idx] = MessageModel(
          id: old.id,
          conversationId: old.conversationId,
          sender: old.sender,
          text: newText,
          isDeleted: old.isDeleted,
          isEdited: true,
          replyTo: old.replyTo,
          file: old.file,
          fileName: old.fileName,
          createdAt: old.createdAt,
        );
        notifyListeners();
      }
    } catch (e) {
      _lastError = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<ConversationModel?> startDirect(String userId) async {
    try {
      final res = await MessageApi.getOrCreateDirect(userId);
      final conv = ConversationModel.fromJson(res.data);
      if (!_conversations.any((c) => c.id == conv.id)) {
        _conversations.insert(0, conv);
        notifyListeners();
      }
      return conv;
    } catch (e) {
      _lastError = e.toString();
      return null;
    }
  }

  Future<ConversationModel?> createGroup(String name, List<String> ids) async {
    try {
      final res = await MessageApi.createGroup(name, ids);
      final conv = ConversationModel.fromJson(res.data);
      _conversations.insert(0, conv);
      notifyListeners();
      return conv;
    } catch (e) {
      _lastError = e.toString();
      return null;
    }
  }

  void emitTyping(String userId) {
    if (_activeConversation != null) {
      SocketService.emitTyping(_activeConversation!.id, userId);
    }
  }

  void emitStopTyping(String userId) {
    if (_activeConversation != null) {
      SocketService.emitStopTyping(_activeConversation!.id, userId);
    }
  }

  @override
  void dispose() {
    SocketService.offAll();
    super.dispose();
  }
}
