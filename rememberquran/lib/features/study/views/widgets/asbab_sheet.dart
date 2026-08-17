import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/asbab_controller.dart';

class AsbabSheet extends StatefulWidget {
  final int surahId;
  final int ayahId;

  const AsbabSheet({
    super.key,
    required this.surahId,
    required this.ayahId,
  });

  static void show(BuildContext context, int surahId, int ayahId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AsbabSheet(surahId: surahId, ayahId: ayahId),
    );
  }

  @override
  State<AsbabSheet> createState() => _AsbabSheetState();
}

class _AsbabSheetState extends State<AsbabSheet> {
  final AsbabController _controller = Get.put(AsbabController());

  @override
  void initState() {
    super.initState();
    _controller.loadAsbab(widget.surahId, widget.ayahId);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(context).dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 12),
              
              // Header
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Text('Asbab al-Nuzul', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    Spacer(),
                    Text('Reasons for Revelation', style: TextStyle(fontSize: 14, color: Colors.grey)),
                  ],
                ),
              ),
              const Divider(),
              
              // Content
              Expanded(
                child: Obx(() {
                  if (_controller.rxIsLoading.value) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (_controller.rxError.value != null) {
                    final isNotFound = _controller.rxError.value!.contains('No Asbab');
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              isNotFound ? Icons.menu_book_rounded : Icons.error_outline_rounded,
                              size: 64,
                              color: isNotFound 
                                  ? Theme.of(context).colorScheme.onSurface.withOpacity(0.2)
                                  : Theme.of(context).colorScheme.error.withOpacity(0.8),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              isNotFound ? 'No Record Found' : 'Oops!',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              _controller.rxError.value!,
                              style: TextStyle(
                                color: isNotFound 
                                    ? Theme.of(context).colorScheme.onSurface.withOpacity(0.6)
                                    : Theme.of(context).colorScheme.error, 
                                fontSize: 16,
                                height: 1.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  final data = _controller.rxAsbabData.value;
                  if (data == null) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.hourglass_empty_rounded, size: 48, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.2)),
                          const SizedBox(height: 16),
                          const Text('No data found.', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    );
                  }

                  // Parse the actual Asbab API response
                  // QDC Asbab payload usually has { "asbabs": [ { "text": "...", "author_name": "..." }, ... ] }
                  final asbabs = data['asbabs'] as List<dynamic>? ?? [];
                  
                  if (asbabs.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.menu_book_rounded,
                              size: 64,
                              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.2),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              'No Record Found',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'No Asbab al-Nuzul recorded for this verse.',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6), 
                                fontSize: 16,
                                height: 1.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return ListView.separated(
                    controller: scrollController,
                    padding: const EdgeInsets.all(20),
                    itemCount: asbabs.length,
                    separatorBuilder: (_, __) => const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Divider(),
                    ),
                    itemBuilder: (_, index) {
                      final item = asbabs[index] as Map<String, dynamic>;
                      final text = item['text'] ?? '';
                      final author = item['author_name'] ?? item['source'] ?? '';
                      
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (author.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Text(
                                author, 
                                style: const TextStyle(
                                  fontStyle: FontStyle.italic, 
                                  color: Colors.grey,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          Text(
                            _stripHtmlTags(text),
                            style: const TextStyle(fontSize: 16, height: 1.6),
                          ),
                        ],
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        );
      },
    );
  }

  String _stripHtmlTags(String htmlString) {
    RegExp exp = RegExp(r"<[^>]*>", multiLine: true, caseSensitive: true);
    return htmlString.replaceAll(exp, '').replaceAll('&nbsp;', ' ');
  }
}
