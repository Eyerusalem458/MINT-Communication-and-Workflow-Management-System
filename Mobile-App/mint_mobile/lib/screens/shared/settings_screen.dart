import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';

import '../../providers/auth_provider.dart';
import '../../api/user_api.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _firstName,
      _lastName,
      _middleName,
      _position,
      _department,
      _phone;

  final _currentPw = TextEditingController();
  final _newPw = TextEditingController();
  final _confirmPw = TextEditingController();

  bool _profileBusy = false;
  bool _pwBusy = false;

  bool _showCurrent = false;
  bool _showNew = false;
  bool _showConfirm = false;

  // local avatar preview — only set during upload, cleared after refresh
  String? _localAvatar;

  @override
  void initState() {
    super.initState();

    final user = context.read<AuthProvider>().user;

    _firstName = TextEditingController(text: user?.firstName ?? '');
    _lastName = TextEditingController(text: user?.lastName ?? '');
    _middleName = TextEditingController(text: user?.middleName ?? '');
    _position = TextEditingController(text: user?.position ?? '');
    _department = TextEditingController(text: user?.department ?? '');
    _phone = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    for (final c in [
      _firstName,
      _lastName,
      _middleName,
      _position,
      _department,
      _phone,
      _currentPw,
      _newPw,
      _confirmPw,
    ]) {
      c.dispose();
    }

    super.dispose();
  }

  // ================= PROFILE SAVE =================

  Future<void> _saveProfile() async {
    setState(() => _profileBusy = true);

    try {
      await UserApi.updateMyProfile(_buildFormData());

      // realtime refresh — also persists to storage
      await context.read<AuthProvider>().refreshUser();

      if (!mounted) return;

      showSnack(context, 'Profile updated successfully');
    } catch (e) {
      if (!mounted) return;

      showSnack(context, 'Update failed', isError: true);
    }

    setState(() => _profileBusy = false);
  }

  FormData _buildFormData() {
    return FormData.fromMap({
      'firstName': _firstName.text,
      'lastName': _lastName.text,
      'middleName': _middleName.text,
      'position': _position.text,
      'department': _department.text,
      'phone': _phone.text,
    });
  }

  // ================= PASSWORD =================

  Future<void> _changePassword() async {
    if (_newPw.text != _confirmPw.text) {
      showSnack(context, 'Passwords do not match', isError: true);
      return;
    }

    if (_currentPw.text.isEmpty || _newPw.text.isEmpty) {
      showSnack(context, 'Fill all password fields', isError: true);
      return;
    }

    setState(() => _pwBusy = true);

    try {
      await UserApi.changeMyPassword(
        _currentPw.text,
        _newPw.text,
      );

      if (!mounted) return;

      showSnack(context, 'Password changed successfully');

      _currentPw.clear();
      _newPw.clear();
      _confirmPw.clear();
    } catch (e) {
      if (!mounted) return;

      showSnack(context, 'Password change failed', isError: true);
    }

    setState(() => _pwBusy = false);
  }

  // ================= AVATAR =================

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();

    final img = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );

    if (img == null) return;

    try {
      // instant local preview while uploading
      setState(() {
        _localAvatar = img.path;
      });

      // ✅ FIX: use readAsBytes() instead of fromFile() — works on web + mobile
      final bytes = await img.readAsBytes();

      final formData = FormData.fromMap({
        'avatar': MultipartFile.fromBytes(
          bytes,
          filename: img.name,
        ),
      });

      await UserApi.updateMyProfile(formData);

      // fetch fresh user from server — saves new avatar URL to storage
      await context.read<AuthProvider>().refreshUser();

      if (!mounted) return;

      // clear local path so widget uses the persisted server URL
      setState(() {
        _localAvatar = null;
      });

      showSnack(context, 'Avatar updated successfully');
    } catch (e) {
      print('AVATAR ERROR TYPE: ${e.runtimeType}');
      print('AVATAR ERROR: $e');

      if (e is DioException) {
        print('STATUS CODE: ${e.response?.statusCode}');
        print('RESPONSE DATA: ${e.response?.data}');
        print('REQUEST PATH: ${e.requestOptions.path}');
      }

      if (!mounted) return;

      setState(() {
        _localAvatar = null;
      });

      showSnack(context, 'Avatar update failed', isError: true);
    }
  }

  // ================= UI =================

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    final initials = user?.initials ?? 'U';

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(
        title: const Text(''),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // ================= AVATAR =================

            Center(
              child: Stack(
                children: [
                  UserAvatar(
                    // _localAvatar is only non-null during an active upload
                    // once cleared, falls through to the server URL saved in storage
                    avatarUrl: _localAvatar ??
                        (user?.avatar != null
                            ? '$kMediaBaseUrl${user!.avatar}'
                            : null),
                    initials: initials,
                    size: 80,
                  ),

                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: GestureDetector(
                      onTap: _pickAvatar,
                      child: Container(
                        width: 26,
                        height: 26,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          size: 14,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            Text(
              user?.fullName ?? '',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),

            Text(
              user?.role.toUpperCase() ?? '',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.success,
                fontWeight: FontWeight.w600,
              ),
            ),

            const SizedBox(height: 20),

            // ================= PERSONAL INFO =================

            SectionCard(
              title: 'Personal Information',
              child: Column(
                children: [
                  _buildField('First Name', _firstName),
                  _buildField('Last Name', _lastName),
                  _buildField('Middle Name', _middleName),
                  _buildField('Position', _position),
                  _buildField('Department', _department),
                  _buildField(
                    'Phone',
                    _phone,
                    keyboard: TextInputType.phone,
                  ),

                  const SizedBox(height: 12),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _profileBusy ? null : _saveProfile,
                      child: _profileBusy
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text('Save Changes'),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // ================= SECURITY =================

            SectionCard(
              title: 'Security',
              child: Column(
                children: [
                  _buildPasswordField(
                    'Current Password',
                    _currentPw,
                    _showCurrent,
                    () => setState(() {
                      _showCurrent = !_showCurrent;
                    }),
                  ),

                  _buildPasswordField(
                    'New Password',
                    _newPw,
                    _showNew,
                    () => setState(() {
                      _showNew = !_showNew;
                    }),
                  ),

                  _buildPasswordField(
                    'Confirm Password',
                    _confirmPw,
                    _showConfirm,
                    () => setState(() {
                      _showConfirm = !_showConfirm;
                    }),
                  ),

                  const SizedBox(height: 12),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _pwBusy ? null : _changePassword,
                      child: _pwBusy
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text('Change Password'),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // ================= ACCOUNT INFO =================

            SectionCard(
              title: 'Account Info',
              child: Column(
                children: [
                  _infoRow('Email', user?.email ?? ''),
                  _infoRow('Role', user?.role.toUpperCase() ?? ''),
                  _infoRow('Status', user?.status ?? ''),
                  _infoRow('Department', user?.department ?? ''),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // ================= LOGOUT =================

            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(
                  Icons.logout,
                  color: AppColors.danger,
                ),
                label: const Text(
                  'Logout',
                  style: TextStyle(
                    color: AppColors.danger,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(
                    color: AppColors.danger,
                  ),
                  padding: const EdgeInsets.symmetric(
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () async {
                  await context.read<AuthProvider>().logout();

                  if (!context.mounted) return;

                  Navigator.pushNamedAndRemoveUntil(
                    context,
                    '/login',
                    (_) => false,
                  );
                },
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  // ================= HELPERS =================

  Widget _buildField(
    String label,
    TextEditingController ctrl, {
    TextInputType keyboard = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textMuted,
            ),
          ),

          const SizedBox(height: 4),

          TextField(
            controller: ctrl,
            keyboardType: keyboard,
            style: const TextStyle(fontSize: 14),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                  color: AppColors.border,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                  color: AppColors.border,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 1.5,
                ),
              ),
              filled: true,
              fillColor: AppColors.surface,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordField(
    String label,
    TextEditingController ctrl,
    bool show,
    VoidCallback toggle,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textMuted,
            ),
          ),

          const SizedBox(height: 4),

          TextField(
            controller: ctrl,
            obscureText: !show,
            style: const TextStyle(fontSize: 14),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
              suffixIcon: IconButton(
                icon: Icon(
                  show ? Icons.visibility_off : Icons.visibility,
                  size: 18,
                  color: AppColors.textMuted,
                ),
                onPressed: toggle,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                  color: AppColors.border,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                  color: AppColors.border,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 1.5,
                ),
              ),
              filled: true,
              fillColor: AppColors.surface,
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textMuted,
              ),
            ),
          ),

          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}