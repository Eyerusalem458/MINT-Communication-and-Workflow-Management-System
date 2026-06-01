import 'package:flutter/material.dart';
import 'package:mint_mobile/models/activity_model.dart';
import '../../api/notification_api.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class ActivityLogScreen extends StatefulWidget {
  const ActivityLogScreen({super.key});
  @override
  State<ActivityLogScreen> createState() => _ActivityLogScreenState();
}

class _ActivityLogScreenState extends State<ActivityLogScreen> {
  List<ActivityModel> _activity = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ActivityApi.getActivityLogs();
      setState(() {
        _activity =
            (res.data as List).map((a) => ActivityModel.fromJson(a)).toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(title: const Text('')),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _activity.isEmpty
              ? const EmptyState(
                  message: 'No activity recorded yet',
                  icon: Icons.history,
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _activity.length,
                    itemBuilder: (_, i) {
                      final item = _activity[i];
                      final isLast = i == _activity.length - 1;

                      return IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Timeline
                            SizedBox(
                              width: 32,
                              child: Column(
                                children: [
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(
                                      color: AppColors.primary,
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.primary
                                              .withValues(alpha: 0.3),
                                          blurRadius: 6,
                                          spreadRadius: 1,
                                        )
                                      ],
                                    ),
                                  ),
                                  if (!isLast)
                                    Expanded(
                                      child: Container(
                                        width: 1,
                                        color: AppColors.border,
                                      ),
                                    ),
                                ],
                              ),
                            ),

                            const SizedBox(width: 12),

                            // Content
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.action,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 3),

                                    // ✅ FIX: use item.time directly — server already formats it
                                    if (item.time != null &&
                                        item.time!.isNotEmpty)
                                      Text(
                                        item.time!,
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppColors.textLight,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
