import 'package:firebase_auth/firebase_auth.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../app/routes/app_routes.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../data/models/last_position.dart';
import '../../../shared/widgets/app_feedback.dart';
import 'dart:async';

class AuthController extends GetxController {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  final Rx<User?> firebaseUser = Rx<User?>(null);
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;
  final Rx<LastPosition?> lastPosition = Rx<LastPosition?>(null);
  
  StreamSubscription<DocumentSnapshot>? _userDocSubscription;

  @override
  void onInit() {
    super.onInit();
    firebaseUser.bindStream(_auth.authStateChanges());
    ever(firebaseUser, _onAuthStateChanged);
  }

  void _onAuthStateChanged(User? user) {
    _userDocSubscription?.cancel();
    if (user != null) {
      _userDocSubscription = FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .snapshots()
          .listen((snap) {
        if (snap.exists) {
          final data = snap.data() as Map<String, dynamic>;
          if (data['lastPosition'] != null) {
            lastPosition.value = LastPosition.fromMap(data['lastPosition'] as Map<String, dynamic>);
          } else {
            lastPosition.value = null;
          }
        }
      }, onError: (_) {
        // Firestore permission-denied or network errors — ignore gracefully.
        // The user doc listener will be re-established on next sign-in.
      });
    } else {
      lastPosition.value = null;
    }
  }

  @override
  void onClose() {
    _userDocSubscription?.cancel();
    super.onClose();
  }

  Future<void> login(String email, String password) async {
    try {
      isLoading.value = true;
      error.value = '';
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      _navigateAfterAuth();
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'Unable to sign in. Please check your credentials and try again.';
    } finally {
      isLoading.value = false;
    }
  }

  /// After a successful login/registration, returns to whatever protected
  /// route the user was originally trying to reach (carried via
  /// [AuthMiddleware] as the LOGIN route's arguments), falling back to HOME.
  void _navigateAfterAuth() {
    final redirectTo = Get.arguments;
    const authRoutes = {Routes.LOGIN, Routes.REGISTER, Routes.RESET_PASSWORD};
    if (redirectTo is String && redirectTo.isNotEmpty && !authRoutes.contains(redirectTo)) {
      Get.offAllNamed(redirectTo);
    } else {
      Get.offAllNamed(Routes.HOME);
    }
  }

  Future<void> register(String email, String password) async {
    try {
      isLoading.value = true;
      error.value = '';
      final cred = await _auth.createUserWithEmailAndPassword(email: email, password: password);
      
      if (cred.user != null) {
        await FirebaseFirestore.instance.collection('users').doc(cred.user!.uid).set({
          'createdAt': FieldValue.serverTimestamp(),
          'email': email,
        });
      }

      _navigateAfterAuth();
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'Unable to create account. Please check your details or try a different email.';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      isLoading.value = true;
      error.value = '';
      // Trigger our custom Next.js backend flow (which uses Resend)
      // instead of Firebase's default email sender.
      final response = await http.post(
        Uri.parse('https://rememberquran.com/api/auth/reset/request'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode >= 400 && response.statusCode != 429) {
        throw Exception('Server error: ${response.statusCode}');
      }

      Get.back();
      // Firebase Auth's email enumeration protection logic still applies to our
      // backend. We show a success message either way.
      AppFeedback.showSuccess(
        'If an account exists for $email, we\'ve sent a secure reset link. '
        'Clicking the link will securely open your mobile browser to reset your password.',
        title: 'Check Your Inbox',
      );
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'Unable to send reset email. Please ensure the email address is correct.';
    } catch (e) {
      // Anything outside FirebaseAuthException (e.g. no network/DNS
      // failure) previously propagated uncaught — the request looked like
      // it silently did nothing, since `finally` still reset isLoading but
      // error.value (what the UI actually displays) was never set.
      error.value = 'Something went wrong. Check your connection and try again.';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
    Get.offAllNamed(Routes.LOGIN);
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    final user = _auth.currentUser;
    if (user == null || user.email == null) return;
    try {
      isLoading.value = true;
      error.value = '';
      
      // Re-authenticate
      final cred = EmailAuthProvider.credential(email: user.email!, password: currentPassword);
      await user.reauthenticateWithCredential(cred);
      
      // Update password
      await user.updatePassword(newPassword);
      
      AppFeedback.showSuccess('Your password has been successfully updated.');
      Get.back(); // close dialog/screen
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'We couldn\'t update your password. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> deleteAccount(String password) async {
    final user = _auth.currentUser;
    if (user == null || user.email == null) return;
    try {
      isLoading.value = true;
      error.value = '';
      
      // 1. Re-authenticate
      final cred = EmailAuthProvider.credential(email: user.email!, password: password);
      await user.reauthenticateWithCredential(cred);
      
      final uid = user.uid;
      final db = FirebaseFirestore.instance;
      
      // 2. Wipe subcollections
      final subcollections = ['bookmarks', 'bookmarkCollections', 'notes', 'progressEvents'];
      
      for (final sub in subcollections) {
        final collectionRef = db.collection('users').doc(uid).collection(sub);
        final snapshots = await collectionRef.get();
        
        // Use batch to delete in chunks of 500 max
        if (snapshots.docs.isNotEmpty) {
          final batches = <WriteBatch>[];
          WriteBatch currentBatch = db.batch();
          int opCount = 0;
          
          for (final doc in snapshots.docs) {
            currentBatch.delete(doc.reference);
            opCount++;
            
            if (opCount == 500) {
              batches.add(currentBatch);
              currentBatch = db.batch();
              opCount = 0;
            }
          }
          if (opCount > 0) batches.add(currentBatch);
          
          for (final batch in batches) {
            await batch.commit();
          }
        }
      }
      
      // 3. Delete user document
      await db.collection('users').doc(uid).delete();
      
      // 4. Delete Auth user
      await user.delete();
      
      Get.offAllNamed(Routes.LOGIN);
      AppFeedback.showSuccess('Your account and all associated data have been permanently deleted.');
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'Unable to delete your account. Please check your connection and try again.';
    } finally {
      isLoading.value = false;
    }
  }
}
