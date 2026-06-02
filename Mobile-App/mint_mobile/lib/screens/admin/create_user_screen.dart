import 'package:flutter/material.dart';
//import 'package:provider/user_provider.dart';
import '../../api/user_api.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
import 'user_mgmt_screen.dart' show kDepartments;

class CreateUserScreen extends StatefulWidget {
  const CreateUserScreen({super.key});
  @override
  State<CreateUserScreen> createState() => _CreateUserScreenState();
}

class _CreateUserScreenState extends State<CreateUserScreen> {
  final _firstName = TextEditingController();
  final _middleName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();

  String _role = 'staff';
  String _gender = '';
  String _department = '';
  bool _showPw = false;
  bool _showConfirmPw = false;
  bool _busy = false;

  // Password rule checkers
  bool get _hasLength => _password.text.length >= 8;
  bool get _hasUpper => _password.text.contains(RegExp(r'[A-Z]'));
  bool get _hasLower => _password.text.contains(RegExp(r'[a-z]'));
  bool get _hasNumber => _password.text.contains(RegExp(r'[0-9]'));
  bool get _hasSymbol => _password.text.contains(RegExp(r'[!@#$%^&*]'));
  bool get _allPwOk =>
      _hasLength && _hasUpper && _hasLower && _hasNumber && _hasSymbol;

