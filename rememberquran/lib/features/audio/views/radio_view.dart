import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/audio_controller.dart';
import '../../../core/models/reciter.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import 'widgets/radio_art_card.dart';
import 'widgets/radio_facts.dart';

class RadioView extends StatefulWidget {
  const RadioView({super.key});

  @override
  State<RadioView> createState() => _RadioViewState();
}

class _RadioViewState extends State<RadioView> {
  final AudioController _audioController = Get.find<AudioController>();
  final QuranRepository _quranRepo = Get.find<QuranRepository>();
  
  List<Chapter> _chapters = [];
  int _selectedSurahId = 1;
  int _selectedReciterId = 7; // Mishary
  
  late Timer _factsTimer;
  final RxInt _currentFactIndex = 0.obs;

  @override
  void initState() {
    super.initState();
    _selectedSurahId = _audioController.rxCurrentSurahId.value;
    _selectedReciterId = _audioController.rxCurrentReciterId.value;
    _loadChapters();
    
    _factsTimer = Timer.periodic(const Duration(seconds: 8), (timer) {
      _currentFactIndex.value = (_currentFactIndex.value + 1) % radioFacts.length;
    });
  }
  
  @override
  void dispose() {
    _factsTimer.cancel();
    super.dispose();
  }

  Future<void> _loadChapters() async {
    final chapters = await _quranRepo.getChapters();
    setState(() {
      _chapters = chapters;
    });
  }

  void _handleMainButton() {
    final isRadio = _audioController.rxIsRadioMode.value;
    final isPlaying = _audioController.rxIsPlaying.value;
    final hasAudio = _audioController.rxHasAudio.value;
    final isCorrectSurah = _audioController.rxCurrentSurahId.value == _selectedSurahId;

    if (isRadio && hasAudio && isCorrectSurah) {
      if (isPlaying) {
        _audioController.pause();
      } else {
        _audioController.play();
      }
    } else {
      _audioController.startRadio(_selectedSurahId);
    }
  }

  void _handleSurahChange(int id) {
    setState(() => _selectedSurahId = id);
    if (_audioController.rxIsRadioMode.value) {
      _audioController.startRadio(id);
    }
  }

  void _handleReciterChange(int id) {
    setState(() {
      _selectedReciterId = id;
      _audioController.rxCurrentReciterId.value = id;
    });
    if (_audioController.rxIsRadioMode.value) {
      _audioController.startRadio(_selectedSurahId);
    }
  }

  void _showSurahPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final theme = Theme.of(context);
        final nurColors = theme.extension<NurColorsExtension>();
        final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
        
