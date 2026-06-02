import 'dart:async';
import 'dart:io' show File, Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mime/mime.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:mint_mobile/models/message_model.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../models/conversation_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
import '../../api/user_api.dart';
import '../../api/message_api.dart';
import 'package:dio/dio.dart';
import 'chat_screen.dart';

const String _agoraAppId = '0218fc6197cd4b24981e5fbad21a653c';
const int _maxFileSizeBytes = 25 * 1024 * 1024; // 25 MB

void _showSnack(BuildContext context, String message, {bool isError = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      backgroundColor: isError ? Colors.red : null,
      behavior: SnackBarBehavior.floating,
    ),
  );
}

class ConversationScreen extends StatefulWidget {
  final ThemeModeNotifier? themeNotifier;
  const ConversationScreen({super.key, this.themeNotifier});

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _focusNode = FocusNode();
  final _searchCtrl = TextEditingController();

  MessageModel? _replyTo;
  Timer? _typingTimer;
  bool _showAttach = false;
  bool _showEmoji = false;
  bool _searchMode = false;
  String _searchQuery = '';

  bool _uploadingFile = false;

  final AudioRecorder _recorder = AudioRecorder();
  String? _recordedFilePath;
  bool _isRecording = false;
  Duration _recordDuration = Duration.zero;
  Timer? _recordTimer;
  String? _playingMsgId;

  RtcEngine? _agoraEngine;
  bool _inCall = false;
  bool _callIsVideo = false;
  int? _remoteUid;
  bool _micMuted = false;
  bool _camOff = false;
  bool _remoteJoined = false;
  DateTime? _callStartTime;

