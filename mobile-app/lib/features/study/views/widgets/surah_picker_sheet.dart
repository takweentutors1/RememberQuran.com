import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../../../../data/datasources/local/quran_db.dart';
import '../../../../data/repositories/quran_repository.dart';

class SurahPickerSheet extends StatefulWidget {
  const SurahPickerSheet({super.key});

  static Future<Chapter?> show(BuildContext context) async {
    return showResponsiveSheet<Chapter>(
      context: context,
      builder: (_) => const SurahPickerSheet(),
    );
  }

  @override
  State<SurahPickerSheet> createState() => _SurahPickerSheetState();
}

class _SurahPickerSheetState extends State<SurahPickerSheet> {
  List<Chapter> _chapters = [];
  List<Chapter> _filtered = [];
  final _searchController = TextEditingController();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChapters();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadChapters() async {
    final repo = Get.find<QuranRepository>();
    final chapters = await repo.getChapters();
    setState(() {
      _chapters = chapters;
      _filtered = chapters;
      _isLoading = false;
    });
  }

  void _filterChapters(String query) {
    setState(() {
      if (query.isEmpty) {
        _filtered = _chapters;
      } else {
        final q = query.toLowerCase();
        _filtered = _chapters.where((c) {
          return c.nameSimple.toLowerCase().contains(q) ||
              c.nameArabic.contains(query) ||
              c.id.toString() == q;
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
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
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Select Surah',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  controller: _searchController,
                  onChanged: _filterChapters,
                  decoration: InputDecoration(
                    hintText: 'Search surah name or number...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              const Divider(height: 1),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ListView.builder(
                        controller: scrollController,
                        itemCount: _filtered.length,
                        itemBuilder: (context, index) {
                          final chapter = _filtered[index];
                          return ListTile(
                            leading: Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Theme.of(context)
                                    .colorScheme
                                    .primaryContainer
                                    .withValues(alpha: 0.5),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '${chapter.id}',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                            ),
                            title: Text(
                              chapter.nameSimple,
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text(
                              '${chapter.versesCount} verses • ${chapter.revelationPlace.toUpperCase()}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSurfaceVariant,
                              ),
                            ),
                            trailing: Text(
                              chapter.nameArabic,
                              style: const TextStyle(
                                fontSize: 18,
                                fontFamily: 'Amiri',
                              ),
                            ),
                            onTap: () => Navigator.of(context).pop(chapter),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}
