import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../../../app/routes/app_routes.dart';

class AuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    if (!Get.isRegistered<AuthController>()) {
      return RouteSettings(name: Routes.LOGIN, arguments: route);
    }

    final authController = Get.find<AuthController>();

    if (authController.firebaseUser.value == null) {
      // Carry the originally-requested route so a successful login can
      // return the user there instead of always landing on HOME.
      return RouteSettings(name: Routes.LOGIN, arguments: route);
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