  @override
  void dispose() {
    for (final c in [
      _firstName,
      _middleName,
      _lastName,
      _email,
      _phone,
      _password,
      _confirmPassword,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    // Validations
    if (_firstName.text.trim().isEmpty ||
        _lastName.text.trim().isEmpty ||
        _email.text.trim().isEmpty ||
        _role.isEmpty ||
        _department.isEmpty) {
      showSnack(context, 'Please fill all required fields', isError: true);
      return;
    }
    if (!_allPwOk) {
      showSnack(context, 'Password does not meet requirements', isError: true);
      return;
    }
    if (_password.text != _confirmPassword.text) {
      showSnack(context, 'Passwords do not match', isError: true);
      return;
    }

    setState(() => _busy = true);
    try {
      await UserApi.createUser({
        'firstName': _firstName.text.trim(),
        'middleName': _middleName.text.trim(),
        'lastName': _lastName.text.trim(),
        'email': _email.text.trim().toLowerCase(),
        'phone': _phone.text.trim(),
        'password': _password.text,
        'role': _role,
        'gender': _gender,
        'department': _department,
      });
      if (!mounted) return;
      showSnack(context, 'User created successfully! 🎉');
      _clearForm();
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString().contains('already')
          ? 'Email already in use'
          : 'Failed to create user';
      showSnack(context, msg, isError: true);
    }
    setState(() => _busy = false);
  }

  void _clearForm() {
    for (final c in [
      _firstName,
      _middleName,
      _lastName,
      _email,
      _phone,
      _password,
      _confirmPassword,
    ]) {
      c.clear();
    }
    setState(() {
      _role = 'staff';
      _gender = '';
      _department = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(title: const Text('')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          // ── Personal Info ─────────────────────────────────────────
          SectionCard(
            title: 'Personal Information',
            child: Column(children: [
              // Account type
              _dropField<String>(
                label: 'Account Type *',
                value: _role,
                items: const ['staff', 'manager'],
                labels: const ['Staff', 'Manager'],
                onChanged: (v) => setState(() => _role = v ?? 'staff'),
              ),
              const SizedBox(height: 12),

              _textField('First Name *', _firstName),
              _textField('Middle Name', _middleName),
              _textField('Last Name *', _lastName),

              // Gender
              _dropField<String>(
                label: 'Gender',
                value: _gender.isNotEmpty ? _gender : null,
                items: const ['Male', 'Female'],
                labels: const ['Male', 'Female'],
                onChanged: (v) => setState(() => _gender = v ?? ''),
              ),
              const SizedBox(height: 12),

              // Department
              DropdownButtonFormField<String>(
                value: _department.isNotEmpty ? _department : null,
                decoration: _dec('Department *'),
                isExpanded: true,
                items: kDepartments
                    .map((d) => DropdownMenuItem(
                        value: d,
                        child: Text(d,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12))))
                    .toList(),
                onChanged: (v) => setState(() => _department = v ?? ''),
              ),
            ]),
          ),
          const SizedBox(height: 16),

          // ── Account Info ──────────────────────────────────────────
          SectionCard(
            title: 'Account Information',
            child: Column(children: [
              // Email
              _textField('Email *', _email,
                  keyboard: TextInputType.emailAddress,
                  prefix: const Icon(Icons.email_outlined,
                      size: 18, color: AppColors.textMuted)),

              // Phone
              _textField('Phone', _phone,
                  keyboard: TextInputType.phone,
                  prefix: const Icon(Icons.phone_outlined,
                      size: 18, color: AppColors.textMuted)),

              // Password
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: TextField(
                  controller: _password,
                  obscureText: !_showPw,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    labelText: 'Password *',
                    prefixIcon: const Icon(Icons.lock_outline,
                        size: 18, color: AppColors.textMuted),
                    suffixIcon: IconButton(
                      icon: Icon(
                          _showPw ? Icons.visibility_off : Icons.visibility,
                          size: 18,
                          color: AppColors.textMuted),
                      onPressed: () => setState(() => _showPw = !_showPw),
                    ),
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.border)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.border)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(
                            color: AppColors.primary, width: 1.5)),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                  ),
                ),
              ),

              // Password rules
              if (_password.text.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: _allPwOk
                        ? AppColors.success.withValues(alpha: 0.07)
                        : AppColors.warning.withValues(alpha: 0.07),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                        color: _allPwOk
                            ? AppColors.success.withValues(alpha: 0.3)
                            : AppColors.warning.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _pwRule('At least 8 characters', _hasLength),
                      _pwRule('One uppercase letter', _hasUpper),
                      _pwRule('One lowercase letter', _hasLower),
                      _pwRule('One number', _hasNumber),
                      _pwRule('One special symbol (!@#\$%^&*)', _hasSymbol),
                    ],
                  ),
                ),

              // Confirm password
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: TextField(
                  controller: _confirmPassword,
                  obscureText: !_showConfirmPw,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    labelText: 'Confirm Password *',
                    prefixIcon: const Icon(Icons.lock_outline,
                        size: 18, color: AppColors.textMuted),
                    suffixIcon: IconButton(
                      icon: Icon(
                          _showConfirmPw
                              ? Icons.visibility_off
                              : Icons.visibility,
                          size: 18,
                          color: AppColors.textMuted),
                      onPressed: () =>
                          setState(() => _showConfirmPw = !_showConfirmPw),
                    ),
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.border)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.border)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(
                            color: AppColors.primary, width: 1.5)),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                  ),
                ),
              ),

              // Confirm password mismatch hint
              if (_confirmPassword.text.isNotEmpty &&
                  _password.text != _confirmPassword.text)
                const Padding(
                  padding: EdgeInsets.only(bottom: 8),
                  child: Text('✖ Passwords do not match',
                      style: TextStyle(fontSize: 12, color: AppColors.danger)),
                ),
            ]),
          ),
          const SizedBox(height: 20),

          // Submit button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _busy ? null : _submit,
              child: _busy
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Create User',
                      style:
                          TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(height: 30),
        ]),
      ),
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────
  InputDecoration _dec(String label, {Widget? prefix}) => InputDecoration(
        labelText: label,
        prefixIcon: prefix,
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      );

  Widget _textField(
    String label,
    TextEditingController ctrl, {
    TextInputType keyboard = TextInputType.text,
    Widget? prefix,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: TextField(
          controller: ctrl,
          keyboardType: keyboard,
          decoration: _dec(label, prefix: prefix),
          style: const TextStyle(fontSize: 14),
        ),
      );

  Widget _dropField<T>({
    required String label,
    required T? value,
    required List<T> items,
    required List<String> labels,
    required void Function(T?) onChanged,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: DropdownButtonFormField<T>(
          value: value,
          decoration: _dec(label),
          items: List.generate(
              items.length,
              (i) => DropdownMenuItem(
                  value: items[i],
                  child:
                      Text(labels[i], style: const TextStyle(fontSize: 13)))),
          onChanged: onChanged,
        ),
      );

  Widget _pwRule(String label, bool passed) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(children: [
          Icon(
            passed ? Icons.check_circle : Icons.cancel,
            size: 14,
            color: passed ? AppColors.success : AppColors.danger,
          ),
          const SizedBox(width: 6),
          Text(label,
              style: TextStyle(
                  fontSize: 12,
                  color: passed ? AppColors.success : AppColors.danger)),
        ]),
      );
}
