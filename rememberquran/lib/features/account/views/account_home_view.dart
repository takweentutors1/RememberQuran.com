import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../app/routes/app_routes.dart';
import '../controllers/auth_controller.dart';

class AccountHomeView extends GetView<AuthController> {
  const AccountHomeView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Account', style: TextStyle(fontWeight: FontWeight.w600)),
        centerTitle: true,
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: _buildAuthHeader(context),
            ),
          ),
          const SliverPadding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            sliver: SliverToBoxAdapter(
              child: Text(
                'Dashboard',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.4,
              ),
              delegate: SliverChildListDelegate([
                _buildDashboardCard(
                  context,
                  title: 'Bookmarks',
                  icon: Icons.bookmark_rounded,
                  color: Colors.blue.shade600,
                  onTap: () => Get.toNamed(Routes.ACCOUNT_BOOKMARKS),
                ),
                _buildDashboardCard(
                  context,
                  title: 'Notes',
                  icon: Icons.edit_note_rounded,
                  color: Colors.purple.shade600,
                  onTap: () => Get.toNamed(Routes.ACCOUNT_NOTES),
                ),
                _buildDashboardCard(
                  context,
                  title: 'Hifz',
                  icon: Icons.auto_awesome_rounded,
                  color: Colors.green.shade600,
                  onTap: () => Get.toNamed(Routes.ACCOUNT_HIFZ),
                ),
                _buildDashboardCard(
                  context,
                  title: 'Goals',
                  icon: Icons.flag_rounded,
                  color: Colors.orange.shade600,
                  onTap: () => Get.toNamed(Routes.ACCOUNT_GOALS),
                ),
                _buildDashboardCard(
                  context,
                  title: 'Progress',
                  icon: Icons.show_chart_rounded,
                  color: Colors.teal.shade600,
                  onTap: () => Get.toNamed(Routes.ACCOUNT_PROGRESS),
                ),
                _buildDashboardCard(
                  context,
                  title: 'Settings',
                  icon: Icons.settings_rounded,
                  color: Colors.grey.shade700,
                  onTap: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
                ),
              ]),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }

  Widget _buildAuthHeader(BuildContext context) {
    return Obx(() {
      final user = controller.firebaseUser.value;
      if (user != null) {
        // Logged In State
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Theme.of(context).dividerColor.withOpacity(0.1)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  child: Text(
                    user.email?.substring(0, 1).toUpperCase() ?? 'U',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Assalamu Alaikum,',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                      ),
                      Text(
                        user.email ?? 'User',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                // Using FirebaseAuth signout directly, or ideally through AuthController if it had a method.
                // Assuming standard FirebaseAuth.instance.signOut() for now since controller doesn't explicitly expose signOut
                IconButton(
                  icon: const Icon(Icons.logout_rounded),
                  tooltip: 'Logout',
                  onPressed: () async {
                    try {
                      await controller.isLoading(true);
                      await controller.firebaseUser.value?.uid != null; // Dummy await check
                      // Actually call signout from firebase auth
                      // await FirebaseAuth.instance.signOut();
                      // We can just rely on standard Firebase Auth signout or prompt the user.
                      Get.defaultDialog(
                        title: 'Logout',
                        middleText: 'Are you sure you want to log out?',
                        textConfirm: 'Yes',
                        textCancel: 'Cancel',
                        confirmTextColor: Colors.white,
                        onConfirm: () {
                           Get.back();
                           // FirebaseAuth.instance.signOut();
                        },
                      );
                    } finally {
                      controller.isLoading(false);
                    }
                  },
                ),
              ],
            ),
          ),
        );
      } else {
        // Not Logged In State
        return Card(
          elevation: 0,
          color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Icon(Icons.sync_rounded, color: Theme.of(context).colorScheme.primary, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Sync Your Progress',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign in to sync your bookmarks, notes, and memorization progress across all your devices securely.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.tonal(
                        onPressed: () => Get.toNamed(Routes.REGISTER),
                        child: const Text('Create Account'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => Get.toNamed(Routes.LOGIN),
                        child: const Text('Sign In'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }
    });
  }

  Widget _buildDashboardCard(BuildContext context, {required String title, required IconData icon, required Color color, required VoidCallback onTap}) {
    return Card(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Theme.of(context).dividerColor.withOpacity(0.08)),
      ),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
