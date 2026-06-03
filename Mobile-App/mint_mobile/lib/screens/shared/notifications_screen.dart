import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/notification_provider.dart';
import '../../models/notification_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _filter = 'All';
  final _filters = ['All', 'Tasks', 'Personal', 'System', 'Project', 'Unseen'];

  // ─────────────────────────────────────────────────────────────────────────
  // Formats raw backend messages (call records, audio filenames, etc.)
  // Mirrors the React formatMessage() helper so mobile renders identically.
  // ─────────────────────────────────────────────────────────────────────────
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
          RegExp(r'"status"\s*:\s*"([^"]*)"').firstMatch(message)?.group(1) ??
              '';

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

    if (RegExp(r'📎\s*(audio|voice)', caseSensitive: false)
        .hasMatch(message)) {
      return '🎵 Audio';
    }

    if (message.contains('📎') && audioExt.hasMatch(message)) {
      return '🎵 Audio';
    }

    if (audioExt.hasMatch(message)) return '🎵 Audio';

    // 3. Everything else unchanged
    return message;
  }

  // ─────────────────────────────────────────────────────────────────────────

  List<NotificationModel> _filtered(List<NotificationModel> all) {
    if (_filter == 'All') return all;
    if (_filter == 'Unseen') return all.where((n) => n.unseen).toList();
    if (_filter == 'Tasks') {
      return all.where((n) => ['Task', 'Deadline'].contains(n.type)).toList();
    }
    return all
        .where((n) => n.type.toLowerCase() == _filter.toLowerCase())
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<NotificationProvider>();
    final items = _filtered(prov.notifications);

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(
        title: const Text(''),
        actions: [
          TextButton(
            onPressed: prov.markAllAsRead,
            child: const Text('Mark all read',
                style: TextStyle(color: Colors.white, fontSize: 12)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _filters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final f = _filters[i];
                final active = f == _filter;
                return GestureDetector(
                  onTap: () => setState(() => _filter = f),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: active
                          ? AppColors.primary.withValues(alpha: 0.12)
                          : AppColors.surface,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: active ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Text(f,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight:
                              active ? FontWeight.w600 : FontWeight.normal,
                          color:
                              active ? AppColors.primary : AppColors.textMuted,
                        )),
                  ),
                );
              },
            ),
          ),

          Expanded(
            child: prov.loading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary))
                : items.isEmpty
                    ? const EmptyState(
                        message: 'No notifications found',
                        icon: Icons.notifications_none)
                    : ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) {
                          final n = items[i];
                          return GestureDetector(
                            onTap: () {
                              if (n.unseen) prov.markOneAsRead(n.id);
                            },
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: n.unseen
                                    ? AppColors.primary.withValues(alpha: 0.05)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: n.unseen
                                      ? AppColors.primary.withValues(alpha: 0.2)
                                      : AppColors.border,
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: _typeColor(n.type)
                                          .withValues(alpha: 0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                        child: Text(_typeEmoji(n.type),
                                            style:
                                                const TextStyle(fontSize: 16))),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        // ── FIXED: was n.message (raw JSON) ──
                                        Text(
                                          _formatMessage(n.message),
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: n.unseen
                                                ? FontWeight.w600
                                                : FontWeight.normal,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Row(children: [
                                          StatusBadge(n.type),
                                          if (n.unseen) ...[
                                            const SizedBox(width: 6),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 6,
                                                      vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AppColors.primary,
                                                borderRadius:
                                                    BorderRadius.circular(999),
                                              ),
                                              child: const Text('New',
                                                  style: TextStyle(
                                                      fontSize: 10,
                                                      color: Colors.white)),
                                            ),
                                          ],
                                          const Spacer(),
                                          if (n.createdAt != null)
                                            Text(_formatDate(n.createdAt!),
                                                style: const TextStyle(
                                                    fontSize: 11,
                                                    color:
                                                        AppColors.textLight)),
                                        ]),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Color _typeColor(String type) {
    switch (type.toLowerCase()) {
      case 'task':
      case 'deadline':
        return AppColors.warning;
      case 'project':
        return AppColors.primary;
      case 'system':
        return AppColors.textMuted;
      default:
        return AppColors.success;
    }
  }

  String _typeEmoji(String type) {
    switch (type.toLowerCase()) {
      case 'task':
        return '✅';
      case 'deadline':
        return '⏰';
      case 'project':
        return '📁';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}