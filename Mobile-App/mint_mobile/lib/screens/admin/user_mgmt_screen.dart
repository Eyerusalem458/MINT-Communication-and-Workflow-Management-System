import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../models/user_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

const List<String> kDepartments = [
  "Minister's Office (ሚኒስትር ፅህፈት ቤት)",
  "Legal Affairs (ህግ ጉዳዮች)",
  "Public Relations and Communications (የህዝብ ግንኙነትና ኮሙኒኬሽን)",
  "Audit Service (ኦዲት አገልግሎት)",
  "Ethics and Anti-Corruption (ስነምግባርና ፀረሙስና)",
  "Strategy Affairs (ትራቴጂ ጉዳዮች)",
  "Procurement and Finance (ግዥና ፋይናንስ)",
  "Human Resource Administration (የቃትና ሰው ሃብት አስተዳደር)",
  "Basic Services (መሰረታዊ አገልግሎት)",
  "ICT and Digital Economy Sector (አይሲቲ እና ዲጂታል ኢኮኖሚ ዘርፍ)",
  "Innovation and Research Sector (ኢኖቬሽንና ምርምር ዘርፍ)",
  "National Research and Development (ሀገራዊ የምርምር ልማት)",
  "Technology Transfer and Development (የቴክኖሎጂ ሽግግርና ልማት)",
  "Innovation and Startup Development (የኢኖቬሽንና ስታርትአፕ ልማት)",
  "Government ICT Infrastructure (የመንግስት አይሲቲ መሰረተልማት ግንባታ እና አስተዳደር)",
  "Digital Economy Development (የዲጂታል ኢኮኖሚ ልማት)",
  "E-Government Development (ኤሌክትሮኒክስ መንግስት ልማት)",
  "Digital Infrastructure (ዲጂታል መሰረተልማት ግንባታ)",
  "Digital Standards and Regulation (ዲጂታል ስታንዳርድ እና ሬጉሌሽን)",
  "Innovation and Technology Data Management (የኢኖቬሽንና ቴክኖሎጂ መረጃ ልማትና አስተዳደር)",
  "Innovation Development (ኢኖቬሽን ልማት)",
  "National Research Infrastructure (የሀገራዊ ምርምር መሰረተልማት ግንባታ)",
  "Technology Transfer and Linkage (የቴክኖሎጂ ሽግግርና ትስስር)",
  "Indigenous Technology Development (ሀገር በቀል ቴክኖሎጂ ልማት)",
  "Innovation Infrastructure (ኢኖቬሽን መሰረተልማት)",
  "National E-Government Plan Coordination (የብሄራዊ የኤ-መንግስት ዕቅድ ማስተባበሪያ)",
  "Government Digital Services Development (መንግስታዊ ዲጂታል አገልግሎቶች ልማት እና አስተዳደር)",
  "National Data Resource Development (ብሄራዊ ዳታ ሃብት ልማት ቅንጅት)",
  "Data Center Administration (የዳታ ማዕክል አስተዳደር)",
  "Quality and Security Management (የጥራት እና ደህንነት አስተዳደር)",
  "Digital Community Development (የዲጂታል ማሕበረስብ ልማት)",
  "Digital Industry Development (የዲጂታል ኢንዱስትሪ ልማት)",
  "Startup and Innovative Enterprise Development (የስታርፕ እና ኢኖቫቲቭ ኢንተርፕራይዝ ልማት)",
  "National Research Ethics and Science Culture (ሀገራዊ የምርምር ስነምግባርና የሳይንስ ባህል ግንባታ)",
  "International Relations and Cooperation (የዓለም አቀፍ ግንኙነትና ትብብር)",
  "Regional and Council Affairs (የክልሎች እና ካውንስል ጉዳዮች)",
  "Private Sector (የግል ዘርፍ)",
  "Innovation Fund Office (የኢኖቬሽን ፈንድ ፅህፈት ቤት)",
  "Collaboration and Partnership (የትብብር እና ትስስር)",
];

class UserMgmtScreen extends StatefulWidget {
  const UserMgmtScreen({super.key});
  @override
  State<UserMgmtScreen> createState() => _UserMgmtScreenState();
}

