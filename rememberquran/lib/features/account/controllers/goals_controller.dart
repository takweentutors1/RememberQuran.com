import 'package:get/get.dart';
import 'package:rememberquran/data/models/goal.dart';
import 'package:rememberquran/data/repositories/goals_repository.dart';
import 'package:rememberquran/features/account/controllers/auth_controller.dart';

class GoalsController extends GetxController {
  final AuthController _auth = Get.find<AuthController>();
  late GoalsRepository _goalsRepo;

  final RxBool isLoading = false.obs;
  final Rxn<GoalSnapshot> snapshot = Rxn<GoalSnapshot>();

  @override
  void onInit() {
    super.onInit();
    _goalsRepo = GoalsRepository();
    
    // Automatically load data when auth changes
    ever(_auth.firebaseUser, (_) {
      if (_auth.firebaseUser.value != null) {
        loadGoalData();
      } else {
        snapshot.value = null;
      }
    });

    if (_auth.firebaseUser.value != null) {
      loadGoalData();
    }
  }

  Future<void> loadGoalData() async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;
    
    isLoading.value = true;
    try {
      final data = await _goalsRepo.evaluateGoalAndStreak(userId);
      snapshot.value = data;
    } catch (e) {
      print('Error loading goal data: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> setGoal(GoalType type, int target) async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;

    try {
      final goal = ActiveGoal(type: type, target: target);
      await _goalsRepo.setActiveGoal(userId, goal);
      await loadGoalData();
    } catch (e) {
      Get.snackbar('Error', 'We couldn\'t save your daily goal. Please try again.');
    }
  }

  Future<void> clearGoal() async {
    final userId = _auth.firebaseUser.value?.uid;
    if (userId == null) return;

    try {
      await _goalsRepo.clearActiveGoal(userId);
      await loadGoalData();
    } catch (e) {
      Get.snackbar('Error', 'We couldn\'t remove your daily goal. Please try again.');
    }
  }
}
