import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../app/routes/app_routes.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../data/models/last_position.dart';
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
      Get.offAllNamed(Routes.HOME);
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'An error occurred during login';
    } finally {
      isLoading.value = false;
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
      
      Get.offAllNamed(Routes.HOME);
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'An error occurred during registration';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      isLoading.value = true;
      error.value = '';
      await _auth.sendPasswordResetEmail(email: email);
      Get.back();
      Get.snackbar('Success', 'Password reset email sent to $email');
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'An error occurred during password reset';
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
      
      Get.snackbar('Success', 'Password changed successfully');
      Get.back(); // close dialog/screen
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'Failed to change password';
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
      Get.snackbar('Success', 'Account and all data deleted');
    } on FirebaseAuthException catch (e) {
      error.value = e.message ?? 'Failed to delete account';
    } finally {
      isLoading.value = false;
    }
  }
}
