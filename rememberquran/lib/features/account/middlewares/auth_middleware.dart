import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../../../app/routes/app_routes.dart';

class AuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    if (!Get.isRegistered<AuthController>()) {
      return const RouteSettings(name: Routes.LOGIN);
    }
    
    final authController = Get.find<AuthController>();
    
    if (authController.firebaseUser.value == null) {
      return const RouteSettings(name: Routes.LOGIN);
    }
    
    return null;
  }
}

class GuestMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    if (Get.isRegistered<AuthController>()) {
      final authController = Get.find<AuthController>();
      if (authController.firebaseUser.value != null) {
        return const RouteSettings(name: Routes.ACCOUNT_HOME);
      }
    }
    return null;
  }
}