  // FIX: declare _callConversationId as a proper field
  String? _callConversationId;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      if (_focusNode.hasFocus && _showEmoji) {
        setState(() => _showEmoji = false);
      }
    });
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    _focusNode.dispose();
    _searchCtrl.dispose();
    _typingTimer?.cancel();
    _recordTimer?.cancel();
    _recorder.dispose();
    _agoraEngine?.leaveChannel();
    _agoraEngine?.release();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollCtrl.hasClients) {
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _onTyping() {
    final auth = context.read<AuthProvider>();
    context.read<ChatProvider>().emitTyping(auth.user?.id ?? '');
    _typingTimer?.cancel();
    _typingTimer = Timer(const Duration(milliseconds: 1500), () {
      context.read<ChatProvider>().emitStopTyping(auth.user?.id ?? '');
    });
  }

  Future<void> _sendMessage() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    _msgCtrl.clear();
    final chat = context.read<ChatProvider>();
    final auth = context.read<AuthProvider>();
    chat.emitStopTyping(auth.user?.id ?? '');
    await chat.sendTextMessage(text, replyToId: _replyTo?.id);
    setState(() => _replyTo = null);
    _scrollToBottom();
  }

  // ── Shared upload helpers ─────────────────────────────────────────────────

  bool _validateFileSize(int sizeBytes, String name) {
    if (sizeBytes > _maxFileSizeBytes) {
      _showSnack(context, 'File too large (max 25 MB)', isError: true);
      return false;
    }
    return true;
  }

  Future<void> _uploadFile(String path, String name) async {
    final file = File(path);
    final size = await file.length();
    if (!mounted) return;
    if (!_validateFileSize(size, name)) return;

    setState(() => _uploadingFile = true);
    try {
      final mime = lookupMimeType(path);
      final success = await context.read<ChatProvider>().sendFile(
            path,
            name,
            mimeType: mime,
          );
      if (success) {
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        _showSnack(
          context,
          e.toString().replaceFirst('Exception: ', ''),
          isError: true,
        );
      }
    } finally {
      if (mounted) setState(() => _uploadingFile = false);
    }
  }

  Future<void> _uploadBytes(Uint8List bytes, String name) async {
    if (!_validateFileSize(bytes.length, name)) return;

    setState(() => _uploadingFile = true);
    try {
      final mime = lookupMimeType(name);
      final success = await context.read<ChatProvider>().sendFileBytes(
            bytes,
            name,
            mimeType: mime,
          );
      if (success) {
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        _showSnack(
          context,
          e.toString().replaceFirst('Exception: ', ''),
          isError: true,
        );
      }
    } finally {
      if (mounted) setState(() => _uploadingFile = false);
    }
  }

  // ── Permission helper ─────────────────────────────────────────────────────
  Future<bool> _requestPermission(Permission permission, String label) async {
    if (kIsWeb) return true;

    var status = await permission.status;
    if (status.isGranted) return true;

    status = await permission.request();
    if (status.isGranted) return true;

    if (status.isPermanentlyDenied && mounted) {
      _showSnack(
        context,
        '$label permission is disabled. Enable it in Settings.',
        isError: true,
      );
      openAppSettings();
    }
    return false;
  }

  // ── Document / any file ───────────────────────────────────────────────────
  Future<void> _pickAndSendFile() async {
    setState(() => _showAttach = false);

    if (!kIsWeb && Platform.isAndroid) {
      final granted = await _requestPermission(Permission.storage, 'Storage');
      if (!granted) return;
    }

    FilePickerResult? result;
    try {
      result = await FilePicker.platform.pickFiles(
        type: FileType.any,
        allowMultiple: false,
        withData: kIsWeb,
        withReadStream: false,
      );
    } catch (e) {
      if (mounted) {
        _showSnack(context, 'Could not open file picker: $e', isError: true);
      }
      return;
    }

    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;

    if (kIsWeb) {
      final bytes = file.bytes;
      if (bytes == null || bytes.isEmpty) {
        if (mounted) _showSnack(context, 'Could not read file.', isError: true);
        return;
      }
      await _uploadBytes(bytes, file.name);
    } else {
      final path = file.path;
      if (path == null || path.isEmpty) {
        if (mounted) {
          _showSnack(context, 'Could not read file path.', isError: true);
        }
        return;
      }
      if (!File(path).existsSync()) {
        if (mounted) {
          _showSnack(context, 'File not found on device.', isError: true);
        }
        return;
      }
      await _uploadFile(path, file.name);
    }
  }

  // ── Camera photo ──────────────────────────────────────────────────────────
  Future<void> _takePhotoAndSend() async {
    setState(() => _showAttach = false);

    if (kIsWeb) {
      FilePickerResult? result;
      try {
        result = await FilePicker.platform.pickFiles(
          type: FileType.image,
          allowMultiple: false,
          withData: true,
        );
      } catch (e) {
        if (mounted) {
          _showSnack(context, 'Could not open picker: $e', isError: true);
        }
        return;
      }
      if (result == null || result.files.isEmpty) return;
      final file = result.files.first;
      final bytes = file.bytes;
      if (bytes == null || bytes.isEmpty) {
        if (mounted) {
          _showSnack(context, 'Could not read image.', isError: true);
        }
        return;
      }
      final name = 'photo_${DateTime.now().millisecondsSinceEpoch}.jpg';
      await _uploadBytes(bytes, name);
      return;
    }

    final granted = await _requestPermission(Permission.camera, 'Camera');
    if (!granted) return;

    XFile? photo;
    try {
      photo = await ImagePicker().pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        preferredCameraDevice: CameraDevice.rear,
      );
    } catch (e) {
      if (mounted) _showSnack(context, 'Camera error: $e', isError: true);
      return;
    }

    if (photo == null) return;
    final name = 'photo_${DateTime.now().millisecondsSinceEpoch}.jpg';
    await _uploadFile(photo.path, name);
  }

  // ── Gallery image ─────────────────────────────────────────────────────────
  Future<void> _pickImageAndSend() async {
    setState(() => _showAttach = false);

    if (!kIsWeb && Platform.isAndroid) {
      var granted =
          await _requestPermission(Permission.photos, 'Photo library');
      if (!granted) {
        granted = await _requestPermission(Permission.storage, 'Storage');
      }
      if (!granted) return;
    } else if (!kIsWeb && Platform.isIOS) {
      final granted =
          await _requestPermission(Permission.photos, 'Photo library');
      if (!granted) return;
    }

    if (kIsWeb) {
      FilePickerResult? result;
      try {
        result = await FilePicker.platform.pickFiles(
          type: FileType.image,
          allowMultiple: false,
          withData: true,
        );
      } catch (e) {
        if (mounted) _showSnack(context, 'Gallery error: $e', isError: true);
        return;
      }
      if (result == null || result.files.isEmpty) return;
      final file = result.files.first;
      final bytes = file.bytes;
      if (bytes == null || bytes.isEmpty) {
        if (mounted) {
          _showSnack(context, 'Could not read image.', isError: true);
        }
        return;
      }
      final name =
          'image_${DateTime.now().millisecondsSinceEpoch}.${file.extension ?? 'jpg'}';
      await _uploadBytes(bytes, name);
      return;
    }

    XFile? photo;
    try {
      photo = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
    } catch (e) {
      if (mounted) _showSnack(context, 'Gallery error: $e', isError: true);
      return;
    }

    if (photo == null) return;
    final name = 'image_${DateTime.now().millisecondsSinceEpoch}.jpg';
    await _uploadFile(photo.path, name);
  }

  // ── Audio file ────────────────────────────────────────────────────────────
  Future<void> _pickAndSendAudio() async {
    setState(() => _showAttach = false);

    if (!kIsWeb && Platform.isAndroid) {
      var granted = await _requestPermission(Permission.audio, 'Audio');
      if (!granted) {
        granted = await _requestPermission(Permission.storage, 'Storage');
      }
      if (!granted) return;
    }

    FilePickerResult? result;
    try {
      result = await FilePicker.platform.pickFiles(
        type: FileType.audio,
        allowMultiple: false,
        withData: kIsWeb,
        withReadStream: false,
      );
    } catch (e) {
      if (mounted) {
        _showSnack(context, 'Could not open audio picker: $e', isError: true);
      }
      return;
    }

    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;

    if (kIsWeb) {
      final bytes = file.bytes;
      if (bytes == null || bytes.isEmpty) {
        if (mounted) {
          _showSnack(context, 'Could not read audio file.', isError: true);
        }
        return;
      }
      await _uploadBytes(bytes, file.name);
    } else {
      final path = file.path;
      if (path == null || path.isEmpty) {
        if (mounted) {
          _showSnack(context, 'Could not read audio file path.', isError: true);
        }
        return;
      }
      if (!File(path).existsSync()) {
        if (mounted) {
          _showSnack(context, 'Audio file not found on device.', isError: true);
        }
        return;
      }
      await _uploadFile(path, file.name);
    }
  }

  // ── Voice Recording ───────────────────────────────────────────────────────
  Future<void> _startRecording() async {
    if (_isRecording) return;

    final granted =
        await _requestPermission(Permission.microphone, 'Microphone');
    if (!granted) return;

    final hasPermission = await _recorder.hasPermission();
    if (!mounted) return;
    if (!hasPermission) {
      _showSnack(context, 'Microphone permission denied.');
      return;
    }

    try {
      final tempDir = await getTemporaryDirectory();
      final outputPath =
          '${tempDir.path}/voicenote_${DateTime.now().millisecondsSinceEpoch}.m4a';
      _recordedFilePath = outputPath;
      await _recorder.start(const RecordConfig(), path: outputPath);

      _recordTimer?.cancel();
      setState(() {
        _isRecording = true;
        _recordDuration = Duration.zero;
      });

      _recordTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (mounted) {
          setState(() {
            _recordDuration = Duration(seconds: timer.tick);
          });
        }
      });
    } catch (e) {
      if (mounted) {
        _showSnack(context, 'Could not start recording: $e', isError: true);
      }
    }
  }

  Future<void> _stopAndSendVoiceNote() async {
    if (!_isRecording) return;
    _recordTimer?.cancel();

    final recordedPath = _recordedFilePath;
    setState(() {
      _isRecording = false;
      _recordDuration = Duration.zero;
    });

    try {
      await _recorder.stop();
    } catch (e) {
      if (mounted) {
        _showSnack(context, 'Failed to stop recording: $e', isError: true);
      }
      _recordedFilePath = null;
      return;
    }

    if (recordedPath == null) return;

    final file = File(recordedPath);
    if (!await file.exists()) {
      if (mounted) {
        _showSnack(context, 'Recording failed to save.', isError: true);
      }
      _recordedFilePath = null;
      return;
    }

    final name = file.path.split('/').last;
    await _uploadFile(file.path, name);
    _recordedFilePath = null;
  }

  Future<void> _cancelRecording() async {
    if (!_isRecording) return;
    _recordTimer?.cancel();
    try {
      await _recorder.cancel();
    } catch (_) {}
    if (_recordedFilePath != null) {
      final file = File(_recordedFilePath!);
      if (await file.exists()) {
        try {
          await file.delete();
        } catch (_) {}
      }
      _recordedFilePath = null;
    }
    if (mounted) {
      setState(() {
        _isRecording = false;
        _recordDuration = Duration.zero;
      });
    }
  }

  // ── Voice Note Playback (placeholder) ─────────────────────────────────────
  Future<void> _togglePlayVoiceNote(String msgId, String fileUrl) async {
    // TODO: Implement audio playback using audioplayers or just_audio
    _showSnack(context, 'Voice note playback coming soon');
  }

  // ── Agora Call Implementation ─────────────────────────────────────────────
  Future<void> _startCall({required bool video}) async {
    if (_agoraAppId == 'YOUR_AGORA_APP_ID') {
      _showSnack(context, 'Agora App ID not configured', isError: true);
      return;
    }

    try {
      final micOk =
          await _requestPermission(Permission.microphone, 'Microphone');
      if (!micOk) return;
      if (video) {
        final camOk = await _requestPermission(Permission.camera, 'Camera');
        if (!camOk) return;
      }

      final engine = createAgoraRtcEngine();
      await engine.initialize(RtcEngineContext(appId: _agoraAppId));

      engine.registerEventHandler(RtcEngineEventHandler(
        onUserJoined: (conn, uid, elapsed) {
          if (mounted) {
            setState(() {
              _remoteUid = uid;
              _remoteJoined = true;
            });
          }
        },
        onUserOffline: (conn, uid, reason) {
          if (mounted) setState(() => _remoteUid = null);
        },
        onLeaveChannel: (conn, stats) {
          if (mounted) setState(() => _inCall = false);
        },
        onError: (err, msg) {
          if (mounted) {
            _showSnack(context, 'Agora error: $msg', isError: true);
            _endCall();
          }
        },
      ));

      final channelId =
          context.read<ChatProvider>().activeConversation?.id ?? '';
      _callConversationId = channelId;

      // Set call state early so UI shows immediately
      _callStartTime = DateTime.now();
      setState(() {
        _agoraEngine = engine;
        _inCall = true;
        _callIsVideo = video;
        _remoteJoined = false;
      });

      if (video) {
        try {
          await engine.enableVideo();
          await engine.enableLocalVideo(true);
          await engine.startPreview();
        } catch (_) {}
      }

      if (channelId.isNotEmpty) {
        try {
          await engine.joinChannel(
            token: '',
            channelId: channelId,
            uid: 0,
            options: const ChannelMediaOptions(),
          );
        } catch (_) {}
      }

      if (!video) {
        try {
          await engine.enableLocalAudio(true);
        } catch (_) {}
      }
    } catch (e) {
      if (mounted) {
        setState(() => _inCall = false);
        _showSnack(context, 'Could not start call: $e', isError: true);
      }
    }
  }

  // FIX: Reset state FIRST so End button always works, then clean up engine
  Future<void> _endCall() async {
    if (!_inCall) return;

    final started = _callStartTime;
    final duration =
        started == null ? null : DateTime.now().difference(started);
    final durText = duration != null ? _formatDuration(duration) : null;

    final summary = _remoteJoined
        ? (_callIsVideo
            ? 'Video call ended${durText != null ? ' ($durText)' : ''}'
            : 'Voice call ended${durText != null ? ' ($durText)' : ''}')
        : (_callIsVideo ? 'Missed video call' : 'Missed voice call');

    final savedConvId = _callConversationId;

    // FIX: Reset UI state immediately so button always responds
    if (mounted) {
      setState(() {
        _inCall = false;
        _remoteUid = null;
        _micMuted = false;
        _camOff = false;
        _remoteJoined = false;
        _callStartTime = null;
        _callConversationId = null;
      });
    }

    // Clean up Agora engine after UI is already updated
    if (_agoraEngine != null) {
      try {
        await _agoraEngine!.stopPreview();
      } catch (_) {}
      try {
        await _agoraEngine!.leaveChannel();
      } catch (_) {}
      try {
        await _agoraEngine!.release();
      } catch (_) {}
      if (mounted) setState(() => _agoraEngine = null);
    }

    // Send summary message to conversation
    try {
      final chat = context.read<ChatProvider>();
      final targetId = savedConvId ?? chat.activeConversation?.id;
      if (targetId == null) return;

      if (chat.activeConversation?.id == targetId) {
        await chat.sendTextMessage(summary);
      } else {
        try {
          final fd = FormData.fromMap({'text': summary});
          await MessageApi.sendMessage(targetId, fd);
        } catch (_) {}
      }
    } catch (_) {}
  }

  void _toggleMic() {
    if (!_inCall) return;
    setState(() => _micMuted = !_micMuted);
    _agoraEngine?.muteLocalAudioStream(_micMuted);
  }

  void _toggleCam() {
    if (!_inCall || !_callIsVideo) return;
    setState(() => _camOff = !_camOff);
    _agoraEngine?.muteLocalVideoStream(_camOff);
  }

  // ── UI Helpers ────────────────────────────────────────────────────────────
  void _toggleEmoji() {
    if (_showEmoji) {
      setState(() => _showEmoji = false);
      _focusNode.requestFocus();
    } else {
      _focusNode.unfocus();
      setState(() => _showEmoji = true);
    }
  }

  void _toggleSearch() {
    setState(() {
      _searchMode = !_searchMode;
      if (!_searchMode) {
        _searchQuery = '';
        _searchCtrl.clear();
      }
    });
  }

  bool get _isDark => widget.themeNotifier?.isDark ?? false;
  Color get _scaffoldBg =>
      _isDark ? const Color(0xFF0F1117) : const Color(0xFFF1F5F9);
  Color get _appBarBg => AppColors.primary;
  Color get _inputBg => _isDark ? const Color(0xFF1E2130) : Colors.white;
  Color get _bubbleIncoming =>
      _isDark ? const Color(0xFF2A2D3E) : const Color(0xFFE5E7EB);
  Color get _textColor => _isDark ? Colors.white : AppColors.textPrimary;

  String _formatDuration(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  // ── Build Methods ─────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final chat = context.watch<ChatProvider>();
    final myId = auth.user?.id ?? '';
    final conv = chat.activeConversation;

    final messages = _searchQuery.isEmpty
        ? chat.messages
        : chat.messages
            .where((m) =>
                m.text.toLowerCase().contains(_searchQuery.toLowerCase()))
            .toList();

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_inCall) {
          _endCall();
          return;
        }
        if (_showEmoji) {
          setState(() => _showEmoji = false);
          return;
        }
        if (_showAttach) {
          setState(() => _showAttach = false);
          return;
        }
        if (_searchMode) {
          _toggleSearch();
          return;
        }
        Navigator.of(context).pop();
      },
      child: Scaffold(
        backgroundColor: _scaffoldBg,
        appBar: _buildAppBar(conv, myId),
        body: Column(
          children: [
            if (_uploadingFile)
              Container(
                color: AppColors.primary.withValues(alpha: 0.9),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: const Row(
                  children: [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    ),
                    SizedBox(width: 12),
                    Text('Sending file…',
                        style: TextStyle(color: Colors.white, fontSize: 13)),
                  ],
                ),
              ),
            if (_inCall) Expanded(child: _buildCallOverlay()),
            if (_searchMode && !_inCall)
              Container(
                color: _appBarBg,
                padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    autofocus: true,
                    cursorColor: Colors.black,
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(color: Colors.black, fontSize: 14),
                    decoration: const InputDecoration(
                      hintText: 'Search messages...',
                      hintStyle: TextStyle(color: Colors.black45),
                      prefixIcon:
                          Icon(Icons.search, color: Colors.black45, size: 18),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ),
            if (!_inCall)
              Expanded(
                child: chat.loadingMessages
                    ? const Center(
                        child:
                            CircularProgressIndicator(color: AppColors.primary))
                    : messages.isEmpty
                        ? Center(
                            child: Text(
                              _searchQuery.isNotEmpty
                                  ? 'No messages match "$_searchQuery"'
                                  : 'No messages yet.\nSay hello! 👋',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  color: _isDark
                                      ? Colors.white38
                                      : AppColors.textMuted),
                            ),
                          )
                        : GestureDetector(
                            onTap: () {
                              _focusNode.unfocus();
                              setState(() {
                                _showAttach = false;
                                _showEmoji = false;
                              });
                            },
                            child: ListView.builder(
                              controller: _scrollCtrl,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 10),
                              itemCount: messages.length +
                                  (chat.typingUser != null ? 1 : 0),
                              itemBuilder: (_, i) {
                                if (i == messages.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(
                                        left: 8, bottom: 4),
                                    child: Text(
                                      chat.typingUser ?? '',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textMuted,
                                          fontStyle: FontStyle.italic),
                                    ),
                                  );
                                }
                                return _MessageBubble(
                                  msg: messages[i],
                                  myId: myId,
                                  isDark: _isDark,
                                  bubbleIncoming: _bubbleIncoming,
                                  playingMsgId: _playingMsgId,
                                  onLongPress: (msg) =>
                                      _showMsgMenu(context, msg, myId),
                                  onReply: (msg) =>
                                      setState(() => _replyTo = msg),
                                  onPlayVoice: _togglePlayVoiceNote,
                                );
                              },
                            ),
                          ),
              ),
            if (_showAttach && !_inCall)
              Container(
                color: _inputBg,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _AttachBtn(
                      icon: Icons.insert_drive_file,
                      label: 'Document',
                      color: Colors.blue,
                      onTap: _pickAndSendFile,
                    ),
                    _AttachBtn(
                      icon: Icons.photo_library,
                      label: 'Gallery',
                      color: Colors.green,
                      onTap: _pickImageAndSend,
                    ),
                    _AttachBtn(
                      icon: Icons.camera_alt,
                      label: 'Camera',
                      color: Colors.deepOrange,
                      onTap: _takePhotoAndSend,
                    ),
                    _AttachBtn(
                      icon: Icons.audiotrack,
                      label: 'Audio',
                      color: Colors.orange,
                      onTap: _pickAndSendAudio,
                    ),
                  ],
                ),
              ),
            if (_replyTo != null && !_inCall)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: _inputBg,
                  border: const Border(
                      left: BorderSide(color: AppColors.primary, width: 4)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        _replyTo!.text.isNotEmpty
                            ? _replyTo!.text.substring(
                                0, (_replyTo!.text.length).clamp(0, 60))
                            : '📎 file',
                        style: TextStyle(
                            fontSize: 13,
                            color:
                                _isDark ? Colors.white54 : AppColors.textMuted),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close,
                          size: 18, color: AppColors.textMuted),
                      onPressed: () => setState(() => _replyTo = null),
                    ),
                  ],
                ),
              ),
            if (!_inCall) _buildInputBar(),
            if (_showEmoji && !_inCall)
              SizedBox(
                height: 280,
                child: EmojiPicker(
                  onEmojiSelected: (category, emoji) {
                    final sel = _msgCtrl.selection;
                    final text = _msgCtrl.text;
                    final start = sel.start < 0 ? text.length : sel.start;
                    final newText = text.substring(0, start) +
                        emoji.emoji +
                        text.substring(start);
                    _msgCtrl.value = TextEditingValue(
                      text: newText,
                      selection: TextSelection.collapsed(
                          offset: start + emoji.emoji.length),
                    );
                  },
                  config: Config(
                    height: 280,
                    emojiViewConfig:
                        EmojiViewConfig(backgroundColor: _inputBg, columns: 8),
                    categoryViewConfig: CategoryViewConfig(
                      backgroundColor: _inputBg,
                      indicatorColor: AppColors.primary,
                      iconColor: AppColors.textMuted,
                      iconColorSelected: AppColors.primary,
                    ),
                    searchViewConfig:
                        SearchViewConfig(backgroundColor: _inputBg),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(ConversationModel? conv, String myId) {
    if (_inCall) {
      return AppBar(
        backgroundColor: const Color(0xFF0D1117),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: _endCall,
        ),
        title: Text(
          _callIsVideo ? 'Video Call' : 'Voice Call',
          style: const TextStyle(color: Colors.white, fontSize: 15),
        ),
        actions: [
          TextButton.icon(
            onPressed: _endCall,
            icon: const Icon(Icons.call_end, color: Colors.white, size: 18),
            label: const Text('End', style: TextStyle(color: Colors.white)),
            style: TextButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            ),
          ),
          const SizedBox(width: 8),
        ],
      );
    }

    return AppBar(
      backgroundColor: _appBarBg,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: conv == null
          ? const Text('Chat', style: TextStyle(color: Colors.white))
          : GestureDetector(
              onTap: () => _showInfo(context, conv, myId),
              child: Row(
                children: [
                  _MiniAvatar(initial: conv.getInitial(myId)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          conv.getDisplayName(myId),
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Colors.white),
                        ),
                        if (conv.type == 'group')
                          Text(
                            '${conv.participants.length} members',
                            style: const TextStyle(
                                fontSize: 11, color: Colors.white70),
                          ),
                      ],
                    ),
                  ),
                  // Call icons beside the name for direct conversations
                  if (conv.type == 'direct') ...[
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () => _startCall(video: false),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 6.0),
                        child: Icon(Icons.phone_outlined, color: Colors.white),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _startCall(video: true),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 6.0),
                        child:
                            Icon(Icons.videocam_outlined, color: Colors.white),
                      ),
                    ),
                  ],
                ],
              ),
            ),
      actions: [
        IconButton(
          icon: Icon(Icons.phone_outlined, color: AppColors.primary),
          tooltip: 'Voice Call',
          onPressed: () => _startCall(video: false),
        ),
        IconButton(
          icon: Icon(Icons.videocam_outlined, color: AppColors.primary),
          tooltip: 'Video Call',
          onPressed: () => _startCall(video: true),
        ),
        IconButton(
          icon: Icon(_searchMode ? Icons.search_off : Icons.search,
              color: AppColors.primary),
          tooltip: 'Search messages',
          onPressed: _toggleSearch,
        ),
      ],
    );
  }

  Widget _buildInputBar() {
    if (_isRecording) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        color: _inputBg,
        child: Row(
          children: [
            GestureDetector(
              onTap: _cancelRecording,
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.delete_outline,
                    color: Colors.red, size: 20),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: _isDark ? const Color(0xFF2A2D3E) : AppColors.surface,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    const _PulsingDot(),
                    const SizedBox(width: 8),
                    Text(
                      _formatDuration(_recordDuration),
                      style: TextStyle(
                          color: _textColor,
                          fontSize: 14,
                          fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 8),
                    Text('Recording…',
                        style: TextStyle(
                            fontSize: 13,
                            color: _isDark
                                ? Colors.white38
                                : AppColors.textMuted)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: _stopAndSendVoiceNote,
              child: Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                    color: AppColors.primary, shape: BoxShape.circle),
                child: const Icon(Icons.send, color: Colors.white, size: 18),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      color: _inputBg,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          GestureDetector(
            onTap: () {
              _focusNode.unfocus();
              setState(() {
                _showAttach = !_showAttach;
                _showEmoji = false;
              });
            },
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                  color: _isDark ? const Color(0xFF2A2D3E) : AppColors.surface,
                  shape: BoxShape.circle),
              child: Icon(Icons.add,
                  size: 20,
                  color: _isDark ? Colors.white54 : AppColors.textMuted),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: _isDark ? const Color(0xFF2A2D3E) : AppColors.surface,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                    color: _isDark ? Colors.white12 : AppColors.border),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const SizedBox(width: 14),
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      focusNode: _focusNode,
                      maxLines: 5,
                      minLines: 1,
                      keyboardType: TextInputType.multiline,
                      textInputAction: TextInputAction.newline,
                      onTap: () => setState(() {
                        _showEmoji = false;
                        _showAttach = false;
                      }),
                      onChanged: (_) => _onTyping(),
                      style: TextStyle(fontSize: 14, color: _textColor),
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        hintStyle: TextStyle(
                            color:
                                _isDark ? Colors.white30 : AppColors.textLight,
                            fontSize: 14),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding:
                            const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: _toggleEmoji,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 6, bottom: 8),
                      child: Icon(
                        _showEmoji
                            ? Icons.keyboard_alt_outlined
                            : Icons.emoji_emotions_outlined,
                        color: _showEmoji
                            ? AppColors.primary
                            : (_isDark ? Colors.white38 : AppColors.textMuted),
                        size: 22,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onLongPressStart: (_) => _startRecording(),
            onLongPressEnd: (_) => _stopAndSendVoiceNote(),
            onTap: () =>
                _showSnack(context, 'Press and hold to record voice note'),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: _isDark ? const Color(0xFF2A2D3E) : AppColors.surface,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.mic_outlined,
                  size: 20,
                  color: _isDark ? Colors.white54 : AppColors.textMuted),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                  color: AppColors.primary, shape: BoxShape.circle),
              child: const Icon(Icons.send, color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCallOverlay() {
    if (_agoraEngine == null) {
      // FIX: show a fallback UI even if engine is null (e.g. still initializing)
      return Container(
        color: const Color(0xFF0D1117),
        width: double.infinity,
        child: SafeArea(
          child: Stack(
            children: [
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _callIsVideo ? Icons.videocam : Icons.call,
                      color: Colors.white54,
                      size: 64,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _callIsVideo
                          ? 'Starting video call…'
                          : 'Starting voice call…',
                      style:
                          const TextStyle(color: Colors.white70, fontSize: 16),
                    ),
                  ],
                ),
              ),
              Positioned(
                bottom: 40,
                left: 0,
                right: 0,
                child: Column(
                  children: [
                    const Text('Tap red button to end call',
                        style: TextStyle(color: Colors.white38, fontSize: 11)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _CallBtn(
                          icon: Icons.call_end,
                          color: Colors.red,
                          onTap: _endCall,
                          size: 64,
                          tooltip: 'End Call',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      color: const Color(0xFF0D1117),
      width: double.infinity,
      child: SafeArea(
        child: Stack(
          children: [
            if (_callIsVideo && _remoteUid != null)
              AgoraVideoView(
                controller: VideoViewController.remote(
                  rtcEngine: _agoraEngine!,
                  canvas: VideoCanvas(uid: _remoteUid),
                  connection: RtcConnection(
                    channelId:
                        context.read<ChatProvider>().activeConversation?.id ??
                            '',
                  ),
                ),
              ),
            if (_remoteUid == null)
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _callIsVideo ? Icons.videocam : Icons.call,
                      color: Colors.white54,
                      size: 64,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _callIsVideo
                          ? 'Starting video call…'
                          : 'Starting voice call…',
                      style:
                          const TextStyle(color: Colors.white70, fontSize: 16),
                    ),
                  ],
                ),
              ),
            if (_callIsVideo)
              Positioned(
                top: 16,
                right: 16,
                child: Container(
                  width: 100,
                  height: 140,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: Colors.black45,
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: AgoraVideoView(
                      controller: VideoViewController(
                        rtcEngine: _agoraEngine!,
                        canvas: const VideoCanvas(uid: 0),
                      ),
                    ),
                  ),
                ),
              ),
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  const Text('Tap red button to return to chat',
                      style: TextStyle(color: Colors.white38, fontSize: 11)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _CallBtn(
                        icon: _micMuted ? Icons.mic_off : Icons.mic,
                        color: _micMuted ? Colors.red : Colors.white24,
                        onTap: _toggleMic,
                        tooltip: _micMuted ? 'Unmute' : 'Mute',
                      ),
                      const SizedBox(width: 24),
                      _CallBtn(
                        icon: Icons.call_end,
                        color: Colors.red,
                        onTap: _endCall,
                        size: 64,
                        tooltip: 'End & Back to Chat',
                      ),
                      if (_callIsVideo) ...[
                        const SizedBox(width: 24),
                        _CallBtn(
                          icon: _camOff ? Icons.videocam_off : Icons.videocam,
                          color: _camOff ? Colors.red : Colors.white24,
                          onTap: _toggleCam,
                          tooltip: _camOff ? 'Camera on' : 'Camera off',
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Menus and Dialogs ─────────────────────────────────────────────────────
  void _showMsgMenu(BuildContext context, MessageModel msg, String myId) {
    final isMe = msg.senderId == myId;
    showModalBottomSheet(
      context: context,
      backgroundColor: _isDark ? const Color(0xFF1E2130) : Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          if (msg.text.isNotEmpty && !msg.isDeleted)
            ListTile(
              leading: const Icon(Icons.copy),
              title: const Text('Copy'),
              onTap: () {
                Clipboard.setData(ClipboardData(text: msg.text));
                Navigator.pop(context);
                _showSnack(context, 'Copied!');
              },
            ),
          if (!msg.isDeleted)
            ListTile(
              leading: const Icon(Icons.reply),
              title: const Text('Reply'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _replyTo = msg);
              },
            ),
          if (!msg.isDeleted)
            ListTile(
              leading: const Icon(Icons.forward),
              title: const Text('Forward'),
              onTap: () {
                Navigator.pop(context);
                _showForwardSheet(context, msg);
              },
            ),
          if (isMe && msg.text.isNotEmpty && !msg.isDeleted)
            ListTile(
              leading: const Icon(Icons.edit_outlined),
              title: const Text('Edit'),
              onTap: () {
                Navigator.pop(context);
                _showEditDialog(context, msg);
              },
            ),
          if (isMe && !msg.isDeleted)
            ListTile(
              leading: const Icon(Icons.delete, color: AppColors.danger),
              title: const Text('Delete',
                  style: TextStyle(color: AppColors.danger)),
              onTap: () async {
                Navigator.pop(context);
                await context.read<ChatProvider>().deleteMessage(msg.id);
              },
            ),
        ]),
      ),
    );
  }

  void _showEditDialog(BuildContext context, MessageModel msg) {
    final editCtrl = TextEditingController(text: msg.text);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: _isDark ? const Color(0xFF1E2130) : Colors.white,
        title: Text('Edit Message',
            style: TextStyle(
                color: _isDark ? Colors.white : AppColors.textPrimary)),
        content: TextField(
          controller: editCtrl,
          autofocus: true,
          maxLines: null,
          style:
              TextStyle(color: _isDark ? Colors.white : AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: 'Edit your message…',
            hintStyle: TextStyle(
                color: _isDark ? Colors.white38 : AppColors.textLight),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              final newText = editCtrl.text.trim();
              if (newText.isEmpty || newText == msg.text) {
                Navigator.pop(ctx);
                return;
              }
              Navigator.pop(ctx);
              await context.read<ChatProvider>().editMessage(msg.id, newText);
            },
            child: const Text('Save', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showForwardSheet(BuildContext context, MessageModel msg) {
    final chat = context.read<ChatProvider>();
    final conversations = chat.conversations;
    if (conversations.isEmpty) {
      _showSnack(context, 'No conversations to forward to', isError: true);
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _isDark ? const Color(0xFF1E2130) : Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          builder: (_, ctrl) => Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(top: 10, bottom: 16),
                decoration: BoxDecoration(
                    color: Colors.grey[400],
                    borderRadius: BorderRadius.circular(2)),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text('Forward to…',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: _isDark ? Colors.white : AppColors.textPrimary)),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: ListView.builder(
                  controller: ctrl,
                  itemCount: conversations.length,
                  itemBuilder: (_, i) {
                    final conv = conversations[i];
                    final auth = context.read<AuthProvider>();
                    final myId = auth.user?.id ?? '';
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: conv.type == 'group'
                            ? const Color(0xFF10B981)
                            : const Color(0xFFCBD5F5),
                        child: Text(conv.getInitial(myId),
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                      ),
                      title: Text(conv.getDisplayName(myId),
                          style: TextStyle(
                              color: _isDark
                                  ? Colors.white
                                  : AppColors.textPrimary)),
                      onTap: () async {
                        Navigator.pop(ctx);
                        final currentConv = chat.activeConversation;
                        await chat.selectConversation(conv);
                        if (msg.text.isNotEmpty) {
                          await chat.sendTextMessage('↪ ${msg.text}');
                        }
                        if (currentConv != null) {
                          await chat.selectConversation(currentConv);
                        }
                        if (!mounted) return;
                        if (mounted) {
                          _showSnack(context,
                              'Forwarded to ${conv.getDisplayName(myId)}');
                        }
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showInfo(BuildContext context, ConversationModel conv, String myId) {
    final isDirect = conv.type == 'direct';

    Map? otherParticipant;
    if (isDirect) {
      for (final p in conv.participants) {
        final map = p as Map?;
        final pid = map?['_id']?.toString() ?? map?['id']?.toString() ?? '';
        if (pid != myId && pid.isNotEmpty) {
          otherParticipant = map;
          break;
        }
      }
    }

    final otherId = otherParticipant?['_id']?.toString() ?? '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _isDark ? const Color(0xFF1E2130) : Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: isDirect ? 0.70 : 0.75,
        maxChildSize: 0.95,
        builder: (_, ctrl) {
          return isDirect && otherId.isNotEmpty
              ? FutureBuilder(
                  future: UserApi.getUserById(otherId),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(
                          child: CircularProgressIndicator(
                              color: AppColors.primary));
                    }

                    Map<String, dynamic> fullUser = {};
                    if (snapshot.hasData && snapshot.data != null) {
                      final data = snapshot.data!.data;
                      if (data is Map<String, dynamic>) {
                        fullUser = data;
                      }
                    } else {
                      fullUser =
                          Map<String, dynamic>.from(otherParticipant ?? {});
                    }

                    return _buildInfoSheet(
                        ctrl, conv, myId, isDirect, fullUser);
                  },
                )
              : _buildInfoSheet(ctrl, conv, myId, isDirect, null);
        },
      ),
    );
  }

  Widget _buildInfoSheet(
    ScrollController ctrl,
    ConversationModel conv,
    String myId,
    bool isDirect,
    Map<String, dynamic>? otherUser,
  ) {
    return ListView(
      controller: ctrl,
      padding: const EdgeInsets.all(20),
      children: [
        Center(
          child: Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
                color: Colors.grey[400],
                borderRadius: BorderRadius.circular(2)),
          ),
        ),
        Center(
          child: Column(children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                  color: AppColors.primary, shape: BoxShape.circle),
              child: Center(
                child: Text(
                  conv.getInitial(myId),
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              conv.getDisplayName(myId),
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: _isDark ? Colors.white : AppColors.textPrimary),
            ),
            if (conv.type == 'group')
              Text('${conv.participants.length} members',
                  style: const TextStyle(color: AppColors.textMuted)),
          ]),
        ),
        const SizedBox(height: 16),

        // ── Call buttons ──
        if (isDirect) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Column(children: [
                GestureDetector(
                  onTap: () {
                    Navigator.pop(context);
                    _startCall(video: false);
                  },
                  child: Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.phone_outlined,
                        color: AppColors.primary, size: 24),
                  ),
                ),
                const SizedBox(height: 6),
                const Text('Voice Call',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
              ]),
              const SizedBox(width: 32),
              Column(children: [
                GestureDetector(
                  onTap: () {
                    Navigator.pop(context);
                    _startCall(video: true);
                  },
                  child: Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.videocam_outlined,
                        color: AppColors.primary, size: 24),
                  ),
                ),
                const SizedBox(height: 6),
                const Text('Video Call',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
              ]),
              const SizedBox(width: 32),
              Column(children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: AppColors.accent.withValues(alpha: 0.3)),
                    ),
                    child: Icon(Icons.chat_outlined,
                        color: AppColors.accent, size: 24),
                  ),
                ),
                const SizedBox(height: 6),
                const Text('Message',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
              ]),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(),
        ],

        const SizedBox(height: 16),
        if (isDirect && otherUser != null && otherUser.isNotEmpty) ...[
          _InfoTile(
            icon: Icons.person_outline,
            label: 'Full Name',
            value:
                '${otherUser['firstName'] ?? ''} ${otherUser['lastName'] ?? ''}'
                    .trim(),
            isDark: _isDark,
          ),
          _InfoTile(
            icon: Icons.email_outlined,
            label: 'Email',
            value:
                _firstNonEmpty([otherUser['email'], otherUser['emailAddress']]),
            isDark: _isDark,
          ),
          _InfoTile(
            icon: Icons.phone_outlined,
            label: 'Phone',
            value: _firstNonEmpty([
              otherUser['phone'],
              otherUser['phoneNumber'],
              otherUser['mobile']
            ]),
            isDark: _isDark,
          ),
          _InfoTile(
            icon: Icons.apartment_outlined,
            label: 'Department',
            value: _firstNonEmpty([
              otherUser['department'],
              otherUser['dept'],
              otherUser['division']
            ]),
            isDark: _isDark,
          ),
          _InfoTile(
            icon: Icons.badge_outlined,
            label: 'Role',
            value: _firstNonEmpty([
              otherUser['role'],
              otherUser['position'],
              otherUser['jobTitle']
            ]),
            isDark: _isDark,
          ),
        ],
        if (isDirect && (otherUser == null || otherUser.isEmpty))
          Center(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'User details not available.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: _isDark ? Colors.white38 : AppColors.textMuted,
                    fontSize: 13),
              ),
            ),
          ),
        if (conv.type == 'group') ...[
          Text('Members',
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                  color: _isDark ? Colors.white : AppColors.textPrimary)),
          const SizedBox(height: 8),
          ...conv.participants.map((p) {
            final map = p as Map?;
            final name = map != null
                ? '${map['firstName'] ?? ''} ${map['lastName'] ?? ''}'.trim()
                : '?';
            final role = map?['role'] ?? map?['userRole'] ?? '';
            final dept = map?['department'] ?? map?['dept'] ?? '';
            final email = map?['email'] ?? '';
            return ListTile(
              trailing: GestureDetector(
                onTap: _toggleSearch,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6.0),
                  child: Icon(Icons.search,
                      color: _isDark ? Colors.white : AppColors.textMuted),
                ),
              ),
              leading: UserAvatar(
                  initials: name.isNotEmpty ? name[0].toUpperCase() : '?',
                  size: 38),
              title: Text(name,
                  style: TextStyle(
                      color: _isDark ? Colors.white : AppColors.textPrimary)),
              subtitle: Text(
                [role, dept, email].where((s) => s.isNotEmpty).join(' · '),
                style:
                    const TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
              contentPadding: EdgeInsets.zero,
            );
          }),
        ],
      ],
    );
  }

  String _firstNonEmpty(List<dynamic> values) {
    for (final v in values) {
      if (v != null && v.toString().trim().isNotEmpty) {
        return v.toString().trim();
      }
    }
    return 'N/A';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stateless widget classes
// ─────────────────────────────────────────────────────────────────────────────

class _PulsingDot extends StatefulWidget {
  const _PulsingDot();
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 700))
      ..repeat(reverse: true);
    _anim = Tween(begin: 0.4, end: 1.0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _anim,
      child: Container(
        width: 10,
        height: 10,
        decoration:
            const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isDark;

  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF252837) : AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? Colors.white10 : AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon,
              size: 20, color: isDark ? Colors.white38 : AppColors.textMuted),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.white38 : AppColors.textLight,
                        letterSpacing: 0.3)),
                const SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: isDark ? Colors.white : AppColors.textPrimary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CallBtn extends StatelessWidget {
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  final double size;
  final String? tooltip;

  const _CallBtn({
    required this.icon,
    required this.color,
    required this.onTap,
    this.size = 54,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    final btn = GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        child: Icon(icon, color: Colors.white, size: size * 0.45),
      ),
    );
    if (tooltip != null) return Tooltip(message: tooltip!, child: btn);
    return btn;
  }
}

