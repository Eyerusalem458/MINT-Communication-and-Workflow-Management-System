import 'package:flutter/material.dart';
import 'package:mint_mobile/models/conversation_model.dart';
import 'package:mint_mobile/models/user_model.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
import '../shared/notifications_screen.dart';
import 'conversation_screen.dart';

// ─── Brand colors (matched to login/welcome page) ──────────────────────────────
class _Brand {
  static const primary = AppColors.primary;
  static const primaryMid = AppColors.primary;
  static const accent = AppColors.accent;
  static const white = Colors.white;
}

// ─── Theme notifier ────────────────────────────────────────────────────────────
class ThemeModeNotifier extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.light;
  ThemeMode get mode => _mode;
  bool get isDark => _mode == ThemeMode.dark;

  void toggle() {
    _mode = isDark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }
}

// ─── Chat Screen ───────────────────────────────────────────────────────────────
class ChatScreen extends StatefulWidget {
  final GlobalKey<ScaffoldState> scaffoldKey;

  const ChatScreen({
    super.key,
    required this.scaffoldKey,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  final _searchCtrl = TextEditingController();
  String _search = '';
  bool _refreshing = false;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatProvider>().fetchAll();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _doRefresh() async {
    if (_refreshing) return;
    setState(() => _refreshing = true);
    await context.read<ChatProvider>().refresh();
    if (mounted) setState(() => _refreshing = false);
  }

  List<ConversationModel> _filtered(List<ConversationModel> all, String myId) {
    var list = all
        .where((c) => c
            .getDisplayName(myId)
            .toLowerCase()
            .contains(_search.toLowerCase()))
        .toList();
    final tab = _tabs.index;
    if (tab == 1) list = list.where((c) => c.type == 'direct').toList();
    if (tab == 2) list = list.where((c) => c.type == 'group').toList();
    if (tab == 3) list = list.where((c) => c.lastMessage.isNotEmpty).toList();
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final chat = context.watch<ChatProvider>();
    final myId = auth.user?.id ?? '';

    final themeNotifier = context.watch<ThemeModeNotifier>();
    final isDark = themeNotifier.isDark;

    // ── Themed surface colors ──
    final scaffoldBg =
        isDark ? const Color(0xFF0F1117) : const Color(0xFFF8FAFC);
    final tileBg = isDark ? const Color(0xFF1A1D26) : Colors.white;
    final activeTile =
        isDark ? const Color(0xFF242736) : const Color(0xFFE2F0F4);
    final divColor = isDark ? const Color(0xFF2A2D3A) : const Color(0xFFF1F5F9);

    return Scaffold(
      backgroundColor: scaffoldBg,

      // ── AppBar ──────────────────────────────────────────────────────────────
      appBar: AppBar(
        backgroundColor: _Brand.primary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: _Brand.white),
          tooltip: 'Menu',
          onPressed: () => widget.scaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text(
          'Chats',
          style: TextStyle(
            color: _Brand.white,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
        actions: [
          // Theme toggle
          IconButton(
            icon: Icon(
              isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
              color: _Brand.white,
            ),
            tooltip: isDark ? 'Light mode' : 'Dark mode',
            onPressed: () => themeNotifier.toggle(),
          ),
          // Refresh
          IconButton(
            icon: _refreshing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: _Brand.white,
                    ),
                  )
                : const Icon(Icons.refresh, color: _Brand.white),
            tooltip: 'Refresh',
            onPressed: _refreshing ? null : _doRefresh,
          ),
          // Notifications
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: _Brand.white),
            tooltip: 'Notifications',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NotificationsScreen()),
            ),
          ),
          // New Group
          IconButton(
            icon: const Icon(Icons.group_add_outlined, color: _Brand.white),
            tooltip: 'New group',
            onPressed: () => _showNewGroupSheet(context, myId),
          ),
          // New Chat
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: _Brand.white),
            tooltip: 'New chat',
            onPressed: () => _showNewChatSheet(context, myId),
          ),
          const SizedBox(width: 4),
        ],

        // ── Search + Tabs ────────────────────────────────────────────────────
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(100),
          child: Column(
            children: [
              // Search bar
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (v) => setState(() => _search = v),
                    style: TextStyle(
                        color: isDark ? _Brand.white : AppColors.textPrimary,
                        fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search conversations...',
                      hintStyle: TextStyle(
                        color: isDark ? Colors.white60 : AppColors.textMuted,
                        fontSize: 14,
                        fontStyle: FontStyle.italic,
                      ),
                      prefixIcon: Icon(
                        Icons.search,
                        color: isDark ? Colors.white70 : AppColors.textMuted,
                        size: 18,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ),
              // Tabs
              TabBar(
                controller: _tabs,
                onTap: (_) => setState(() {}),
                indicatorColor: _Brand.accent, // orange indicator
                indicatorWeight: 3,
                labelColor: _Brand.white,
                unselectedLabelColor: Colors.white54,
                labelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
                tabs: const [
                  Tab(text: 'All'),
                  Tab(text: 'Direct'),
                  Tab(text: 'Teams'),
                  Tab(text: 'Unread'),
                ],
              ),
            ],
          ),
        ),
      ),

      // ── Body ────────────────────────────────────────────────────────────────
      body: RefreshIndicator(
        color: _Brand.accent,
        onRefresh: _doRefresh,
        child: chat.loadingConversations
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : Builder(builder: (_) {
                final filtered = _filtered(chat.conversations, myId);

                if (filtered.isEmpty) {
                  return SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: SizedBox(
                      height: MediaQuery.of(context).size.height * 0.6,
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 60,
                              color: isDark
                                  ? Colors.white24
                                  : const Color(0xFFCBD5E1),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'No conversations yet',
                              style: TextStyle(
                                color: isDark
                                    ? Colors.white38
                                    : const Color(0xFF64748B),
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _Brand.accent,
                                foregroundColor: _Brand.white,
                                shape: const StadiumBorder(),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 12,
                                ),
                              ),
                              onPressed: () => _showNewChatSheet(context, myId),
                              icon: const Icon(Icons.add),
                              label: const Text('Start a conversation'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) =>
                      Divider(height: 1, color: divColor),
                  itemBuilder: (_, i) {
                    final conv = filtered[i];
                    final name = conv.getDisplayName(myId);
                    final initial = conv.getInitial(myId);
                    final isActive = chat.activeConversation?.id == conv.id;

                    return InkWell(
                      onTap: () async {
                        await context
                            .read<ChatProvider>()
                            .selectConversation(conv);
                        if (!context.mounted) return;
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ConversationScreen(
                              themeNotifier: themeNotifier,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        color: isActive ? activeTile : tileBg,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        child: Row(
                          children: [
                            _ConvAvatar(
                              initial: initial,
                              isGroup: conv.type == 'group',
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    name,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 15,
                                      color: isDark
                                          ? Colors.white
                                          : const Color(0xFF1E293B),
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    conv.lastMessage.isNotEmpty
                                        ? conv.lastMessage
                                        : 'No messages yet',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isDark
                                          ? Colors.white38
                                          : const Color(0xFF64748B),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            if (conv.lastMessageAt != null)
                              Text(
                                _formatTime(conv.lastMessageAt!),
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isDark
                                      ? Colors.white30
                                      : const Color(0xFF94A3B8),
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              }),
      ),

      // ── FAB ─────────────────────────────────────────────────────────────────
      floatingActionButton: FloatingActionButton(
        backgroundColor: _Brand.accent,
        foregroundColor: _Brand.white,
        tooltip: 'New chat',
        onPressed: () => _showNewChatSheet(context, myId),
        child: const Icon(Icons.chat),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    if (dt.day == now.day && dt.month == now.month && dt.year == now.year) {
      final h = dt.hour.toString().padLeft(2, '0');
      final m = dt.minute.toString().padLeft(2, '0');
      return '$h:$m';
    }
    return '${dt.day}/${dt.month}';
  }

  void _showNewChatSheet(BuildContext context, String myId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _NewChatSheet(myId: myId),
    );
  }

  void _showNewGroupSheet(BuildContext context, String myId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _NewGroupSheet(myId: myId),
    );
  }
}

// ─── Conversation Avatar ────────────────────────────────────────────────────────
class _ConvAvatar extends StatelessWidget {
  final String initial;
  final bool isGroup;
  const _ConvAvatar({required this.initial, required this.isGroup});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        // group → teal brand, direct → light blue
        color: isGroup ? _Brand.primaryMid : const Color(0xFFCBD5F5),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          initial,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: isGroup ? _Brand.white : _Brand.primary,
          ),
        ),
      ),
    );
  }
}

// ─── New Direct Chat Sheet ──────────────────────────────────────────────────────
class _NewChatSheet extends StatefulWidget {
  final String myId;
  const _NewChatSheet({required this.myId});
  @override
  State<_NewChatSheet> createState() => _NewChatSheetState();
}

class _NewChatSheetState extends State<_NewChatSheet> {
  final _searchCtrl = TextEditingController();
  String _search = '';
  UserModel? _selected;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chat = context.watch<ChatProvider>();
    final filtered = chat.chatUsers
        .where((u) => '${u.firstName} ${u.lastName}'
            .toLowerCase()
            .contains(_search.toLowerCase()))
        .toList();

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      builder: (_, ctrl) => Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'New Conversation',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          // Search
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SearchInput(
              hint: 'Search users...',
              onChanged: (v) => setState(() => _search = v),
            ),
          ),
          const SizedBox(height: 8),
          // User list
          Expanded(
            child: ListView.builder(
              controller: ctrl,
              itemCount: filtered.length,
              itemBuilder: (_, i) {
                final u = filtered[i];
                final sel = _selected?.id == u.id;
                return ListTile(
                  leading: UserAvatar(initials: u.initials, size: 40),
                  title: Text(
                    u.fullName,
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  subtitle: Text(
                    '${u.role} · ${u.department}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11),
                  ),
                  trailing: sel
                      ? const Icon(Icons.check_circle, color: _Brand.primaryMid)
                      : null,
                  selected: sel,
                  selectedTileColor: const Color(0xFFE2F0F4),
                  onTap: () => setState(() => _selected = u),
                );
              },
            ),
          ),
          // Start Chat button
          Padding(
            padding: EdgeInsets.fromLTRB(
              16,
              8,
              16,
              MediaQuery.of(context).viewInsets.bottom + 16,
            ),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      _selected == null ? Colors.grey[300] : _Brand.accent,
                  foregroundColor: _Brand.white,
                  shape: const StadiumBorder(),
                ),
                onPressed: _selected == null
                    ? null
                    : () async {
                        final conv = await context
                            .read<ChatProvider>()
                            .startDirect(_selected!.id);
                        if (!context.mounted) return;
                        Navigator.pop(context);
                        if (conv != null) {
                          await context
                              .read<ChatProvider>()
                              .selectConversation(conv);
                          if (!context.mounted) return;
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ConversationScreen(
                                themeNotifier: ThemeModeNotifier(),
                              ),
                            ),
                          );
                        }
                      },
                child: const Text(
                  'Start Chat',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── New Group Sheet ────────────────────────────────────────────────────────────
class _NewGroupSheet extends StatefulWidget {
  final String myId;
  const _NewGroupSheet({required this.myId});
  @override
  State<_NewGroupSheet> createState() => _NewGroupSheetState();
}

class _NewGroupSheetState extends State<_NewGroupSheet> {
  final _nameCtrl = TextEditingController();
  final _searchCtrl = TextEditingController();
  String _search = '';
  final List<UserModel> _selected = [];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chat = context.watch<ChatProvider>();
    final filtered = chat.chatUsers
        .where((u) => '${u.firstName} ${u.lastName}'
            .toLowerCase()
            .contains(_search.toLowerCase()))
        .toList();

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      builder: (_, ctrl) => Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'New Group',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          // Group name input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _nameCtrl,
              decoration: InputDecoration(
                hintText: 'Group name',
                prefixIcon: const Icon(Icons.group, color: _Brand.primaryMid),
                focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: _Brand.primaryMid),
                  borderRadius: BorderRadius.circular(12),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Member search
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SearchInput(
              hint: 'Search members...',
              onChanged: (v) => setState(() => _search = v),
            ),
          ),
          // Selected chips
          if (_selected.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Wrap(
                spacing: 6,
                runSpacing: 4,
                children: _selected
                    .map((u) => Chip(
                          label: Text(
                            u.firstName,
                            style: const TextStyle(
                              fontSize: 12,
                              color: _Brand.primary,
                            ),
                          ),
                          backgroundColor: const Color(0xFFE2F0F4),
                          deleteIconColor: _Brand.primaryMid,
                          onDeleted: () => setState(() => _selected.remove(u)),
                        ))
                    .toList(),
              ),
            ),
          // Members list
          Expanded(
            child: ListView.builder(
              controller: ctrl,
              itemCount: filtered.length,
              itemBuilder: (_, i) {
                final u = filtered[i];
                final sel = _selected.any((x) => x.id == u.id);
                return ListTile(
                  leading: UserAvatar(initials: u.initials, size: 38),
                  title: Text(u.fullName),
                  subtitle: Text(u.role),
                  trailing: sel
                      ? const Icon(Icons.check_circle, color: _Brand.primaryMid)
                      : null,
                  selected: sel,
                  selectedTileColor: const Color(0xFFE2F0F4),
                  onTap: () => setState(() => sel
                      ? _selected.removeWhere((x) => x.id == u.id)
                      : _selected.add(u)),
                );
              },
            ),
          ),
          // Create Group button
          Padding(
            padding: EdgeInsets.fromLTRB(
              16,
              8,
              16,
              MediaQuery.of(context).viewInsets.bottom + 16,
            ),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      (_selected.isEmpty || _nameCtrl.text.trim().isEmpty)
                          ? Colors.grey[300]
                          : _Brand.accent,
                  foregroundColor: _Brand.white,
                  shape: const StadiumBorder(),
                ),
                onPressed: (_selected.isEmpty || _nameCtrl.text.trim().isEmpty)
                    ? null
                    : () async {
                        final conv =
                            await context.read<ChatProvider>().createGroup(
                                  _nameCtrl.text.trim(),
                                  _selected.map((u) => u.id).toList(),
                                );
                        if (!context.mounted) return;
                        Navigator.pop(context);
                        if (conv != null) {
                          await context
                              .read<ChatProvider>()
                              .selectConversation(conv);
                          if (!context.mounted) return;
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ConversationScreen(
                                themeNotifier: ThemeModeNotifier(),
                              ),
                            ),
                          );
                        }
                      },
                child: Text(
                  _selected.isEmpty
                      ? 'Create Group'
                      : 'Create Group (${_selected.length} members)',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
