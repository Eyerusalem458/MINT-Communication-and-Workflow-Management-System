import 'package:dio/dio.dart';
import 'dio_client.dart';

class MessageApi {
  static Future<Response> getChatUsers() =>
      DioClient.instance.get('/messages/users');

  static Future<Response> getConversations() =>
      DioClient.instance.get('/messages/conversations');

  static Future<Response> getOrCreateDirect(String userId) =>
      DioClient.instance.post(
        '/messages/conversations/direct',
        data: {'userId': userId},
      );

  static Future<Response> createGroup(
          String name, List<String> participants) =>
      DioClient.instance.post(
        '/messages/conversations/group',
        data: {'name': name, 'participants': participants},
      );

  static Future<Response> getMessages(String conversationId) =>
      DioClient.instance.get('/messages/$conversationId');

  /// Sends a message (text or file) to a conversation.
  ///
  /// [formData] must already contain either a 'text' field or a 'file'
  /// MultipartFile (or both for a caption).
  ///
  /// [onSendProgress] is optional — pass it from ChatProvider.sendFile
  /// to track upload progress (bytes sent / total bytes).
  static Future<Response> sendMessage(
    String conversationId,
    FormData formData, {
    void Function(int sent, int total)? onSendProgress,
  }) =>
      DioClient.instance.post(
        '/messages/$conversationId',
        data: formData,
        onSendProgress: onSendProgress,
        options: Options(
          contentType: 'multipart/form-data',
          // Give large file uploads up to 5 minutes before timing out.
          // Adjust to match your server's own upload limit.
          sendTimeout: const Duration(minutes: 5),
          receiveTimeout: const Duration(minutes: 2),
        ),
      );

  static Future<Response> deleteMessage(String messageId) =>
      DioClient.instance.delete('/messages/message/$messageId');

  /// Edit a sent message.
  /// Uses PUT — change to .patch() if your backend uses PATCH instead.
  static Future<Response> editMessage(
          String messageId, String newText) =>
      DioClient.instance.put(
        '/messages/message/$messageId',
        data: {'text': newText},
      );
}