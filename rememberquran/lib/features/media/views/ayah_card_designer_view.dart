import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/ayah_card_designer_controller.dart';

class AyahCardDesignerView extends GetView<AyahCardDesignerController> {
  const AyahCardDesignerView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Design Ayah Card'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded),
            onPressed: controller.shareCard,
          ),
        ],
      ),
      body: Column(
        children: [
          const SizedBox(height: 40),
          Center(
            child: RepaintBoundary(
              key: controller.repaintKey,
              child: _buildCard(context),
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: FilledButton.icon(
              onPressed: controller.shareCard,
              icon: const Icon(Icons.ios_share_rounded),
              label: const Text('Share Ayah'),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: 350,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.colorScheme.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(
            Icons.format_quote_rounded,
            size: 40,
            color: Colors.black12,
          ),
          const SizedBox(height: 16),
          Text(
            controller.textUthmani,
            textAlign: TextAlign.center,
            textDirection: TextDirection.rtl,
            style: TextStyle(
              fontSize: 32,
              fontFamily: 'UthmanicHafs',
              color: theme.colorScheme.onSurface,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            controller.translation,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: theme.colorScheme.onSurfaceVariant,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: 1,
                width: 40,
                color: theme.colorScheme.primary.withOpacity(0.3),
              ),
              const SizedBox(width: 12),
              Text(
                controller.reference,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(width: 12),
              Container(
                height: 1,
                width: 40,
                color: theme.colorScheme.primary.withOpacity(0.3),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
