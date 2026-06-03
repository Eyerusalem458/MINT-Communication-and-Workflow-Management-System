import 'dart:async';
// ignore: avoid_web_libraries_in_flutter
import 'dart:js_interop';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
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
import 'package:audioplayers/audioplayers.dart';
import 'package:open_filex/open_filex.dart';
import 'package:dio/dio.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../models/conversation_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
import '../../api/user_api.dart';
import '../../api/message_api.dart';
import 'chat_screen.dart';

const String _agoraAppId = '0218fc6197cd4b24981e5fbad21a653c';
const int _maxFileSizeBytes = 25 * 1024 * 1024;

// ─── URL helper ───────────────────────────────────────────────────────────────
String _resolveUrl(String? raw) {
  if (raw == null || raw.isEmpty) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  final path = raw.startsWith('/') ? raw : '/$raw';
  return '$kMediaBaseUrl$path';
}

// ─── Message formatter — mirrors React formatMessage() ───────────────────────
// Converts raw backend JSON (call records, audio filenames) into readable text.
// Used in both the message bubble and the reply/forward preview.
String _formatMessage(String? message) {
  if (message == null || message.isEmpty) return message ?? '';

  // 1. Call record (broken JSON stored in DB)
  if (message.contains('__callRecord')) {
    final prefixMatch =
        RegExp(r'^(New message from .+?:\s*)').firstMatch(message);
    final prefix = prefixMatch?.group(1) ?? '';

    final callType =
        RegExp(r'"callType"\s*:\s*"([^"]+)"').firstMatch(message)?.group(1) ??
            'voice';
    final status =
        RegExp(r'"status"\s*:\s*"([^"]*)"').firstMatch(message)?.group(1) ?? '';

    final isVideo = callType == 'video';
    final icon = isVideo ? '📹' : '📞';
    final label = isVideo ? 'Video call' : 'Voice call';
    final statusLabel = status == 'missed'
        ? ' (Missed)'
        : status == 'ended'
            ? ' (Ended)'
            : '';
    return '$prefix$icon $label$statusLabel';
  }

  // 2. Audio filename patterns
  final audioExt = RegExp(
    r"\.(webm|mp3|ogg|wav|m4a|aac|opus|flac)(\s|$)",
    caseSensitive: false,
  );
  if (message.contains('🎤')) return '🎵 Audio';
  if (RegExp(r'📎\s*(audio|voice)', caseSensitive: false).hasMatch(message)) {
    return '🎵 Audio';
  }
  if (message.contains('📎') && audioExt.hasMatch(message)) return '🎵 Audio';
  if (audioExt.hasMatch(message)) return '🎵 Audio';

  // 3. Everything else unchanged
  return message;
}

void _showSnack(BuildContext context, String message, {bool isError = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      backgroundColor: isError ? Colors.red : null,
      behavior: SnackBarBehavior.floating,
    ),
  );
}

// ─── File-type helpers ────────────────────────────────────────────────────────
bool _isImageFile(String name) {
  final n = name.toLowerCase().split('?').first;
  return n.endsWith('.jpg') ||
      n.endsWith('.jpeg') ||
      n.endsWith('.png') ||
      n.endsWith('.gif') ||
      n.endsWith('.webp');
}

bool _isVoiceFile(String name) {
  final n = name.toLowerCase().split('?').first;
  return n.endsWith('.aac') ||
      n.endsWith('.m4a') ||
      n.endsWith('.mp3') ||
      n.endsWith('.wav') ||
      n.endsWith('.ogg') ||
      n.endsWith('.webm') ||
      n.contains('voicenote');
}

bool _isAudioFile(String name) => _isVoiceFile(name);