class _UserMgmtScreenState extends State<UserMgmtScreen> {
  String _query = '';
  String _roleFilter = '';
  String _genderFilter = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
        (_) => context.read<UserProvider>().fetchUsers('admin'));
  }

  List<UserModel> get _filtered {
    final q = _query.toLowerCase();
    return context.read<UserProvider>().users.where((u) {
      final matchQ = u.fullName.toLowerCase().contains(q) ||
          u.email.toLowerCase().contains(q);
      final matchR = _roleFilter.isEmpty || u.role == _roleFilter;
      final matchG = _genderFilter.isEmpty || u.gender == _genderFilter;
      return matchQ && matchR && matchG;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<UserProvider>();
    final users = _filtered;

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(title: const Text('')),
      body: Column(children: [
        // Search + filters
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
          child: Column(children: [
            SearchInput(
                hint: 'Search users...',
                onChanged: (v) => setState(() => _query = v)),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(
                child: _DropFilter(
                  value: _roleFilter,
                  hint: 'All Roles',
                  items: const ['', 'admin', 'manager', 'staff'],
                  labels: const ['All Roles', 'Admin', 'Manager', 'Staff'],
                  onChanged: (v) => setState(() => _roleFilter = v),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _DropFilter(
                  value: _genderFilter,
                  hint: 'All Gender',
                  items: const ['', 'Male', 'Female'],
                  labels: const ['All Gender', 'Male', 'Female'],
                  onChanged: (v) => setState(() => _genderFilter = v),
                ),
              ),
            ]),
          ]),
        ),
        const SizedBox(height: 8),

        // Stats row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(children: [
            _chip('Total', prov.users.length, AppColors.primary),
            const SizedBox(width: 8),
            _chip(
                'Active',
                prov.users.where((u) => u.status == 'Active').length,
                AppColors.success),
            const SizedBox(width: 8),
            _chip(
                'Inactive',
                prov.users.where((u) => u.status == 'Inactive').length,
                AppColors.danger),
          ]),
        ),
        const SizedBox(height: 8),

        // User list
        Expanded(
          child: prov.loading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary))
              : users.isEmpty
                  ? const EmptyState(
                      message: 'No users found', icon: Icons.people_outline)
                  : RefreshIndicator(
                      onRefresh: () => prov.fetchUsers('admin'),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: users.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) => _UserCard(
                          user: users[i],
                          onEdit: () => _showEditSheet(context, users[i]),
                          onToggle: () => _toggle(context, users[i]),
                        ),
                      ),
                    ),
        ),
      ]),
    );
  }

  Widget _chip(String label, int value, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8)),
        child: Row(children: [
          Text('$value',
              style: TextStyle(
                  fontWeight: FontWeight.w700, fontSize: 15, color: color)),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        ]),
      );

  Future<void> _toggle(BuildContext context, UserModel user) async {
    try {
      await context.read<UserProvider>().toggleStatus(user.id);
      if (!context.mounted) return;
      showSnack(context,
          'User ${user.status == 'Active' ? 'deactivated' : 'activated'}');
    } catch (_) {
      if (!context.mounted) return;
      showSnack(context, 'Failed to toggle status', isError: true);
    }
  }

  void _showEditSheet(BuildContext context, UserModel user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _EditUserSheet(user: user),
    );
  }
}

// ── User Card ─────────────────────────────────────────────────────────────────
class _UserCard extends StatelessWidget {
  final UserModel user;
  final VoidCallback onEdit;
  final VoidCallback onToggle;

  const _UserCard(
      {required this.user, required this.onEdit, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border)),
      child: Row(children: [
        UserAvatar(
          avatarUrl: user.avatar != null && user.avatar!.isNotEmpty
              ? '$kMediaBaseUrl${user.avatar}'
              : null,
          initials: user.initials,
          size: 46,
        ),
        const SizedBox(width: 12),
        Expanded(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(user.fullName,
                style:
                    const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(user.email,
                style:
                    const TextStyle(fontSize: 11, color: AppColors.textMuted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Row(children: [
              StatusBadge(user.status),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(999)),
                child: Text(user.role.toUpperCase(),
                    style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600)),
              ),
            ]),
            if (user.department.isNotEmpty) ...[
              const SizedBox(height: 3),
              Text(user.department,
                  style:
                      const TextStyle(fontSize: 10, color: AppColors.textLight),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
            ],
          ]),
        ),
        Column(children: [
          IconButton(
              onPressed: onEdit,
              icon: const Icon(Icons.edit_outlined,
                  size: 18, color: AppColors.primary),
              tooltip: 'Edit'),
          GestureDetector(
            onTap: onToggle,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                  color: user.status == 'Active'
                      ? AppColors.danger.withValues(alpha: 0.1)
                      : AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6)),
              child: Text(
                user.status == 'Active' ? 'Deactivate' : 'Activate',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: user.status == 'Active'
                        ? AppColors.danger
                        : AppColors.success),
              ),
            ),
          ),
        ]),
      ]),
    );
  }
}

// ── Edit User Sheet ───────────────────────────────────────────────────────────
class _EditUserSheet extends StatefulWidget {
  final UserModel user;
  const _EditUserSheet({required this.user});
  @override
  State<_EditUserSheet> createState() => _EditUserSheetState();
}