        return SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: theme.colorScheme.outline.withOpacity(0.3), borderRadius: BorderRadius.circular(2))),
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Select Surah', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: _chapters.length,
                  itemBuilder: (context, index) {
                    final c = _chapters[index];
                    final isSelected = c.id == _selectedSurahId;
                    return ListTile(
                      leading: Text('${c.id}.', style: TextStyle(color: brandGold, fontWeight: FontWeight.bold)),
                      title: Text(c.nameSimple),
                      trailing: isSelected ? Icon(Icons.check_circle, color: brandGold) : null,
                      onTap: () {
                        Navigator.pop(context);
                        _handleSurahChange(c.id);
                      },
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

  Widget _buildDownloadButton(BuildContext context) {
    return Obx(() {
      final reciterId = _selectedReciterId;
      final surahId = _selectedSurahId;
      final key = _audioController.downloadKey(reciterId, surahId);
      final progress = _audioController.rxDownloadProgress[key];
      final downloaded = _audioController.isDownloaded(reciterId, surahId);

      if (progress != null) {
        return Container(
          width: 48,
          height: 48,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: CircularProgressIndicator(
            value: progress > 0 ? progress : null,
            strokeWidth: 2,
          ),
        );
      }

      return Material(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            if (downloaded) {
              _audioController.deleteDownload(reciterId, surahId);
            } else {
              _audioController.downloadChapter(reciterId, surahId);
            }
          },
          child: Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            child: Icon(
              downloaded ? Icons.download_done_rounded : Icons.download_rounded,
              color: downloaded ? AppColors.lightBrandGold : null,
            ),
          ),
        ),
      );
    });
  }

  // --- Layout Widgets ---

  Widget _buildTopBar(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        children: [
          Text(
            "Recitation & Remembrance",
            style: theme.textTheme.titleMedium?.copyWith(
              color: brandGold,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "A blessed time for recitation",
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedBanner() {
    return Obx(() {
      final nameEn = _audioController.rxCurrentSurahName.value;
      final nameAr = _audioController.rxCurrentSurahNameArabic.value;
      final isRadio = _audioController.rxIsRadioMode.value;
      
      if (!isRadio || nameEn.isEmpty) {
        return const SizedBox(height: 60);
      }

      return AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        transitionBuilder: (Widget child, Animation<double> animation) {
          final inAnimation = Tween<Offset>(begin: const Offset(0.0, 1.0), end: Offset.zero).animate(animation);
          final outAnimation = Tween<Offset>(begin: const Offset(0.0, -1.0), end: Offset.zero).animate(animation);
          
          if (child.key == ValueKey(nameEn)) {
            return ClipRect(
              child: SlideTransition(
                position: inAnimation,
                child: FadeTransition(opacity: animation, child: child),
              ),
            );
          } else {
            return ClipRect(
              child: SlideTransition(
                position: outAnimation,
                child: FadeTransition(opacity: animation, child: child),
              ),
            );
          }
        },
        child: Container(
          key: ValueKey(nameEn),
          height: 60,
          alignment: Alignment.center,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Surah $nameEn',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(
                nameAr,
                style: TextStyle(fontSize: 14, fontFamily: 'UthmanicHafs', color: nurColors?.foregroundSubtle ?? theme.textTheme.bodySmall?.color?.withOpacity(0.5)),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildContextChips(BuildContext context) {
    return Obx(() {
      final place = _audioController.rxCurrentSurahRevelationPlace.value;
      final order = _audioController.rxCurrentSurahRevelationOrder.value;
      final verses = _audioController.rxCurrentSurahVersesCount.value;
      final juz = _audioController.rxCurrentSurahFirstJuz.value;

      if (place.isEmpty) return const SizedBox(height: 32);

      final isMakki = place.toLowerCase() == 'makkah';
      final theme = Theme.of(context);
      final nurColors = theme.extension<NurColorsExtension>();
      final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
      final brandGoldSoft = nurColors?.brandGoldSoft ?? theme.colorScheme.primaryContainer;
      
      Widget chip(String label, IconData icon, {Color? color}) {
        return Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: brandGoldSoft,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: color ?? brandGold),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: color ?? brandGold,
                ),
              ),
            ],
          ),
        );
      }

      return SizedBox(
        height: 32,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          children: [
            chip(
              isMakki ? 'Makki' : 'Madani',
              isMakki ? Icons.mosque : Icons.eco,
              color: isMakki ? Colors.orangeAccent : Colors.teal,
            ),
            chip('Revealed #$order', Icons.history),
            chip('$verses Ayahs', Icons.format_list_numbered),
            chip('Juz $juz', Icons.book),
          ],
        ),
      );
    });
  }

  Widget _buildFactsPanel(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor.withOpacity(0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.auto_awesome,
            size: 16,
            color: theme.colorScheme.primary.withOpacity(0.7),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(() {
              final index = _currentFactIndex.value;
              return AnimatedSwitcher(
                duration: const Duration(milliseconds: 800),
                child: Text(
                  radioFacts[index],
                  key: ValueKey(index),
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontStyle: FontStyle.italic,
                    height: 1.4,
                    color: nurColors?.foregroundSubtle ?? theme.textTheme.bodySmall?.color,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildPlayControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.skip_previous_rounded, size: 32),
          onPressed: () {
            final prev = _selectedSurahId > 1 ? _selectedSurahId - 1 : 114;
            _handleSurahChange(prev);
          },
        ),
        const SizedBox(width: 24),
        Obx(() {
          final isRadio = _audioController.rxIsRadioMode.value;
          final isPlaying = _audioController.rxIsPlaying.value;
          final isBusy = _audioController.rxIsBusy.value;
          
          return GestureDetector(
            onTap: isBusy ? null : _handleMainButton,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              height: 72,
              width: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Theme.of(context).colorScheme.primary,
                boxShadow: [
                  BoxShadow(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Center(
                child: isBusy
                    ? const SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(
                          color: theme.colorScheme.onPrimary,
                          strokeWidth: 3,
                        ),
                      )
                    : AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        transitionBuilder: (child, anim) => ScaleTransition(scale: anim, child: child),
                        child: Icon(
                          (!isRadio || !isPlaying) ? Icons.play_arrow_rounded : Icons.pause_rounded,
                          key: ValueKey(!isRadio || !isPlaying),
                          color: theme.colorScheme.onPrimary,
                          size: 36,
                        ),
                      ),
              ),
            ),
          );
        }),
        const SizedBox(width: 24),
        IconButton(
          icon: const Icon(Icons.skip_next_rounded, size: 32),
          onPressed: () {
            final next = _selectedSurahId < 114 ? _selectedSurahId + 1 : 1;
            _handleSurahChange(next);
          },
        ),
      ],
    );
  }

  Widget _buildReciterSelector() {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGoldSoft = nurColors?.brandGoldSoft ?? theme.colorScheme.primaryContainer;
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            'RECITER HERITAGE',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.2),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 64,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: reciters.length,
            itemBuilder: (context, index) {
              final r = reciters[index];
              final isSelected = r.id == _selectedReciterId;
              
              return GestureDetector(
                onTap: () => _handleReciterChange(r.id),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? brandGoldSoft : theme.cardColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? brandGold : theme.dividerColor.withOpacity(0.5),
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        r.name,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          color: isSelected ? brandGold : null,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Riwaya: ${r.style}',
                        style: TextStyle(
                          fontSize: 10,
                          color: isSelected ? brandGold.withOpacity(0.8) : (nurColors?.foregroundSubtle ?? theme.colorScheme.outline),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSurahSelector() {
    if (_chapters.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: AppShimmer.block(width: double.infinity, height: 48, borderRadius: 12),
      );
    }
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'START FROM',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.2),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => _showSurahPicker(context),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${_selectedSurahId}. ${_chapters.firstWhere((c) => c.id == _selectedSurahId, orElse: () => _chapters.first).nameSimple}',
                          style: const TextStyle(fontSize: 16),
                        ),
                        const Icon(Icons.arrow_drop_down),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              _buildDownloadButton(context),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              _buildTopBar(context),
              Obx(() {
                final isBusy = _audioController.rxIsBusy.value;
                final isPlaying = _audioController.rxIsPlaying.value;
                final hasError = _audioController.rxRadioFailStreak.value >= 2;

                return RadioArtCard(
                  surahId: _audioController.rxCurrentSurahId.value,
                  surahNameArabic: _audioController.rxCurrentSurahNameArabic.value.isEmpty 
                      ? '...' 
                      : _audioController.rxCurrentSurahNameArabic.value,
                  isBusy: isBusy,
                  hasError: hasError,
                  isPlaying: isPlaying,
                  onRetry: () => _audioController.startRadio(_selectedSurahId),
                );
              }),
              _buildContextChips(context),
              const SizedBox(height: 16),
              _buildAnimatedBanner(),
              const SizedBox(height: 16),
              _buildPlayControls(),
              const SizedBox(height: 24),
              _buildFactsPanel(context),
              const SizedBox(height: 24),
              _buildReciterSelector(),
              const SizedBox(height: 24),
              _buildSurahSelector(),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}
