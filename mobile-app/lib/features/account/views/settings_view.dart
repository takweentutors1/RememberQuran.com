import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../../notifications/controllers/notifications_controller.dart';
import '../../audio/controllers/audio_controller.dart';
import '../../../core/utils/responsive_layout.dart';

class SettingsView extends StatefulWidget {
  const SettingsView({Key? key}) : super(key: key);

  @override
  State<SettingsView> createState() => _SettingsViewState();
}

class _SettingsViewState extends State<SettingsView> {
  final AuthController controller = Get.find<AuthController>();

  /// Only meaningful in the master-detail (tablet/desktop) layout.
  int _selectedCategory = 0;

  static const _categories = ['Notifications', 'Playback', 'Account'];

  @override
  Widget build(BuildContext context) {
    final notifications = Get.find<NotificationsController>();
    final audio = Get.find<AudioController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ResponsiveLayout.isMobile(context)
          ? _buildFlatList(context, notifications, audio)
          : _buildMasterDetail(context, notifications, audio),
    );
  }

  /// Original single-scroll layout — unchanged behavior on phones, where a
  /// side nav would just eat space better spent on content.
  Widget _buildFlatList(
    BuildContext context,
    NotificationsController notifications,
    AudioController audio,
  ) {
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 800),
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            ..._buildNotificationsSection(context, notifications),
            const SizedBox(height: 32),
            ..._buildPlaybackSection(context, audio),
            const SizedBox(height: 32),
            ..._buildAccountSection(context),
          ],
        ),
      ),
    );
  }

  /// Category rail on the left, selected category's settings on the right
  /// — avoids a single very tall scrolling list on screens with plenty of
  /// horizontal room to spare.
  Widget _buildMasterDetail(
    BuildContext context,
    NotificationsController notifications,
    AudioController audio,
  ) {
    final sections = [
      _buildNotificationsSection(context, notifications),
      _buildPlaybackSection(context, audio),
      _buildAccountSection(context),
    ];

    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 900),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 220,
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16),
                children: [
                  for (var i = 0; i < _categories.length; i++)
                    ListTile(
                      selected: _selectedCategory == i,
                      selectedTileColor: Theme.of(
                        context,
                      ).colorScheme.primaryContainer.withValues(alpha: 0.35),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      title: Text(_categories[i]),
                      onTap: () => setState(() => _selectedCategory = i),
                    ),
                ],
              ),
            ),
            const VerticalDivider(width: 1),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: sections[_selectedCategory],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildNotificationsSection(
    BuildContext context,
    NotificationsController notifications,
  ) {
    return [
      Text(
        'Notifications',
        style: TextStyle(
          fontSize: context.responsiveBaseTextSize,
          fontWeight: FontWeight.bold,
        ),
      ),
      const SizedBox(height: 16),
      Obx(
        () => SwitchListTile(
          title: const Text('Daily Reading Reminder'),
          subtitle: Text(
            notifications.enabled.value
                ? 'Reminds you at ${_formatTime(notifications.reminderHour.value, notifications.reminderMinute.value)}'
                : 'Get a nudge to read each day',
          ),
          value: notifications.enabled.value,
          onChanged: (val) => notifications.setEnabled(val),
          contentPadding: EdgeInsets.zero,
        ),
      ),
      Obx(() {
        if (notifications.permissionDenied.value) {
          return const Padding(
            padding: EdgeInsets.only(bottom: 8.0),
            child: Text(
              "Notifications are turned off in your device settings — enable them there first.",
              style: TextStyle(color: Colors.red, fontSize: 12),
            ),
          );
        }
        return const SizedBox.shrink();
      }),
      Obx(() {
        if (!notifications.enabled.value) return const SizedBox.shrink();
        return ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.schedule_outlined),
          title: const Text('Reminder Time'),
          trailing: Text(
            _formatTime(
              notifications.reminderHour.value,
              notifications.reminderMinute.value,
            ),
          ),
          onTap: () async {
            final picked = await showTimePicker(
              context: context,
              initialTime: TimeOfDay(
                hour: notifications.reminderHour.value,
                minute: notifications.reminderMinute.value,
              ),
            );
            if (picked != null) {
              notifications.setReminderTime(picked.hour, picked.minute);
            }
          },
        );
      }),
    ];
  }

  List<Widget> _buildPlaybackSection(
    BuildContext context,
    AudioController audio,
  ) {
    return [
      Text(
        'Playback',
        style: TextStyle(
          fontSize: context.responsiveBaseTextSize,
          fontWeight: FontWeight.bold,
        ),
      ),
      const SizedBox(height: 16),
      Obx(
        () => SwitchListTile(
          title: const Text('Waveform Animation'),
          subtitle: const Text(
            'Animated bars on the Radio tab — turn off on older devices for smoother playback',
          ),
          value: audio.rxWaveformEnabled.value,
          onChanged: (val) => audio.setWaveformEnabled(val),
          contentPadding: EdgeInsets.zero,
        ),
      ),
    ];
  }

  List<Widget> _buildAccountSection(BuildContext context) {
    return [
      Text(
        'Account Settings',
        style: TextStyle(
          fontSize: context.responsiveBaseTextSize,
          fontWeight: FontWeight.bold,
        ),
      ),
      const SizedBox(height: 16),
      ListTile(
        leading: const Icon(Icons.lock_outline),
        title: const Text('Change Password'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => _showChangePasswordDialog(context),
      ),
      const Divider(),
      ListTile(
        leading: const Icon(Icons.delete_outline, color: Colors.red),
        title: const Text(
          'Delete Account',
          style: TextStyle(color: Colors.red),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.red),
        onTap: () => _showDeleteAccountDialog(context),
      ),
      const SizedBox(height: 32),
      ElevatedButton(
        onPressed: () => controller.logout(),
        child: const Text('Log Out'),
      ),
    ];
  }

  String _formatTime(int hour, int minute) {
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour % 12 == 0 ? 12 : hour % 12;
    return '$displayHour:${minute.toString().padLeft(2, '0')} $period';
  }

  void _showChangePasswordDialog(BuildContext context) {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    Get.dialog(
      AlertDialog(
        title: const Text('Change Password'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: currentPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Current Password',
                ),
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: newPasswordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'New Password'),
                validator: (val) =>
                    val == null || val.length < 6 ? 'Min 6 characters' : null,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          Obx(
            () => ElevatedButton(
              onPressed: controller.isLoading.value
                  ? null
                  : () {
                      if (formKey.currentState!.validate()) {
                        controller.changePassword(
                          currentPasswordController.text,
                          newPasswordController.text,
                        );
                      }
                    },
              child: controller.isLoading.value
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Change Password'),
            ),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    final passwordController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    Get.dialog(
      AlertDialog(
        title: Text(
          'Delete Account',
          style: TextStyle(color: Theme.of(context).colorScheme.error),
        ),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'This will permanently delete your account and all associated data, '
                'including bookmarks, notes, and reading progress. This action cannot be undone.',
                style: TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Confirm Password',
                  hintText: 'Enter your password to continue',
                ),
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
              Obx(() {
                if (controller.error.isNotEmpty) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      controller.error.value,
                      style: const TextStyle(color: Colors.red, fontSize: 12),
                    ),
                  );
                }
                return const SizedBox.shrink();
              }),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          Obx(
            () => ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              onPressed: controller.isLoading.value
                  ? null
                  : () {
                      if (formKey.currentState!.validate()) {
                        controller.deleteAccount(passwordController.text);
                      }
                    },
              child: controller.isLoading.value
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Delete Account'),
            ),
          ),
        ],
      ),
    );
  }
}
