import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'constants.dart';

class SocketService {
  static IO.Socket? _socket;

  static IO.Socket get socket {
    _socket ??= IO.io(
      kSocketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setReconnectionAttempts(10)
          .setReconnectionDelay(2000)
          .enableReconnection()
          .build(),
    );
    return _socket!;
  }

  // ── Connect ──────────────────────────────────────────────────
  static void connect(String userId) {
    if (!socket.connected) {
      socket.connect();
    }

    socket.off('connect');
    socket.on('connect', (_) {
      socket.emit('join_user', userId);
      print('✅ Socket connected: $userId');
    });

    socket.on('disconnect', (_) {
      print('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) {
      print('⚠️ Socket connection error: $err');
    });
  }

  // ── Conversation rooms ────────────────────────────────────────
  static void joinConversation(String conversationId) {
    if (socket.connected) {
      socket.emit('join_conversation', conversationId);
    }
  }

  static void leaveConversation(String conversationId) {
    if (socket.connected) {
      socket.emit('leave_conversation', conversationId);
    }
  }

  // ── Typing ────────────────────────────────────────────────────
  static void emitTyping(String conversationId, String userId) {
    socket.emit('typing', {
      'conversationId': conversationId,
      'userId': userId,
    });
  }

  static void emitStopTyping(String conversationId, String userId) {
    socket.emit('stop_typing', {
      'conversationId': conversationId,
      'userId': userId,
    });
  }

  // ── Event listeners ───────────────────────────────────────────
  static void onNewMessage(Function(dynamic) handler) {
    socket.off('newMessage');
    socket.on('newMessage', handler);
  }

  static void onMessageDeleted(Function(dynamic) handler) {
    socket.off('messageDeleted');
    socket.on('messageDeleted', handler);
  }

  // ── FIX 2: Edit message socket event ─────────────────────────
  // The event name 'messageEdited' must match what your backend emits.
  // Common alternatives: 'message_edited', 'editMessage' — adjust if needed.
  static void onMessageEdited(Function(dynamic) handler) {
    socket.off('messageEdited');
    socket.on('messageEdited', handler);
  }

  static void onTyping(Function(dynamic) handler) {
    socket.off('typing');
    socket.on('typing', handler);
  }

  static void onStopTyping(Function(dynamic) handler) {
    socket.off('stop_typing');
    socket.on('stop_typing', handler);
  }

  // ── Cleanup ───────────────────────────────────────────────────
  static void disconnect() {
    if (_socket != null) {
      socket.disconnect();
      socket.dispose();
      _socket = null;
    }
  }

  // ── FIX: offAll now also clears the messageEdited listener ────
  static void offAll() {
    socket.off('newMessage');
    socket.off('messageDeleted');
    socket.off('messageEdited'); // ← added
    socket.off('typing');
    socket.off('stop_typing');
  }
}