// ═════════════════════════════════════════════════════════════════════════════
class ConversationScreen extends StatefulWidget {
  final ThemeModeNotifier? themeNotifier;
  const ConversationScreen({super.key, this.themeNotifier});

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen>
    with TickerProviderStateMixin {
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

  // ── Recording ──────────────────────────────────────────────────────────────
  final AudioRecorder _recorder = AudioRecorder();
  String? _recordedFilePath;
  bool _isRecording = false;
  Duration _recordDuration = Duration.zero;
  Timer? _recordTimer;

  // ── Playback ───────────────────────────────────────────────────────────────
  final AudioPlayer _audioPlayer = AudioPlayer();
  AudioPlayer? _probePlayer;
  String? _playingMsgId;
  Duration _playPosition = Duration.zero;
  Duration _playDuration = Duration.zero;
  StreamSubscription? _positionSub;
  StreamSubscription? _durationSub;
  StreamSubscription? _completeSub;

  final Map<String, Duration> _probedDurations = {};
  final Map<String, Future<Duration>> _probeInFlight = {};

  // ── Agora ──────────────────────────────────────────────────────────────────
  RtcEngine? _agoraEngine;
  bool _inCall = false;
  bool _callIsVideo = false;
  int? _remoteUid;
  bool _micMuted = false;
  bool _camOff = false;
  bool _remoteJoined = false;
  DateTime? _callStartTime;
  String? _callConversationId;

  // ── Download tracking ─────────────────────────────────────────────────────
  final Map<String, double> _downloadProgress = {};

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      if (_focusNode.hasFocus && _showEmoji) {
        setState(() => _showEmoji = false);
      }
    });
    _setupAudioPlayerListeners();
  }

  void _setupAudioPlayerListeners() {
    _positionSub = _audioPlayer.onPositionChanged.listen((pos) {
      if (mounted) setState(() => _playPosition = pos);
    });
    _durationSub = _audioPlayer.onDurationChanged.listen((dur) {
      if (mounted) {
        setState(() => _playDuration = dur);
        if (_playingMsgId != null) {
          _probedDurations['__playing__$_playingMsgId'] = dur;
        }
      }
    });
    _completeSub = _audioPlayer.onPlayerComplete.listen((_) {
      if (mounted) {
        setState(() {
          _playingMsgId = null;
          _playPosition = Duration.zero;
        });
      }
    });
  }

  Future<Duration> _probeDuration(String url) async {
    if (_probedDurations.containsKey(url)) return _probedDurations[url]!;
    if (_probeInFlight.containsKey(url)) return _probeInFlight[url]!;

    final future = _doProbeDuration(url);
    _probeInFlight[url] = future;
    final dur = await future;
    _probeInFlight.remove(url);
    if (mounted) setState(() => _probedDurations[url] = dur);
    return dur;
  }

  Future<Duration> _doProbeDuration(String url) async {
    final probe = AudioPlayer();
    try {
      await probe.setVolume(0);
      final completer = Completer<Duration>();
      late StreamSubscription sub;
      sub = probe.onDurationChanged.listen((dur) {
        if (!completer.isCompleted && dur > Duration.zero) {
          completer.complete(dur);
          sub.cancel();
        }
      });
      final Future<Duration> timeout = Future.delayed(
        const Duration(seconds: 8),
        () => Duration.zero,
      );

      if (!kIsWeb && url.startsWith('/')) {
        await probe.setSource(DeviceFileSource(url));
      } else {
        await probe.setSource(UrlSource(url));
      }

      final Duration dur = await Future.any([completer.future, timeout]);
      sub.cancel();
      await probe.dispose();
      return dur;
    } catch (_) {
      await probe.dispose();
      return Duration.zero;
    }
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
    _positionSub?.cancel();
    _durationSub?.cancel();
    _completeSub?.cancel();
    _audioPlayer.dispose();
    _probePlayer?.dispose();
    _agoraEngine?.leaveChannel();
    _agoraEngine?.release();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
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

  // ── Upload helpers ─────────────────────────────────────────────────────────
  bool _validateFileSize(int sizeBytes) {
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
    if (!_validateFileSize(size)) return;
    setState(() => _uploadingFile = true);
    try {
      final mime = lookupMimeType(path);
      final success = await context
          .read<ChatProvider>()
          .sendFile(path, name, mimeType: mime);
      if (success) _scrollToBottom();
    } catch (e) {
      if (mounted) {
        _showSnack(context, e.toString().replaceFirst('Exception: ', ''),
            isError: true);
      }
    } finally {
      if (mounted) setState(() => _uploadingFile = false);
    }
  }

  Future<void> _uploadBytes(Uint8List bytes, String name) async {
    if (!_validateFileSize(bytes.length)) return;
    setState(() => _uploadingFile = true);
    try {
      final mime = lookupMimeType(name);
      final success = await context
          .read<ChatProvider>()
          .sendFileBytes(bytes, name, mimeType: mime);
      if (success) _scrollToBottom();
    } catch (e) {
      if (mounted) {
        _showSnack(context, e.toString().replaceFirst('Exception: ', ''),
            isError: true);
      }
    } finally {
      if (mounted) setState(() => _uploadingFile = false);
    }
  }

  // ── Permission helper ──────────────────────────────────────────────────────
  Future<bool> _requestPermission(Permission permission, String label) async {
    if (kIsWeb) return true;
    var status = await permission.status;
    if (status.isGranted) return true;
    status = await permission.request();
    if (status.isGranted) return true;
    if (status.isPermanentlyDenied && mounted) {
      _showSnack(context, '$label permission is disabled. Enable it in Settings.',
          isError: true);
      openAppSettings();
    }
    return false;
  }

  // ── Pickers ────────────────────────────────────────────────────────────────
  Future<void> _pickAndSendFile() async {
    setState(() => _showAttach = false);
    if (!kIsWeb && Platform.isAndroid) {
      if (!await _requestPermission(Permission.storage, 'Storage')) return;
    }
    FilePickerResult? result;
    try {
      result = await FilePicker.platform.pickFiles(
          type: FileType.any,
          allowMultiple: false,
          withData: kIsWeb,
          withReadStream: false);
    } catch (e) {
      if (mounted) _showSnack(context, 'Could not open file picker: $e', isError: true);
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
      if (path == null || path.isEmpty || !File(path).existsSync()) {
        if (mounted) _showSnack(context, 'File not found.', isError: true);
        return;
      }
      await _uploadFile(path, file.name);
    }
  }

  Future<void> _takePhotoAndSend() async {
    setState(() => _showAttach = false);
    if (kIsWeb) {
      FilePickerResult? result;
      try {
        result = await FilePicker.platform
            .pickFiles(type: FileType.image, allowMultiple: false, withData: true);
      } catch (e) {
        if (mounted) _showSnack(context, 'Could not open picker: $e', isError: true);
        return;
      }
      if (result == null || result.files.isEmpty) return;
      final bytes = result.files.first.bytes;
      if (bytes == null) return;
      await _uploadBytes(bytes, 'photo_${DateTime.now().millisecondsSinceEpoch}.jpg');
      return;
    }
    if (!await _requestPermission(Permission.camera, 'Camera')) return;
    XFile? photo;
    try {
      photo = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 85);
    } catch (e) {
      if (mounted) _showSnack(context, 'Camera error: $e', isError: true);
      return;
    }
    if (photo == null) return;
    await _uploadFile(photo.path, 'photo_${DateTime.now().millisecondsSinceEpoch}.jpg');
  }

  Future<void> _pickImageAndSend() async {
    setState(() => _showAttach = false);
    if (!kIsWeb) {
      if (Platform.isAndroid) {
        bool granted = await _requestPermission(Permission.photos, 'Photo library');
        if (!granted) granted = await _requestPermission(Permission.storage, 'Storage');
        if (!granted) return;
      } else if (Platform.isIOS) {
        if (!await _requestPermission(Permission.photos, 'Photo library')) return;
      }
    }
    if (kIsWeb) {
      FilePickerResult? result;
      try {
        result = await FilePicker.platform
            .pickFiles(type: FileType.image, allowMultiple: false, withData: true);
      } catch (e) {
        if (mounted) _showSnack(context, 'Gallery error: $e', isError: true);
        return;
      }
      if (result == null || result.files.isEmpty) return;
      final file = result.files.first;
      final bytes = file.bytes;
      if (bytes == null) return;
      await _uploadBytes(bytes,
          'image_${DateTime.now().millisecondsSinceEpoch}.${file.extension ?? 'jpg'}');
      return;
    }
    XFile? photo;
    try {
      photo = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    } catch (e) {
      if (mounted) _showSnack(context, 'Gallery error: $e', isError: true);
      return;
    }
    if (photo == null) return;
    await _uploadFile(photo.path, 'image_${DateTime.now().millisecondsSinceEpoch}.jpg');
  }

  Future<void> _pickAndSendAudio() async {
    setState(() => _showAttach = false);
    if (!kIsWeb && Platform.isAndroid) {
      bool granted = await _requestPermission(Permission.audio, 'Audio');
      if (!granted) granted = await _requestPermission(Permission.storage, 'Storage');
      if (!granted) return;
    }
    FilePickerResult? result;
    try {
      result = await FilePicker.platform.pickFiles(
          type: FileType.audio, allowMultiple: false, withData: kIsWeb);
    } catch (e) {
      if (mounted) _showSnack(context, 'Could not open audio picker: $e', isError: true);
      return;
    }
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (kIsWeb) {
      final bytes = file.bytes;
      if (bytes == null) return;
      await _uploadBytes(bytes, file.name);
    } else {
      final path = file.path;
      if (path == null || !File(path).existsSync()) return;
      await _uploadFile(path, file.name);
    }
  }

  // ── Voice recording ────────────────────────────────────────────────────────
  Future<void> _startRecording() async {
    if (_isRecording) return;
    if (!await _requestPermission(Permission.microphone, 'Microphone')) return;
    if (!await _recorder.hasPermission()) {
      if (mounted) _showSnack(context, 'Microphone permission denied.', isError: true);
      return;
    }
    try {
      final tempDir = await getTemporaryDirectory();
      final ext = kIsWeb ? 'webm' : 'm4a';
      final outputPath =
          '${tempDir.path}/voicenote_${DateTime.now().millisecondsSinceEpoch}.$ext';
      _recordedFilePath = outputPath;

      final config = kIsWeb
          ? const RecordConfig(encoder: AudioEncoder.opus)
          : const RecordConfig(encoder: AudioEncoder.aacLc);

      await _recorder.start(config, path: outputPath);
      _recordTimer?.cancel();
      setState(() {
        _isRecording = true;
        _recordDuration = Duration.zero;
      });
      _recordTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (mounted) setState(() => _recordDuration = Duration(seconds: timer.tick));
      });
    } catch (e) {
      if (mounted) _showSnack(context, 'Could not start recording: $e', isError: true);
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

    String? stoppedPath;
    try {
      stoppedPath = await _recorder.stop();
    } catch (e) {
      if (mounted) _showSnack(context, 'Failed to stop recording: $e', isError: true);
      _recordedFilePath = null;
      return;
    }

    final finalPath = stoppedPath ?? recordedPath;
    if (finalPath == null) {
      if (mounted) _showSnack(context, 'Recording path is null.', isError: true);
      return;
    }

    if (kIsWeb) {
      try {
        final jsResponse = await html.window.fetch(finalPath);
        final jsBlob = await jsResponse.blob();
        final jsArrayBuffer = await jsBlob.arrayBuffer();
        final bytes = Uint8List.view(jsArrayBuffer.toDart.buffer);
        final fileName = 'voicenote_${DateTime.now().millisecondsSinceEpoch}.webm';
        await _uploadBytes(bytes, fileName);
      } catch (e) {
        if (mounted) {
          _showSnack(context, 'Failed to send voice note: $e', isError: true);
        }
      }
    } else {
      final file = File(finalPath);
      if (!await file.exists()) {
        if (mounted) _showSnack(context, 'Recording failed to save.', isError: true);
        _recordedFilePath = null;
        return;
      }
      await _uploadFile(file.path, file.path.split('/').last);
    }

    _recordedFilePath = null;
  }

  Future<void> _cancelRecording() async {
    if (!_isRecording) return;
    _recordTimer?.cancel();
    try {
      await _recorder.cancel();
    } catch (_) {}
    if (_recordedFilePath != null) {
      if (!kIsWeb) {
        final f = File(_recordedFilePath!);
        if (await f.exists()) await f.delete().catchError((_) {});
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

  // ── Voice note playback ────────────────────────────────────────────────────
  Future<void> _togglePlayVoiceNote(String msgId, String rawUrl) async {
    if (_playingMsgId == msgId) {
      await _audioPlayer.stop();
      setState(() {
        _playingMsgId = null;
        _playPosition = Duration.zero;
      });
      return;
    }

    await _audioPlayer.stop();
    setState(() {
      _playingMsgId = msgId;
      _playPosition = Duration.zero;
      _playDuration = Duration.zero;
    });

    final url = _resolveUrl(rawUrl);
    try {
      final isLocal = !kIsWeb && url.startsWith('/');
      if (isLocal) {
        await _audioPlayer.play(DeviceFileSource(url));
      } else {
        await _audioPlayer.play(UrlSource(url));
      }
    } on Exception catch (e) {
      if (!mounted) return;
      final msg = e.toString();
      setState(() => _playingMsgId = null);
      if (msg.contains('WebAudioError') ||
          msg.contains('Format error') ||
          msg.contains('MEDIA_ELEMENT_ERROR')) {
        _showSnack(
          context,
          kIsWeb
              ? 'Your browser cannot play this audio format. Try Chrome or download the file.'
              : 'Could not play voice note.',
          isError: true,
        );
      } else {
        _showSnack(context, 'Could not play voice note: $e', isError: true);
      }
    }
  }

  // ── File download & open ───────────────────────────────────────────────────
  Future<void> _downloadAndOpenFile(MessageModel msg) async {
    final rawUrl = msg.anyFile;
    if (rawUrl == null || rawUrl.isEmpty) return;
    final url = _resolveUrl(rawUrl);

    if (!kIsWeb && rawUrl.startsWith('/') && File(rawUrl).existsSync()) {
      await OpenFilex.open(rawUrl);
      return;
    }

    if (kIsWeb) {
      _showSnack(context, 'Download not supported on web yet');
      return;
    }

    try {
      final dir = await getTemporaryDirectory();
      final name = msg.fileName.isNotEmpty
          ? msg.fileName
          : url.split('/').last.split('?').first;
      final savePath = '${dir.path}/$name';

      setState(() => _downloadProgress[msg.id] = 0);

      final dio = Dio();
      await dio.download(
        url,
        savePath,
        onReceiveProgress: (received, total) {
          if (total > 0 && mounted) {
            setState(() => _downloadProgress[msg.id] = received / total);
          }
        },
      );

      setState(() => _downloadProgress.remove(msg.id));
      await OpenFilex.open(savePath);
    } catch (e) {
      setState(() => _downloadProgress.remove(msg.id));
      if (mounted) _showSnack(context, 'Could not open file: $e', isError: true);
    }
  }

  // ── Full-screen image viewer ───────────────────────────────────────────────
  void _openImageViewer(BuildContext context, String url) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.black87,
        pageBuilder: (_, __, ___) => _FullScreenImageViewer(url: url),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  // ── Agora calls ────────────────────────────────────────────────────────────
  Future<void> _startCall({required bool video}) async {
    if (_agoraAppId == 'YOUR_AGORA_APP_ID') {
      _showSnack(context, 'Agora App ID not configured', isError: true);
      return;
    }
    try {
      if (!await _requestPermission(Permission.microphone, 'Microphone')) return;
      if (video && !await _requestPermission(Permission.camera, 'Camera')) return;

      final engine = createAgoraRtcEngine();
      await engine.initialize(RtcEngineContext(appId: _agoraAppId));

      engine.registerEventHandler(RtcEngineEventHandler(
        onUserJoined: (conn, uid, elapsed) {
          if (mounted) setState(() {
            _remoteUid = uid;
            _remoteJoined = true;
          });
        },
        onUserOffline: (conn, uid, reason) {
          if (mounted) setState(() => _remoteUid = null);
        },
        onLeaveChannel: (conn, stats) {
          if (mounted) setState(() => _inCall = false);
        },
        onError: (err, msg) {
          if (mounted) {
            _showSnack(context, 'Call error: $msg', isError: true);
            _endCall();
          }
        },
      ));

      final channelId =
          context.read<ChatProvider>().activeConversation?.id ?? '';
      _callConversationId = channelId;
      _callStartTime = DateTime.now();

      setState(() {
        _agoraEngine = engine;
        _inCall = true;
        _callIsVideo = video;
        _remoteJoined = false;
      });

      if (video) {
        await engine.enableVideo().catchError((_) {});
        await engine.enableLocalVideo(true).catchError((_) {});
        await engine.startPreview().catchError((_) {});
      }

      if (channelId.isNotEmpty) {
        await engine
            .joinChannel(
              token: '',
              channelId: channelId,
              uid: 0,
              options: const ChannelMediaOptions(),
            )
            .catchError((_) {});
      }

      if (!video) {
        await engine.enableLocalAudio(true).catchError((_) {});
      }
    } catch (e) {
      if (mounted) {
        setState(() => _inCall = false);
        _showSnack(context, 'Could not start call: $e', isError: true);
      }
    }
  }

  Future<void> _endCall() async {
    if (!_inCall) return;
    final started = _callStartTime;
    final duration = started != null ? DateTime.now().difference(started) : null;
    final durText = duration != null ? _formatDuration(duration) : null;
    final summary = _remoteJoined
        ? (_callIsVideo
            ? 'Video call ended${durText != null ? ' ($durText)' : ''}'
            : 'Voice call ended${durText != null ? ' ($durText)' : ''}')
        : (_callIsVideo ? 'Missed video call' : 'Missed voice call');
    final savedConvId = _callConversationId;

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

    if (_agoraEngine != null) {
      await _agoraEngine!.stopPreview().catchError((_) {});
      await _agoraEngine!.leaveChannel().catchError((_) {});
      await _agoraEngine!.release().catchError((_) {});
      if (mounted) setState(() => _agoraEngine = null);
    }

    try {
      final chat = context.read<ChatProvider>();
      final targetId = savedConvId ?? chat.activeConversation?.id;
      if (targetId == null) return;
      if (chat.activeConversation?.id == targetId) {
        await chat.sendTextMessage(summary);
      } else {
        await MessageApi.sendMessage(
            targetId, FormData.fromMap({'text': summary}));
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

  void _switchCamera() {
    if (!_inCall || !_callIsVideo) return;
    _agoraEngine?.switchCamera();
  }

  // ── UI Helpers ─────────────────────────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════════
  //  BUILD
  // ═══════════════════════════════════════════════════════════════════════════
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

    WidgetsBinding.instance.addPostFrameCallback((_) {
      for (final msg in messages) {
        final anyFile = msg.anyFile;
        if (anyFile == null || anyFile.isEmpty) continue;
        final name = msg.fileName.isNotEmpty
            ? msg.fileName
            : anyFile.split('/').last.split('?').first;
        final isVoice = (msg.audio != null && msg.audio!.isNotEmpty) ||
            msg.fileType.toLowerCase().contains('audio') ||
            _isVoiceFile(name);
        if (!isVoice) continue;
        final url = _resolveUrl(anyFile);
        if (url.isEmpty) continue;
        if (!_probedDurations.containsKey(url) &&
            !_probeInFlight.containsKey(url)) {
          _probeDuration(url);
        }
      }
    });

    if (_inCall) {
      return Scaffold(
        backgroundColor: const Color(0xFF0D1117),
        body: _buildCallOverlay(chat),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_showEmoji) { setState(() => _showEmoji = false); return; }
        if (_showAttach) { setState(() => _showAttach = false); return; }
        if (_searchMode) { _toggleSearch(); return; }
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
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: const Row(children: [
                  SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white)),
                  SizedBox(width: 12),
                  Text('Sending file…',
                      style: TextStyle(color: Colors.white, fontSize: 13)),
                ]),
              ),

            if (_searchMode)
              Container(
                color: _appBarBg,
                padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(999)),
                  child: TextField(
                    controller: _searchCtrl,
                    autofocus: true,
                    cursorColor: Colors.black,
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(color: Colors.black, fontSize: 14),
                    decoration: const InputDecoration(
                      hintText: 'Search messages...',
                      hintStyle: TextStyle(color: Colors.black45),
                      prefixIcon: Icon(Icons.search, color: Colors.black45, size: 18),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ),

            Expanded(
              child: chat.loadingMessages
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.primary))
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
                                  padding:
                                      const EdgeInsets.only(left: 8, bottom: 4),
                                  child: Text(chat.typingUser ?? '',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textMuted,
                                          fontStyle: FontStyle.italic)),
                                );
                              }
                              final msg = messages[i];
                              final voiceUrl = _resolveUrl(msg.anyFile);
                              final probedDur =
                                  _probedDurations[voiceUrl] ?? Duration.zero;
                              return _MessageBubble(
                                msg: msg,
                                myId: myId,
                                isDark: _isDark,
                                bubbleIncoming: _bubbleIncoming,
                                playingMsgId: _playingMsgId,
                                playPosition: _playPosition,
                                playDuration: _playDuration,
                                probedDuration: probedDur,
                                downloadProgress:
                                    _downloadProgress[msg.id],
                                onLongPress: (m) =>
                                    _showMsgMenu(context, m, myId),
                                onMenuTap: (m) =>
                                    _showMsgMenu(context, m, myId),
                                onReply: (m) =>
                                    setState(() => _replyTo = m),
                                onPlayVoice: _togglePlayVoiceNote,
                                onOpenFile: _downloadAndOpenFile,
                                onTapImage: (url) =>
                                    _openImageViewer(context, url),
                              );
                            },
                          ),
                        ),
            ),

            if (_showAttach)
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
                        onTap: _pickAndSendFile),
                    _AttachBtn(
                        icon: Icons.photo_library,
                        label: 'Gallery',
                        color: Colors.green,
                        onTap: _pickImageAndSend),
                    _AttachBtn(
                        icon: Icons.camera_alt,
                        label: 'Camera',
                        color: Colors.deepOrange,
                        onTap: _takePhotoAndSend),
                    _AttachBtn(
                        icon: Icons.audiotrack,
                        label: 'Audio',
                        color: Colors.orange,
                        onTap: _pickAndSendAudio),
                  ],
                ),
              ),

            if (_replyTo != null)
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
                    const Icon(Icons.reply, size: 16, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _replyTo!.text.isNotEmpty
                            ? _formatMessage(_replyTo!.text).substring(
                                0,
                                _formatMessage(_replyTo!.text)
                                    .length
                                    .clamp(0, 60))
                            : '📎 file',
                        style: TextStyle(
                            fontSize: 13,
                            color: _isDark
                                ? Colors.white54
                                : AppColors.textMuted),
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

            _buildInputBar(),

            if (_showEmoji)
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
                    emojiViewConfig: EmojiViewConfig(
                        backgroundColor: _inputBg, columns: 8),
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

  // ── AppBar ─────────────────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar(ConversationModel? conv, String myId) {
    String? otherPhotoUrl;
    if (conv != null && conv.type == 'direct') {
      for (final p in conv.participants) {
        final map = p as Map?;
        final pid = map?['_id']?.toString() ?? map?['id']?.toString() ?? '';
        if (pid != myId && pid.isNotEmpty) {
          otherPhotoUrl = _userPhotoUrl(map);
          break;
        }
      }
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
                  _MiniAvatar(
                    initial: conv.getInitial(myId),
                    photoUrl: conv.type == 'direct' ? otherPhotoUrl : null,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(conv.getDisplayName(myId),
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: Colors.white)),
                        if (conv.type == 'group')
                          Text('${conv.participants.length} members',
                              style: const TextStyle(
                                  fontSize: 11, color: Colors.white70)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
      actions: [
        if (conv?.type == 'direct') ...[
          IconButton(
            icon: const Icon(Icons.phone_outlined, color: Colors.white),
            tooltip: 'Voice Call',
            onPressed: () => _startCall(video: false),
          ),
          IconButton(
            icon: const Icon(Icons.videocam_outlined, color: Colors.white),
            tooltip: 'Video Call',
            onPressed: () => _startCall(video: true),
          ),
        ],
        IconButton(
          icon: Icon(_searchMode ? Icons.search_off : Icons.search,
              color: Colors.white),
          tooltip: 'Search messages',
          onPressed: _toggleSearch,
        ),
      ],
    );
  }

  // ── Input bar ──────────────────────────────────────────────────────────────
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
                    shape: BoxShape.circle),
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
                    Text(_formatDuration(_recordDuration),
                        style: TextStyle(
                            color: _textColor,
                            fontSize: 14,
                            fontWeight: FontWeight.w600)),
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
                            color: _isDark
                                ? Colors.white30
                                : AppColors.textLight,
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
            onTap: () => _showSnack(context, 'Hold to record a voice note'),
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

  // ── Call overlay ───────────────────────────────────────────────────────────
  Widget _buildCallOverlay(ChatProvider chat) {
    final convName = chat.activeConversation?.getDisplayName('') ?? 'Unknown';
    return Stack(
      children: [
        if (_callIsVideo && _remoteUid != null && _agoraEngine != null)
          Positioned.fill(
            child: AgoraVideoView(
              controller: VideoViewController.remote(
                rtcEngine: _agoraEngine!,
                canvas: VideoCanvas(uid: _remoteUid),
                connection: RtcConnection(
                    channelId: chat.activeConversation?.id ?? ''),
              ),
            ),
          ),
        if (_remoteUid == null || !_callIsVideo)
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF1A2B4A), Color(0xFF0D1117)],
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: AppColors.primary.withValues(alpha: 0.5),
                            width: 3),
                      ),
                      child: Center(
                        child: Text(
                          chat.activeConversation
                                  ?.getInitial(context
                                      .read<AuthProvider>()
                                      .user
                                      ?.id ?? '')
                                  .toUpperCase() ??
                              '?',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 40,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(convName,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Text(
                      _remoteJoined
                          ? (_callStartTime != null
                              ? _formatDuration(
                                  DateTime.now().difference(_callStartTime!))
                              : 'Connected')
                          : 'Calling…',
                      style:
                          const TextStyle(color: Colors.white60, fontSize: 15),
                    ),
                  ],
                ),
              ),
            ),
          ),
        if (_callIsVideo && _agoraEngine != null)
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            right: 16,
            child: Container(
              width: 90,
              height: 130,
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  color: Colors.black54,
                  border: Border.all(color: Colors.white30, width: 1.5)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: _camOff
                    ? const Center(
                        child: Icon(Icons.videocam_off,
                            color: Colors.white54, size: 28))
                    : AgoraVideoView(
                        controller: VideoViewController(
                          rtcEngine: _agoraEngine!,
                          canvas: const VideoCanvas(uid: 0),
                        ),
                      ),
              ),
            ),
          ),
        Positioned(
          top: 0, left: 0, right: 0,
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: _endCall,
                  ),
                  Expanded(
                    child: Text(
                      _callIsVideo ? 'Video Call' : 'Voice Call',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 0, left: 0, right: 0,
          child: SafeArea(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [Color(0xCC000000), Colors.transparent],
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _CallControlBtn(
                    icon: _micMuted ? Icons.mic_off : Icons.mic,
                    label: _micMuted ? 'Unmute' : 'Mute',
                    active: !_micMuted,
                    onTap: _toggleMic,
                  ),
                  GestureDetector(
                    onTap: _endCall,
                    child: Container(
                      width: 68,
                      height: 68,
                      decoration: const BoxDecoration(
                          color: Colors.red, shape: BoxShape.circle),
                      child: const Icon(Icons.call_end,
                          color: Colors.white, size: 30),
                    ),
                  ),
                  if (_callIsVideo)
                    _CallControlBtn(
                      icon: _camOff ? Icons.videocam_off : Icons.videocam,
                      label: _camOff ? 'Cam On' : 'Cam Off',
                      active: !_camOff,
                      onTap: _toggleCam,
                    )
                  else
                    _CallControlBtn(
                      icon: Icons.volume_up,
                      label: 'Speaker',
                      active: true,
                      onTap: () {},
                    ),
                ],
              ),
            ),
          ),
        ),
        if (_callIsVideo)
          Positioned(
            bottom: MediaQuery.of(context).size.height * 0.18,
            left: 24,
            child: _CallControlBtn(
              icon: Icons.flip_camera_ios,
              label: 'Flip',
              active: true,
              onTap: _switchCamera,
            ),
          ),
      ],
    );
  }

  // ── Message context menu ───────────────────────────────────────────────────
  void _showMsgMenu(BuildContext context, MessageModel msg, String myId) {
    final isMe = msg.senderId == myId;
    showModalBottomSheet(
      context: context,
      backgroundColor: _isDark ? const Color(0xFF1E2130) : Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                    color: Colors.grey[400],
                    borderRadius: BorderRadius.circular(2)),
              ),
              if (!msg.isDeleted)
                _MenuTile(
                  icon: Icons.reply_rounded,
                  label: 'Reply',
                  isDark: _isDark,
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _replyTo = msg);
                  },
                ),
              if (msg.text.isNotEmpty && !msg.isDeleted)
                _MenuTile(
                  icon: Icons.copy_rounded,
                  label: 'Copy',
                  isDark: _isDark,
                  onTap: () {
                    // Copy raw text (not formatted) so user gets real content
                    Clipboard.setData(ClipboardData(text: msg.text));
                    Navigator.pop(context);
                    _showSnack(context, 'Copied!');
                  },
                ),
              if (!msg.isDeleted &&
                  msg.anyFile != null &&
                  msg.anyFile!.isNotEmpty)
                _MenuTile(
                  icon: Icons.download_rounded,
                  label: 'Save',
                  isDark: _isDark,
                  onTap: () {
                    Navigator.pop(context);
                    _downloadAndOpenFile(msg);
                  },
                ),
              if (!msg.isDeleted && msg.text.isNotEmpty)
                _MenuTile(
                  icon: Icons.share_rounded,
                  label: 'Share',
                  isDark: _isDark,
                  onTap: () {
                    Navigator.pop(context);
                    Clipboard.setData(ClipboardData(text: msg.text));
                    _showSnack(context,
                        'Text copied — paste to share (add share_plus for native sharing)');
                  },
                ),
              if (!msg.isDeleted)
                _MenuTile(
                  icon: Icons.forward_rounded,
                  label: 'Forward',
                  isDark: _isDark,
                  onTap: () {
                    Navigator.pop(context);
                    _showForwardSheet(context, msg);
                  },
                ),
              if (isMe && msg.text.isNotEmpty && !msg.isDeleted)
                _MenuTile(
                  icon: Icons.edit_outlined,
                  label: 'Edit',
                  isDark: _isDark,
                  onTap: () {
                    Navigator.pop(context);
                    _showEditDialog(context, msg);
                  },
                ),
              if (isMe && !msg.isDeleted)
                _MenuTile(
                  icon: Icons.delete_outline_rounded,
                  label: 'Delete',
                  isDark: _isDark,
                  color: AppColors.danger,
                  onTap: () async {
                    Navigator.pop(context);
                    await context.read<ChatProvider>().deleteMessage(msg.id);
                  },
                ),
            ],
          ),
        ),
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
          style: TextStyle(
              color: _isDark ? Colors.white : AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: 'Edit your message…',
            hintStyle: TextStyle(
                color: _isDark ? Colors.white38 : AppColors.textLight),
            border:
                OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
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
                  style: TextStyle(color: AppColors.textMuted))),
          ElevatedButton(
            style:
                ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              final newText = editCtrl.text.trim();
              if (newText.isEmpty || newText == msg.text) {
                Navigator.pop(ctx);
                return;
              }
              Navigator.pop(ctx);
              await context
                  .read<ChatProvider>()
                  .editMessage(msg.id, newText);
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
      builder: (ctx) => DraggableScrollableSheet(
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
                    borderRadius: BorderRadius.circular(2))),
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
                    leading: _ProfileAvatar(
                      initial: conv.getInitial(myId),
                      photoUrl: conv.type == 'direct'
                          ? () {
                              for (final p in conv.participants) {
                                final map = p as Map?;
                                final pid = map?['_id']?.toString() ??
                                    map?['id']?.toString() ?? '';
                                if (pid != myId && pid.isNotEmpty) {
                                  return _userPhotoUrl(map);
                                }
                              }
                              return null;
                            }()
                          : null,
                      radius: 20,
                      bgColor: conv.type == 'group'
                          ? const Color(0xFF10B981)
                          : AppColors.primary,
                    ),
                    title: Text(conv.getDisplayName(myId),
                        style: TextStyle(
                            color:
                                _isDark ? Colors.white : AppColors.textPrimary)),
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
      ),
    );
  }

  void _showInfo(BuildContext context, ConversationModel conv, String myId) {
    final isDirect = conv.type == 'direct';
    Map? otherParticipant;
    if (isDirect) {
      for (final p in conv.participants) {
        final map = p as Map?;
        final pid =
            map?['_id']?.toString() ?? map?['id']?.toString() ?? '';
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
                      if (data is Map<String, dynamic>) fullUser = data;
                    } else {
                      fullUser = Map<String, dynamic>.from(
                          otherParticipant ?? {});
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
                  borderRadius: BorderRadius.circular(2))),
        ),
        Center(
          child: Column(children: [
            _ProfileAvatar(
              initial: conv.getInitial(myId),
              photoUrl: isDirect && otherUser != null
                  ? _userPhotoUrl(otherUser)
                  : null,
              radius: 44,
              bgColor: AppColors.primary,
              onTap: () {
                final url = isDirect && otherUser != null
                    ? _resolveUrl(_userPhotoUrl(otherUser))
                    : '';
                if (url.isNotEmpty) {
                  _openImageViewer(context, url);
                }
              },
            ),
            const SizedBox(height: 10),
            Text(conv.getDisplayName(myId),
                style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color:
                        _isDark ? Colors.white : AppColors.textPrimary)),
            if (conv.type == 'group')
              Text('${conv.participants.length} members',
                  style: const TextStyle(color: AppColors.textMuted)),
          ]),
        ),
        const SizedBox(height: 16),
        if (isDirect) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _InfoActionBtn(
                  icon: Icons.phone_outlined,
                  label: 'Voice Call',
                  color: AppColors.primary,
                  onTap: () {
                    Navigator.pop(context);
                    _startCall(video: false);
                  }),
              const SizedBox(width: 32),
              _InfoActionBtn(
                  icon: Icons.videocam_outlined,
                  label: 'Video Call',
                  color: AppColors.primary,
                  onTap: () {
                    Navigator.pop(context);
                    _startCall(video: true);
                  }),
              const SizedBox(width: 32),
              _InfoActionBtn(
                  icon: Icons.chat_outlined,
                  label: 'Message',
                  color: AppColors.accent,
                  onTap: () => Navigator.pop(context)),
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
              isDark: _isDark),
          _InfoTile(
              icon: Icons.email_outlined,
              label: 'Email',
              value: _firstNonEmpty(
                  [otherUser['email'], otherUser['emailAddress']]),
              isDark: _isDark),
          _InfoTile(
              icon: Icons.phone_outlined,
              label: 'Phone',
              value: _firstNonEmpty([
                otherUser['phone'],
                otherUser['phoneNumber'],
                otherUser['mobile']
              ]),
              isDark: _isDark),
          _InfoTile(
              icon: Icons.apartment_outlined,
              label: 'Department',
              value: _firstNonEmpty([
                otherUser['department'],
                otherUser['dept'],
                otherUser['division']
              ]),
              isDark: _isDark),
          _InfoTile(
              icon: Icons.badge_outlined,
              label: 'Role',
              value: _firstNonEmpty([
                otherUser['role'],
                otherUser['position'],
                otherUser['jobTitle']
              ]),
              isDark: _isDark),
        ],
        if (isDirect && (otherUser == null || otherUser.isEmpty))
          Center(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text('User details not available.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: _isDark ? Colors.white38 : AppColors.textMuted,
                      fontSize: 13)),
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
            final photoUrl = _userPhotoUrl(map);
            return ListTile(
              leading: _ProfileAvatar(
                initial: name.isNotEmpty ? name[0] : '?',
                photoUrl: photoUrl,
                radius: 19,
                bgColor: AppColors.primary,
              ),
              title: Text(name,
                  style: TextStyle(
                      color:
                          _isDark ? Colors.white : AppColors.textPrimary)),
              subtitle: Text(
                  [role, dept, email]
                      .where((s) => s.isNotEmpty)
                      .join(' · '),
                  style: const TextStyle(
                      fontSize: 11, color: AppColors.textMuted)),
              contentPadding: EdgeInsets.zero,
            );
          }),
        ],
      ],
    );
  }

  String _firstNonEmpty(List<dynamic> values) {
    for (final v in values) {
      if (v != null && v.toString().trim().isNotEmpty) return v.toString().trim();
    }
    return 'N/A';
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  MENU TILE
// ═════════════════════════════════════════════════════════════════════════════
class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isDark;
  final Color? color;
  final VoidCallback onTap;

  const _MenuTile({
    required this.icon,
    required this.label,
    required this.isDark,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ??
        (isDark ? Colors.white70 : AppColors.textPrimary);
    return ListTile(
      dense: true,
      leading: Icon(icon, color: effectiveColor, size: 22),
      title: Text(label,
          style: TextStyle(
              color: effectiveColor,
              fontSize: 15,
              fontWeight: FontWeight.w500)),
      onTap: onTap,
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  MESSAGE BUBBLE
// ═════════════════════════════════════════════════════════════════════════════
class _MessageBubble extends StatelessWidget {
  final MessageModel msg;
  final String myId;
  final bool isDark;
  final Color bubbleIncoming;
  final String? playingMsgId;
  final Duration playPosition;
  final Duration playDuration;
  final Duration probedDuration;
  final double? downloadProgress;
  final void Function(MessageModel) onLongPress;
  final void Function(MessageModel) onMenuTap;
  final void Function(MessageModel) onReply;
  final Future<void> Function(String msgId, String fileUrl) onPlayVoice;
  final Future<void> Function(MessageModel) onOpenFile;
  final void Function(String url) onTapImage;

  const _MessageBubble({
    required this.msg,
    required this.myId,
    required this.isDark,
    required this.bubbleIncoming,
    required this.onLongPress,
    required this.onMenuTap,
    required this.onReply,
    required this.onPlayVoice,
    required this.onOpenFile,
    required this.onTapImage,
    this.playingMsgId,
    this.playPosition = Duration.zero,
    this.playDuration = Duration.zero,
    this.probedDuration = Duration.zero,
    this.downloadProgress,
  });

  String get _effectiveFileName {
    if (msg.fileName.isNotEmpty) return msg.fileName;
    final url = msg.anyFile ?? '';
    return url.split('/').last.split('?').first;
  }

  bool get _isVoice {
    if (msg.audio != null && msg.audio!.isNotEmpty) return true;
    if (msg.fileType.toLowerCase().contains('audio')) return true;
    return _isVoiceFile(_effectiveFileName);
  }

  bool get _isImage {
    if (msg.media != null && msg.media!.isNotEmpty) return true;
    if (msg.fileType.toLowerCase().contains('image')) return true;
    return _isImageFile(_effectiveFileName);
  }

  bool get _hasFile => msg.anyFile != null && msg.anyFile!.isNotEmpty;

  String get _resolvedFileUrl => _resolveUrl(msg.anyFile);

  @override
  Widget build(BuildContext context) {
    final isMe = msg.senderId == myId;
    final time = msg.createdAt != null
        ? '${msg.createdAt!.hour.toString().padLeft(2, '0')}:${msg.createdAt!.minute.toString().padLeft(2, '0')}'
        : '';
    final isPlaying = playingMsgId == msg.id;

    final displayDuration =
        isPlaying && playDuration > Duration.zero ? playDuration : probedDuration;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            _ProfileAvatar(
              initial: msg.senderName.isNotEmpty ? msg.senderName[0] : '?',
              photoUrl: msg.senderAvatar,
              radius: 14,
              bgColor: const Color(0xFFCBD5F5),
              textColor: AppColors.textPrimary,
            ),
            const SizedBox(width: 6),
          ],
          GestureDetector(
            onLongPress: () => onLongPress(msg),
            onDoubleTap: () => onReply(msg),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                ConstrainedBox(
                  constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.68),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    margin: const EdgeInsets.only(right: 4),
                    decoration: BoxDecoration(
                      color: isMe
                          ? AppColors.bubbleOutgoing
                          : bubbleIncoming,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isMe ? 16 : 2),
                        bottomRight: Radius.circular(isMe ? 2 : 16),
                      ),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.06),
                            blurRadius: 4,
                            offset: const Offset(0, 2))
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: isMe
                          ? CrossAxisAlignment.end
                          : CrossAxisAlignment.start,
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
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: const Border(
                                  left: BorderSide(
                                      color: Colors.white70, width: 3)),
                            ),
                            child: Text(
                              // ── FIXED: format reply preview too ──
                              msg.replyTo is Map
                                  ? _formatMessage(msg.replyTo['text']) ?? '📎 file'
                                  : '📎',
                              style: TextStyle(
                                  fontSize: 11,
                                  color: isMe
                                      ? Colors.white70
                                      : AppColors.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),

                        // ── Content ──────────────────────────────────────────
                        if (msg.isDeleted)
                          Text('This message was deleted',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontStyle: FontStyle.italic,
                                  color: isMe
                                      ? Colors.white70
                                      : AppColors.textMuted))
                        else if (_hasFile && _isVoice)
                          _VoiceNoteBubble(
                            isMe: isMe,
                            isPlaying: isPlaying,
                            position: isPlaying ? playPosition : Duration.zero,
                            duration: displayDuration,
                            onTap: () => onPlayVoice(msg.id, msg.anyFile!),
                          )
                        else if (_hasFile && _isImage)
                          _ImageBubble(
                            fileUrl: _resolvedFileUrl,
                            fileName: _effectiveFileName,
                            isMe: isMe,
                            onTap: () => onTapImage(_resolvedFileUrl),
                          )
                        else if (_hasFile)
                          _FileCard(
                            fileName: _effectiveFileName,
                            isMe: isMe,
                            downloadProgress: downloadProgress,
                            onTap: () => onOpenFile(msg),
                          )
                        else if (msg.text.isNotEmpty)
                          Column(
                            crossAxisAlignment: isMe
                                ? CrossAxisAlignment.end
                                : CrossAxisAlignment.start,
                            children: [
                              // ── FIXED: was msg.text (raw JSON) ──
                              Text(
                                _formatMessage(msg.text),
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
                        else
                          Text('📎 Attachment',
                              style: TextStyle(
                                  color: isMe
                                      ? Colors.white70
                                      : AppColors.textMuted)),

                        const SizedBox(height: 4),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(time,
                                style: TextStyle(
                                    fontSize: 10,
                                    color: isMe
                                        ? Colors.white60
                                        : AppColors.textLight)),
                            if (isMe) ...[
                              const SizedBox(width: 3),
                              const Icon(Icons.done_all,
                                  size: 13, color: Colors.white60),
                            ]
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // ── Three-dot menu button ──────────────────────────────────
                Positioned(
                  top: 0,
                  right: isMe ? null : null,
                  child: GestureDetector(
                    onTap: () => onMenuTap(msg),
                    child: Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: (isMe
                                ? AppColors.bubbleOutgoing
                                : bubbleIncoming)
                            .withValues(alpha: 0.85),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.more_vert,
                        size: 14,
                        color: isMe
                            ? Colors.white70
                            : (isDark ? Colors.white54 : AppColors.textMuted),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  VOICE NOTE BUBBLE
// ═════════════════════════════════════════════════════════════════════════════
class _VoiceNoteBubble extends StatelessWidget {
  final bool isMe;
  final bool isPlaying;
  final Duration position;
  final Duration duration;
  final VoidCallback onTap;

  const _VoiceNoteBubble({
    required this.isMe,
    required this.isPlaying,
    required this.position,
    required this.duration,
    required this.onTap,
  });

  String _fmt(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final iconColor = isMe ? Colors.white : AppColors.primary;
    final barColor = isMe
        ? Colors.white.withValues(alpha: isPlaying ? 1.0 : 0.7)
        : AppColors.primary.withValues(alpha: isPlaying ? 1.0 : 0.55);
    final progress = duration.inMilliseconds > 0
        ? (position.inMilliseconds / duration.inMilliseconds).clamp(0.0, 1.0)
        : 0.0;

    final durLabel = duration.inSeconds > 0 ? _fmt(duration) : '—:——';
    final timeLabel = isPlaying && duration.inSeconds > 0
        ? '${_fmt(position)} / $durLabel'
        : durLabel;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 200,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: isMe
                        ? Colors.white24
                        : AppColors.primary.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                      isPlaying ? Icons.pause : Icons.play_arrow,
                      color: iconColor,
                      size: 22),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(22, (i) {
                      const heights = [
                        10.0, 16.0, 8.0, 20.0, 12.0, 18.0, 6.0,
                        22.0, 14.0, 10.0, 18.0, 8.0, 20.0, 12.0,
                        16.0, 6.0, 14.0, 20.0, 10.0, 18.0, 8.0, 12.0
                      ];
                      final filled =
                          progress > 0 && (i / 22) <= progress;
                      return Container(
                        width: 2.5,
                        height: heights[i % heights.length],
                        decoration: BoxDecoration(
                          color: filled ? iconColor : barColor,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.only(left: 46),
              child: Text(
                timeLabel,
                style: TextStyle(
                    fontSize: 10,
                    color: isMe ? Colors.white60 : AppColors.textLight),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  IMAGE BUBBLE
// ═════════════════════════════════════════════════════════════════════════════
class _ImageBubble extends StatelessWidget {
  final String fileUrl;
  final String fileName;
  final bool isMe;
  final VoidCallback onTap;

  const _ImageBubble({
    required this.fileUrl,
    required this.fileName,
    required this.isMe,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isLocal = !kIsWeb && fileUrl.startsWith('/');
    Widget img;
    if (isLocal) {
      img = Image.file(File(fileUrl),
          width: 200,
          height: 200,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) =>
              _FileCard(fileName: fileName, isMe: isMe, onTap: () {}));
    } else {
      img = Image.network(
        fileUrl,
        width: 200,
        height: 200,
        fit: BoxFit.cover,
        loadingBuilder: (_, child, prog) => prog == null
            ? child
            : SizedBox(
                width: 200,
                height: 200,
                child: Center(
                  child: CircularProgressIndicator(
                    value: prog.expectedTotalBytes != null
                        ? prog.cumulativeBytesLoaded /
                            prog.expectedTotalBytes!
                        : null,
                    color: AppColors.primary,
                    strokeWidth: 2,
                  ),
                ),
              ),
        errorBuilder: (_, __, ___) =>
            _FileCard(fileName: fileName, isMe: isMe, onTap: () {}),
      );
    }

    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Stack(
          children: [
            img,
            Positioned(
              bottom: 6,
              right: 6,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                    color: Colors.black45,
                    borderRadius: BorderRadius.circular(4)),
                child: const Icon(Icons.fullscreen,
                    size: 14, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  FILE CARD
// ═════════════════════════════════════════════════════════════════════════════
class _FileCard extends StatelessWidget {
  final String fileName;
  final bool isMe;
  final double? downloadProgress;
  final VoidCallback onTap;

  const _FileCard({
    required this.fileName,
    required this.isMe,
    required this.onTap,
    this.downloadProgress,
  });

  Color get _iconColor {
    final ext = fileName.split('.').last.toLowerCase();
    if (ext == 'pdf') return const Color(0xFFE53935);
    if (ext == 'doc' || ext == 'docx') return const Color(0xFF2B579A);
    if (ext == 'xls' || ext == 'xlsx') return const Color(0xFF217346);
    if (ext == 'ppt' || ext == 'pptx') return const Color(0xFFD24726);
    if (ext == 'zip' || ext == 'rar') return const Color(0xFF795548);
    if (_isAudioFile(fileName)) return const Color(0xFF9C27B0);
    return const Color(0xFF6B7280);
  }

  String get _label {
    final ext = fileName.split('.').last.toUpperCase();
    return ext.length > 4 ? ext.substring(0, 4) : ext;
  }

  @override
  Widget build(BuildContext context) {
    final isDownloading =
        downloadProgress != null && downloadProgress! < 1.0;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                  color: _iconColor,
                  borderRadius: BorderRadius.circular(8)),
              child: Center(
                child: isDownloading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          value: downloadProgress,
                          strokeWidth: 2,
                          color: Colors.white,
                        ))
                    : Text(_label,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold)),
              )),
          const SizedBox(width: 10),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  fileName.isNotEmpty ? fileName : 'file',
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: isMe ? Colors.white : AppColors.textPrimary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (isDownloading)
                  Text('${(downloadProgress! * 100).toInt()}%',
                      style: TextStyle(
                          fontSize: 11,
                          color: isMe ? Colors.white60 : AppColors.textMuted))
                else
                  Text('Tap to open',
                      style: TextStyle(
                          fontSize: 11,
                          color: isMe ? Colors.white60 : AppColors.textMuted)),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Icon(isDownloading ? Icons.downloading : Icons.download,
              size: 18,
              color: isMe ? Colors.white70 : AppColors.textMuted),
        ]),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  FULL SCREEN IMAGE VIEWER
// ═════════════════════════════════════════════════════════════════════════════
class _FullScreenImageViewer extends StatelessWidget {
  final String url;
  const _FullScreenImageViewer({required this.url});

  @override
  Widget build(BuildContext context) {
    final isLocal = !kIsWeb && url.startsWith('/');
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: GestureDetector(
        onTap: () => Navigator.of(context).pop(),
        child: Container(
          color: Colors.black87,
          width: double.infinity,
          height: double.infinity,
          child: Stack(
            children: [
              Center(
                child: InteractiveViewer(
                  minScale: 0.5,
                  maxScale: 4.0,
                  child: isLocal
                      ? Image.file(File(url))
                      : Image.network(url,
                          loadingBuilder: (_, child, prog) => prog == null
                              ? child
                              : const Center(
                                  child: CircularProgressIndicator(
                                      color: Colors.white))),
                ),
              ),
              Positioned(
                top: MediaQuery.of(context).padding.top + 8,
                right: 12,
                child: GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(50)),
                    child: const Icon(Icons.close,
                        color: Colors.white, size: 22),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  CALL CONTROL BUTTON
// ═════════════════════════════════════════════════════════════════════════════
class _CallControlBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _CallControlBtn({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: active
                  ? Colors.white.withValues(alpha: 0.15)
                  : Colors.red.withValues(alpha: 0.8),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(height: 6),
          Text(label,
              style:
                  const TextStyle(color: Colors.white60, fontSize: 11)),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  SMALL HELPER WIDGETS
// ═════════════════════════════════════════════════════════════════════════════
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
              const BoxDecoration(color: Colors.red, shape: BoxShape.circle)),
    );
  }
}

class _MiniAvatar extends StatelessWidget {
  final String initial;
  final String? photoUrl;
  const _MiniAvatar({required this.initial, this.photoUrl});

  @override
  Widget build(BuildContext context) {
    final resolved = _resolveUrl(photoUrl);
    if (resolved.isNotEmpty) {
      return SizedBox(
        width: 36,
        height: 36,
        child: ClipOval(
          child: Image.network(
            resolved,
            width: 36,
            height: 36,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _fallback(),
          ),
        ),
      );
    }
    return _fallback();
  }

  Widget _fallback() => Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.25),
            shape: BoxShape.circle),
        child: Center(
            child: Text(initial,
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 15))),
      );
}

class _AttachBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _AttachBtn(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(children: [
        Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 24)),
        const SizedBox(height: 6),
        Text(label,
            style: const TextStyle(
                fontSize: 11, color: AppColors.textMuted)),
      ]),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isDark;

  const _InfoTile(
      {required this.icon,
      required this.label,
      required this.value,
      required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF252837) : AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: isDark ? Colors.white10 : AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon,
              size: 20,
              color: isDark ? Colors.white38 : AppColors.textMuted),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 11,
                        color: isDark
                            ? Colors.white38
                            : AppColors.textLight,
                        letterSpacing: 0.3)),
                const SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: isDark
                            ? Colors.white
                            : AppColors.textPrimary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _InfoActionBtn(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 6),
        Text(label,
            style: const TextStyle(
                fontSize: 11, color: AppColors.textMuted)),
      ]),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE AVATAR
// ═════════════════════════════════════════════════════════════════════════════
class _ProfileAvatar extends StatelessWidget {
  final String? photoUrl;
  final String initial;
  final double radius;
  final Color bgColor;
  final Color textColor;
  final VoidCallback? onTap;

  const _ProfileAvatar({
    required this.initial,
    this.photoUrl,
    this.radius = 20,
    this.bgColor = AppColors.primary,
    this.textColor = Colors.white,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final resolvedUrl = _resolveUrl(photoUrl);
    final hasPhoto = resolvedUrl.isNotEmpty;
    final fontSize = (radius * 0.65).clamp(10.0, 28.0);

    Widget avatar;
    if (hasPhoto) {
      avatar = SizedBox(
        width: radius * 2,
        height: radius * 2,
        child: ClipOval(
          child: Image.network(
            resolvedUrl,
            width: radius * 2,
            height: radius * 2,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _initialsCircle(radius, fontSize),
            loadingBuilder: (_, child, prog) =>
                prog == null ? child : _initialsCircle(radius, fontSize),
          ),
        ),
      );
    } else {
      avatar = _initialsCircle(radius, fontSize);
    }

    if (onTap != null) {
      return GestureDetector(onTap: onTap, child: avatar);
    }
    return avatar;
  }

  Widget _initialsCircle(double radius, double fontSize) {
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(color: bgColor, shape: BoxShape.circle),
      child: Center(
        child: Text(
          initial.isNotEmpty ? initial[0].toUpperCase() : '?',
          style: TextStyle(
              color: textColor,
              fontSize: fontSize,
              fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

/// Extracts the profile photo URL from a user map, checking all common
/// field names your backend might use.
String _userPhotoUrl(Map<dynamic, dynamic>? user) {
  if (user == null) return '';
  for (final key in [
    'profilePhoto', 'profilePicture', 'profileImage',
    'avatar', 'photo', 'picture', 'image', 'avatarUrl',
    'profilePhotoUrl', 'photoUrl',
  ]) {
    final v = user[key];
    if (v != null && v.toString().trim().isNotEmpty) return v.toString().trim();
  }
  return '';
}