class _EditUserSheetState extends State<_EditUserSheet> {
  late TextEditingController _firstName, _lastName, _email, _phone;
  late String _role, _gender, _status, _department;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _firstName = TextEditingController(text: widget.user.firstName);
    _lastName = TextEditingController(text: widget.user.lastName);
    _email = TextEditingController(text: widget.user.email);
    _phone = TextEditingController(text: widget.user.phone);
    _role = widget.user.role;
    _gender = widget.user.gender;
    _status = widget.user.status;
    _department = widget.user.department;
  }

  @override
  void dispose() {
    for (final c in [_firstName, _lastName, _email, _phone]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (_firstName.text.trim().isEmpty ||
        _lastName.text.trim().isEmpty ||
        _email.text.trim().isEmpty) {
      showSnack(context, 'Fill required fields', isError: true);
      return;
    }
    setState(() => _busy = true);
    try {
      await context.read<UserProvider>().editUser(widget.user.id, {
        'firstName': _firstName.text.trim(),
        'lastName': _lastName.text.trim(),
        'email': _email.text.trim(),
        'phone': _phone.text.trim(),
        'role': _role,
        'gender': _gender,
        'status': _status,
        'department': _department,
      });
      if (!mounted) return;
      showSnack(context, 'User updated successfully');
      Navigator.pop(context);
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Update failed', isError: true);
    }
    setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: SingleChildScrollView(
        child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                const Expanded(
                    child: Text('Edit User',
                        style: TextStyle(
                            fontSize: 17, fontWeight: FontWeight.w700))),
                IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close)),
              ]),
              const SizedBox(height: 12),

              _field('First Name *', _firstName),
              _field('Last Name *', _lastName),
              _field('Email *', _email, keyboard: TextInputType.emailAddress),
              _field('Phone', _phone, keyboard: TextInputType.phone),
              const SizedBox(height: 4),

              // Role
              _drop<String>(
                label: 'Role',
                value: _role,
                items: const ['admin', 'manager', 'staff'],
                labels: const ['Admin', 'Manager', 'Staff'],
                onChanged: (v) => setState(() => _role = v ?? _role),
              ),
              const SizedBox(height: 12),

              // Gender
              _drop<String>(
                label: 'Gender',
                value: _gender.isNotEmpty ? _gender : null,
                items: const ['Male', 'Female'],
                labels: const ['Male', 'Female'],
                onChanged: (v) => setState(() => _gender = v ?? ''),
              ),
              const SizedBox(height: 12),

              // Status
              _drop<String>(
                label: 'Status',
                value: _status,
                items: const ['Active', 'Inactive'],
                labels: const ['Active', 'Inactive'],
                onChanged: (v) => setState(() => _status = v ?? _status),
              ),
              const SizedBox(height: 12),

              // Department
              DropdownButtonFormField<String>(
                value: _department.isNotEmpty ? _department : null,
                decoration: const InputDecoration(labelText: 'Department'),
                isExpanded: true,
                items: kDepartments
                    .map((d) => DropdownMenuItem(
                        value: d,
                        child: Text(d,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12))))
                    .toList(),
                onChanged: (v) =>
                    setState(() => _department = v ?? _department),
              ),
              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _busy ? null : _save,
                  child: _busy
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Update User'),
                ),
              ),
            ]),
      ),
    );
  }

  Widget _field(String label, TextEditingController ctrl,
      {TextInputType keyboard = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
          controller: ctrl,
          keyboardType: keyboard,
          decoration: InputDecoration(labelText: label)),
    );
  }

  Widget _drop<T>({
    required String label,
    required T? value,
    required List<T> items,
    required List<String> labels,
    required void Function(T?) onChanged,
  }) {
    return DropdownButtonFormField<T>(
      value: value,
      decoration: InputDecoration(labelText: label),
      items: List.generate(items.length,
          (i) => DropdownMenuItem(value: items[i], child: Text(labels[i]))),
      onChanged: onChanged,
    );
  }
}

// ── Simple dropdown filter ────────────────────────────────────────────────────
class _DropFilter extends StatelessWidget {
  final String value;
  final String hint;
  final List<String> items;
  final List<String> labels;
  final void Function(String) onChanged;

  const _DropFilter({
    required this.value,
    required this.hint,
    required this.items,
    required this.labels,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.border)),
        filled: true,
        fillColor: Colors.white,
        isDense: true,
      ),
      items: List.generate(
          items.length,
          (i) => DropdownMenuItem(
              value: items[i],
              child: Text(labels[i], style: const TextStyle(fontSize: 12)))),
      onChanged: (v) => onChanged(v ?? ''),
    );
  }
}