class _MiniAvatar extends StatelessWidget {
  final String initial;
  const _MiniAvatar({required this.initial});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.25), shape: BoxShape.circle),
      child: Center(
          child: Text(initial,
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15))),
    );
  }
}

class _AttachBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _AttachBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(children: [
        Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 24)),
        const SizedBox(height: 6),
        Text(label,
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ]),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final MessageModel msg;
  final String myId;
  final bool isDark;
  final Color bubbleIncoming;
  final String? playingMsgId;
  final void Function(MessageModel) onLongPress;
  final void Function(MessageModel) onReply;
  final Future<void> Function(String msgId, String fileUrl) onPlayVoice;

  const _MessageBubble({
    required this.msg,
    required this.myId,
    required this.isDark,
    required this.bubbleIncoming,
    required this.onLongPress,
    required this.onReply,
    required this.onPlayVoice,
    this.playingMsgId,
  });

  bool get _isVoiceNote {
    final name = msg.fileName.toLowerCase();
    return name.endsWith('.aac') ||
        name.endsWith('.m4a') ||
        name.endsWith('.mp3') ||
        name.startsWith('voicenote_');
  }

  bool get _isImage {
    final name = msg.fileName.toLowerCase();
    return name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.png') ||
        name.endsWith('.gif') ||
        name.endsWith('.webp') ||
        name.startsWith('photo_') ||
        name.startsWith('image_');
  }

  @override
  Widget build(BuildContext context) {
    final isMe = msg.senderId == myId;
    final time = msg.createdAt != null
        ? '${msg.createdAt!.hour.toString().padLeft(2, '0')}:${msg.createdAt!.minute.toString().padLeft(2, '0')}'
        : '';
    final isPlaying = playingMsgId == msg.id;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: const Color(0xFFCBD5F5),
              child: Text(
                msg.senderName.isNotEmpty
                    ? msg.senderName[0].toUpperCase()
                    : '?',
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary),
              ),
            ),
            const SizedBox(width: 6),
          ],
          GestureDetector(
            onLongPress: () => onLongPress(msg),
            onDoubleTap: () => onReply(msg),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.65),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isMe ? AppColors.bubbleOutgoing : bubbleIncoming,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(12),
                    topRight: const Radius.circular(12),
                    bottomLeft: Radius.circular(isMe ? 12 : 0),
                    bottomRight: Radius.circular(isMe ? 0 : 12),
                  ),
                ),
                child: Column(
                  crossAxisAlignment:
                      isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    if (!isMe && msg.senderName.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 3),
                        child: Text(msg.senderName,
                            style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary)),
                      ),
                    if (msg.replyTo != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 5),
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                          border: const Border(
                              left:
                                  BorderSide(color: Colors.white54, width: 3)),
                        ),
                        child: Text(
                          msg.replyTo is Map
                              ? (msg.replyTo['text'] ?? '📎 file')
                              : '📎',
                          style: TextStyle(
                              fontSize: 11,
                              color:
                                  isMe ? Colors.white70 : AppColors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    if (msg.isDeleted)
                      Text('This message was deleted',
                          style: TextStyle(
                              fontSize: 13,
                              fontStyle: FontStyle.italic,
                              color:
                                  isMe ? Colors.white70 : AppColors.textMuted))
                    else if (msg.file != null && _isVoiceNote)
                      _VoiceNoteBubble(
                        isMe: isMe,
                        isPlaying: isPlaying,
                        onTap: () => onPlayVoice(msg.id, msg.file!),
                      )
                    else if (msg.file != null && _isImage)
                      _ImageBubble(
                        fileUrl: msg.file!,
                        fileName: msg.fileName,
                        isMe: isMe,
                      )
                    else if (msg.text.isNotEmpty)
                      Column(
                        crossAxisAlignment: isMe
                            ? CrossAxisAlignment.end
                            : CrossAxisAlignment.start,
                        children: [
                          Text(
                            msg.text,
                            style: TextStyle(
                                fontSize: 14,
                                color: isMe
                                    ? Colors.white
                                    : (isDark
                                        ? Colors.white
                                        : AppColors.textPrimary)),
                          ),
                          if (msg.isEdited == true)
                            Text('edited',
                                style: TextStyle(
                                    fontSize: 10,
                                    fontStyle: FontStyle.italic,
                                    color: isMe
                                        ? Colors.white54
                                        : AppColors.textLight)),
                        ],
                      )
                    else if (msg.file != null)
                      _FileCard(fileName: msg.fileName, isMe: isMe)
                    else
                      Text('📎 Attachment',
                          style: TextStyle(
                              color:
                                  isMe ? Colors.white70 : AppColors.textMuted)),
                    const SizedBox(height: 3),
                    Text(time,
                        style: TextStyle(
                            fontSize: 10,
                            color:
                                isMe ? Colors.white60 : AppColors.textLight)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VoiceNoteBubble extends StatelessWidget {
  final bool isMe;
  final bool isPlaying;
  final VoidCallback onTap;

  const _VoiceNoteBubble({
    required this.isMe,
    required this.isPlaying,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isMe
                  ? Colors.white24
                  : AppColors.primary.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPlaying ? Icons.stop : Icons.play_arrow,
              color: isMe ? Colors.white : AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 8),
          Row(
            children: List.generate(
              12,
              (i) => Container(
                width: 3,
                height: (i % 3 == 0
                        ? 18
                        : i % 3 == 1
                            ? 12
                            : 8)
                    .toDouble(),
                margin: const EdgeInsets.symmetric(horizontal: 1),
                decoration: BoxDecoration(
                  color: isMe
                      ? Colors.white.withValues(alpha: isPlaying ? 1 : 0.6)
                      : AppColors.primary
                          .withValues(alpha: isPlaying ? 1 : 0.5),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
          const SizedBox(width: 6),
          Icon(Icons.mic,
              size: 14, color: isMe ? Colors.white54 : AppColors.textMuted),
        ],
      ),
    );
  }
}

class _ImageBubble extends StatelessWidget {
  final String fileUrl;
  final String fileName;
  final bool isMe;

  const _ImageBubble({
    required this.fileUrl,
    required this.fileName,
    required this.isMe,
  });

  @override
  Widget build(BuildContext context) {
    final isLocal = !kIsWeb && fileUrl.startsWith('/');
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: isLocal
          ? Image.file(File(fileUrl),
              width: 180,
              height: 180,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _fileFallback())
          : Image.network(fileUrl,
              width: 180,
              height: 180,
              fit: BoxFit.cover,
              loadingBuilder: (_, child, progress) => progress == null
                  ? child
                  : SizedBox(
                      width: 180,
                      height: 180,
                      child: Center(
                        child: CircularProgressIndicator(
                          value: progress.expectedTotalBytes != null
                              ? progress.cumulativeBytesLoaded /
                                  progress.expectedTotalBytes!
                              : null,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
              errorBuilder: (_, __, ___) => _fileFallback()),
    );
  }

  Widget _fileFallback() => _FileCard(fileName: fileName, isMe: isMe);
}

class _FileCard extends StatelessWidget {
  final String fileName;
  final bool isMe;
  const _FileCard({required this.fileName, required this.isMe});

  Color get _iconColor {
    final ext = fileName.split('.').last.toLowerCase();
    if (ext == 'pdf') return const Color(0xFFE53935);
    if (ext == 'doc' || ext == 'docx') return const Color(0xFF2B579A);
    if (ext == 'xls' || ext == 'xlsx') return const Color(0xFF217346);
    return const Color(0xFF6B7280);
  }

  String get _label {
    final ext = fileName.split('.').last.toLowerCase();
    if (ext == 'pdf') return 'PDF';
    if (ext == 'doc' || ext == 'docx') return 'W';
    if (ext == 'xls' || ext == 'xlsx') return 'X';
    return 'FILE';
  }

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
              color: _iconColor, borderRadius: BorderRadius.circular(6)),
          child: Center(
              child: Text(_label,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold)))),
      const SizedBox(width: 8),
      Flexible(
          child: Text(fileName.isNotEmpty ? fileName : 'file',
              style: TextStyle(
                  fontSize: 13,
                  color: isMe ? Colors.white : AppColors.textPrimary),
              maxLines: 2,
              overflow: TextOverflow.ellipsis)),
      const SizedBox(width: 6),
      Icon(Icons.download,
          size: 18, color: isMe ? Colors.white70 : AppColors.textMuted),
    ]);
  }
}
