import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../models/user_model.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class StaffMgmtScreen extends StatefulWidget {
  const StaffMgmtScreen({super.key});
  @override
  State<StaffMgmtScreen> createState() => _StaffMgmtScreenState();
}

class _StaffMgmtScreenState extends State<StaffMgmtScreen> {
  String _query = '';
  String _genderFilter = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
        (_) => context.read<UserProvider>().fetchUsers('manager'));
  }

  List<UserModel> get _filtered {
    final q = _query.toLowerCase();
    return context.read<UserProvider>().users.where((u) {
      final matchQ = u.fullName.toLowerCase().contains(q) ||
          u.email.toLowerCase().contains(q);
      final matchG = _genderFilter.isEmpty || u.gender == _genderFilter;
      return matchQ && matchG;
    }).toList();
  }

  void _showEditSheet(BuildContext context, UserModel user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _EditStaffSheet(user: user),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<UserProvider>();
    final staff = _filtered;

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
          child: Column(children: [
            SearchInput(
                hint: 'Search staff...',
                onChanged: (v) => setState(() => _query = v)),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _genderFilter,
                  decoration: InputDecoration(
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.border)),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  items: const [
                    DropdownMenuItem(value: '', child: Text('All Genders')),
                    DropdownMenuItem(value: 'Male', child: Text('Male')),
                    DropdownMenuItem(value: 'Female', child: Text('Female')),
                  ],
                  onChanged: (v) => setState(() => _genderFilter = v ?? ''),
                ),
              ),
            ]),
          ]),
        ),
        const SizedBox(height: 8),

        // Stats bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(children: [
            _StatChip(
                label: 'Total',
                value: prov.users.length,
                color: AppColors.primary),
            const SizedBox(width: 8),
            _StatChip(
                label: 'Active',
                value: prov.users.where((u) => u.status == 'Active').length,
                color: AppColors.success),
            const SizedBox(width: 8),
            _StatChip(
                label: 'Inactive',
                value: prov.users.where((u) => u.status == 'Inactive').length,
                color: AppColors.danger),
          ]),
        ),
        const SizedBox(height: 8),

        Expanded(
          child: prov.loading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary))
              : staff.isEmpty
                  ? const EmptyState(
                      message: 'No staff found', icon: Icons.people_outline)
                  : RefreshIndicator(
                      onRefresh: () => prov.fetchUsers('manager'),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: staff.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final u = staff[i];
                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border)),
                            child: Row(children: [
                              UserAvatar(
                                  avatarUrl: u.avatar != null
                                      ? '$kMediaBaseUrl${u.avatar}'
                                      : null,
                                  initials: u.initials,
                                  size: 46),
                              const SizedBox(width: 12),
                              Expanded(
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                    Text(u.fullName,
                                        style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 2),
                                    Text(u.email,
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textMuted),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis),
                                    const SizedBox(height: 4),
                                    Row(children: [
                                      StatusBadge(u.status),
                                      const SizedBox(width: 6),
                                      if (u.gender.isNotEmpty)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                              color: AppColors.surface,
                                              borderRadius:
                                                  BorderRadius.circular(999)),
                                          child: Text(u.gender,
                                              style: const TextStyle(
                                                  fontSize: 10,
                                                  color: AppColors.textMuted)),
                                        ),
                                    ]),
                                    if (u.department.isNotEmpty) ...[
                                      const SizedBox(height: 3),
                                      Text(u.department,
                                          style: const TextStyle(
                                              fontSize: 10,
                                              color: AppColors.textLight),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis),
                                    ],
                                  ])),
                              IconButton(
                                  onPressed: () => _showEditSheet(context, u),
                                  icon: const Icon(Icons.edit_outlined,
                                      size: 18, color: AppColors.textMuted)),
                            ]),
                          );
                        },
                      ),
                    ),
        ),
      ]),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  const _StatChip(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
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
  }
}

// ── Edit Staff Sheet ──────────────────────────────────────────────────────────
class _EditStaffSheet extends StatefulWidget {
  final UserModel user;
  const _EditStaffSheet({required this.user});
  @override
  State<_EditStaffSheet> createState() => _EditStaffSheetState();
}

class _EditStaffSheetState extends State<_EditStaffSheet> {
  late TextEditingController _firstName, _lastName, _email, _phone;
  late String _gender, _status;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _firstName = TextEditingController(text: widget.user.firstName);
    _lastName = TextEditingController(text: widget.user.lastName);
    _email = TextEditingController(text: widget.user.email);
    _phone = TextEditingController(text: widget.user.phone);
    _gender = widget.user.gender;
    _status = widget.user.status;
  }

  @override
  void dispose() {
    for (final c in [_firstName, _lastName, _email, _phone]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    try {
      await context.read<UserProvider>().editUser(widget.user.id, {
        'firstName': _firstName.text.trim(),
        'lastName': _lastName.text.trim(),
        'email': _email.text.trim(),
        'phone': _phone.text.trim(),
        'gender': _gender,
        'status': _status,
      });
      if (!mounted) return;
      showSnack(context, 'Staff updated successfully');
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
                    child: Text('Edit Staff',
                        style: TextStyle(
                            fontSize: 17, fontWeight: FontWeight.w700))),
                IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close)),
              ]),
              const SizedBox(height: 12),
              _field('First Name', _firstName),
              _field('Last Name', _lastName),
              _field('Email', _email, keyboard: TextInputType.emailAddress),
              _field('Phone', _phone, keyboard: TextInputType.phone),
              DropdownButtonFormField<String>(
                value: _gender.isNotEmpty ? _gender : null,
                decoration: const InputDecoration(labelText: 'Gender'),
                items: const [
                  DropdownMenuItem(value: 'Male', child: Text('Male')),
                  DropdownMenuItem(value: 'Female', child: Text('Female')),
                ],
                onChanged: (v) => setState(() => _gender = v ?? ''),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _status,
                decoration: const InputDecoration(labelText: 'Status'),
                items: const [
                  DropdownMenuItem(value: 'Active', child: Text('Active')),
                  DropdownMenuItem(value: 'Inactive', child: Text('Inactive')),
                ],
                onChanged: (v) => setState(() => _status = v ?? 'Active'),
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
                      : const Text('Save Changes'),
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
}
