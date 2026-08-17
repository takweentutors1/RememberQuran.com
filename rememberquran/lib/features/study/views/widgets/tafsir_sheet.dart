import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/tafsir_controller.dart';
import '../../../../shared/widgets/loading_skeleton.dart';

class TafsirSheet extends StatefulWidget {
  final int surahId;
  final int ayahId;

  const TafsirSheet({
    Key? key,
    required this.surahId,
    required this.ayahId,
  }) : super(key: key);

  static void show(BuildContext context, int surahId, int ayahId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TafsirSheet(surahId: surahId, ayahId: ayahId),
    );
  }

  @override
  State<TafsirSheet> createState() => _TafsirSheetState();
}

class _TafsirSheetState extends State<TafsirSheet> {
  final TafsirController _controller = Get.put(TafsirController());

  @override
  void initState() {
    super.initState();
    _controller.loadTafsir(widget.surahId, widget.ayahId);
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
              
              // Header & Dropdown
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Tafsir', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    Obx(() {
                      return DropdownButton<String>(
                        value: _controller.rxCurrentSlug.value,
                        underline: const SizedBox(),
                        items: _controller.availableTafsirs.map((t) {
                          return DropdownMenuItem<String>(
                            value: t['slug']!,
                            child: Text(t['name']!),
                          );
                        }).toList(),
                        onChanged: (slug) {
                          if (slug != null) {
                            _controller.changeTafsirBook(slug);
                          }
                        },
                      );
                    }),
                  ],
                ),
              ),
              const Divider(),
              
              // Content
              Expanded(
                child: Obx(() {
                  if (_controller.rxIsLoading.value) {
                    return Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          AppShimmer.block(width: double.infinity, height: 16),
                          const SizedBox(height: 8),
                          AppShimmer.block(width: double.infinity, height: 16),
                          const SizedBox(height: 8),
                          AppShimmer.block(width: 200, height: 16),
                        ],
                      ),
                    );
                  }
                  if (_controller.rxError.value != null) {
                    final isNotFound = _controller.rxError.value!.contains('No Tafsir');
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
                  final data = _controller.rxTafsirData.value;
                  if (data == null) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.hourglass_empty_rounded, size: 48, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.2)),
                          const SizedBox(height: 16),
                          const Text('No Tafsir found.', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    );
                  }

                  // Tafsir payload usually has:
                  // { "tafsir": { "text": "...", "resource_name": "..." } } 
                  // or similar based on QDC structure.
                  // Vercel API sanitizes it to raw HTML.
                  final text = data['text'] ?? data['tafsir']?['text'] ?? '';
                  final author = data['author_name'] ?? data['tafsir']?['resource_name'] ?? '';

                  return ListView(
                    controller: scrollController,
                    padding: const EdgeInsets.all(20),
                    children: [
                      if (author.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Text(author, style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.grey)),
                        ),
                      
                      // For now, render HTML manually or strip it if no package
                      // The Vercel API provides HTML strings
                      // Since we can't be sure flutter_html is installed, we can strip tags for basic safety, 
                      // but typically QDC tafsirs have bold/paragraphs. Let's try flutter_html if it exists,
                      // otherwise we strip HTML and render as normal text.
                      // Wait, I shouldn't guess. I'll just remove tags manually as a safe baseline, 
                      // or if I can check pubspec for flutter_html, I'd use that.
                      // Let's use simple string replacement to strip HTML tags for this first iteration to guarantee compilation.
                      Text(
                        _stripHtmlTags(text),
                        style: const TextStyle(fontSize: 16, height: 1.6),
                      ),
                    ],
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
    // Simple regex to remove HTML tags
    RegExp exp = RegExp(r"<[^>]*>", multiLine: true, caseSensitive: true);
    return htmlString.replaceAll(exp, '').replaceAll('&nbsp;', ' ');
  }
}
