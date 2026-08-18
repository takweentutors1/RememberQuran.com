import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../../notifications/controllers/notifications_controller.dart';

class SettingsView extends GetView<AuthController> {
  const SettingsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final notifications = Get.find<NotificationsController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              const Text(
                'Notifications',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Obx(() => SwitchListTile(
                title: const Text('Daily Reading Reminder'),
                subtitle: Text(
                  notifications.enabled.value
                      ? 'Reminds you at ${_formatTime(notifications.reminderHour.value, notifications.reminderMinute.value)}'
                      : 'Get a nudge to read each day',
                ),
                value: notifications.enabled.value,
                onChanged: (val) => notifications.setEnabled(val),
                contentPadding: EdgeInsets.zero,
              )),
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
                  trailing: Text(_formatTime(notifications.reminderHour.value, notifications.reminderMinute.value)),
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
              const SizedBox(height: 32),

              const Text(
                'Account Settings',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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
                title: const Text('Delete Account', style: TextStyle(color: Colors.red)),
                trailing: const Icon(Icons.chevron_right, color: Colors.red),
                onTap: () => _showDeleteAccountDialog(context),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => controller.logout(),
                child: const Text('Log Out'),
              )
            ],
          ),
        ),
      ),
    );
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
                decoration: const InputDecoration(labelText: 'Current Password'),
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: newPasswordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'New Password'),
                validator: (val) => val == null || val.length < 6 ? 'Min 6 characters' : null,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          Obx(() => ElevatedButton(
            onPressed: controller.isLoading.value ? null : () {
              if (formKey.currentState!.validate()) {
                controller.changePassword(
                  currentPasswordController.text,
                  newPasswordController.text,
                );
              }
            },
            child: controller.isLoading.value 
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Change Password'),
          )),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    final passwordController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    Get.dialog(
      AlertDialog(
        title: const Text('Delete Account', style: TextStyle(color: Colors.red)),
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
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
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
          Obx(() => ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: controller.isLoading.value ? null : () {
              if (formKey.currentState!.validate()) {
                controller.deleteAccount(passwordController.text);
              }
            },
            child: controller.isLoading.value 
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Delete Account'),
          )),
        ],
      ),
    );
  }
}
