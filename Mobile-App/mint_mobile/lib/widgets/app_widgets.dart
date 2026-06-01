import 'package:flutter/material.dart';
import '../utils/constants.dart';

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
class StatusBadge extends StatelessWidget {
  final String status;
  const StatusBadge(this.status, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: statusBgColor(status),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: statusTextColor(status),
        ),
      ),
    );
  }
}

// ─── APP BUTTON ───────────────────────────────────────────────────────────────
class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final String variant; // primary, ghost, danger, approve, reject
  final bool loading;
  final bool small;

  const AppButton({
    super.key,
    required this.label,
    this.onTap,
    this.variant = 'primary',
    this.loading = false,
    this.small = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg, fg;
    switch (variant) {
      case 'ghost':
        bg = const Color(0x2294A3B8);
        fg = AppColors.textPrimary;
        break;
      case 'danger':
        bg = const Color(0x1FF87171);
        fg = const Color(0xFFB91C1C);
        break;
      case 'approve':
        bg = AppColors.success;
        fg = Colors.white;
        break;
      case 'reject':
        bg = AppColors.danger;
        fg = Colors.white;
        break;
      default:
        bg = AppColors.accent;
        fg = Colors.white;
    }

    return GestureDetector(
      onTap: loading ? null : onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: small ? 10 : 16,
          vertical: small ? 5 : 10,
        ),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
        ),
        child: loading
            ? SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: fg,
                ),
              )
            : Text(
                label,
                style: TextStyle(
                  color: fg,
                  fontSize: small ? 11 : 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
class MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final String? caption;
  final Color? valueColor;
  final VoidCallback? onTap;

  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    this.caption,
    this.valueColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textMuted,
                letterSpacing: 0.5,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w700,
                color: valueColor ?? AppColors.textPrimary,
              ),
            ),
            if (caption != null) ...[
              const SizedBox(height: 4),
              Text(
                caption!,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
class SectionCard extends StatelessWidget {
  final String? title;
  final Widget child;
  final Widget? trailing;

  const SectionCard(
      {super.key, this.title, required this.child, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      title!,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  if (trailing != null) trailing!,
                ],
              ),
            ),
          child,
        ],
      ),
    );
  }
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
class UserAvatar extends StatelessWidget {
  final String? avatarUrl;
  final String initials;
  final double size;

  const UserAvatar({
    super.key,
    this.avatarUrl,
    required this.initials,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(size / 2),
        child: Image.network(
          avatarUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _placeholder(),
        ),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFFCBD5F5),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          initials,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: size * 0.38,
            color: AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}

// ─── PROGRESS BAR ROW ────────────────────────────────────────────────────────
class ProgressBarRow extends StatelessWidget {
  final String label;
  final int value;
  final int total;
  final Color color;

  const ProgressBarRow({
    super.key,
    required this.label,
    required this.value,
    required this.total,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final pct = total > 0 ? value / total : 0.0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(label,
                style:
                    const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ),
          Expanded(
            child: Container(
              height: 8,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(999),
              ),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: pct,
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 24,
            child: Text('$value',
                style:
                    const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

// ─── SNACKBAR HELPER ─────────────────────────────────────────────────────────
void showSnack(BuildContext context, String message, {bool isError = false}) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
    content: Text(message),
    backgroundColor: isError ? AppColors.danger : AppColors.success,
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ));
}

// ─── CONFIRMATION DIALOG ──────────────────────────────────────────────────────
Future<bool> confirmDialog(
    BuildContext context, String title, String body) async {
  return await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text(title),
          content: Text(body),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel')),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Confirm',
                  style: TextStyle(color: AppColors.danger)),
            ),
          ],
        ),
      ) ??
      false;
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
class EmptyState extends StatelessWidget {
  final String message;
  final IconData icon;

  const EmptyState({
    super.key,
    this.message = 'Nothing here yet',
    this.icon = Icons.inbox_outlined,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: AppColors.textLight),
          const SizedBox(height: 12),
          Text(message,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 14)),
        ],
      ),
    );
  }
}

// ─── SEARCH INPUT ─────────────────────────────────────────────────────────────
class SearchInput extends StatelessWidget {
  final String hint;
  final ValueChanged<String> onChanged;

  const SearchInput(
      {super.key, this.hint = 'Search...', required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 42,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        onChanged: onChanged,
        style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.textLight, fontSize: 14),
          prefixIcon:
              const Icon(Icons.search, size: 18, color: AppColors.textMuted),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }
}
