import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../controllers/audio_controller.dart';
import '../../../core/models/reciter.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/loading_skeleton.dart';
import 'widgets/radio_art_card.dart';
import 'widgets/radio_facts.dart';
import '../../../core/utils/responsive_layout.dart';

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
  bool _isPlayPressed = false;

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
    HapticFeedback.lightImpact();
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
    HapticFeedback.lightImpact();
    setState(() => _selectedSurahId = id);
    if (_audioController.rxIsRadioMode.value) {
      _audioController.startRadio(id);
    }
  }

  void _handleReciterChange(int id) {
    HapticFeedback.lightImpact();
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
            color: Theme.of(context).extension<NurColorsExtension>()?.brandGold ?? Theme.of(context).colorScheme.primary,
          ),
        );
      }

      return Material(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            HapticFeedback.lightImpact();
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
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Recitation & Remembrance",
                style: theme.textTheme.titleMedium?.copyWith(
                  color: brandGold,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                "A blessed time for recitation",
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                ),
              ),
            ],
          ),
          _buildDownloadButton(context),
        ],
      ),
    );
  }

  Widget _buildTrackInfo(BuildContext context) {
    return Obx(() {
      final nameEn = _audioController.rxCurrentSurahName.value;
      final nameAr = _audioController.rxCurrentSurahNameArabic.value;
      
      if (nameEn.isEmpty) return const SizedBox(height: 80);

      return Column(
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            child: Text(
              'Surah $nameEn',
              key: ValueKey(nameEn),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
          ),
          const SizedBox(height: 4),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            child: Text(
              nameAr,
              key: ValueKey(nameAr),
              style: TextStyle(
                fontSize: 20, 
                fontFamily: 'UthmanicHafs', 
                color: Theme.of(context).colorScheme.primary.withOpacity(0.7),
              ),
            ),
          ),
          const SizedBox(height: 16),
          _buildContextChips(context),
        ],
      );
    });
  }

  Widget _buildContextChips(BuildContext context) {
    final place = _audioController.rxCurrentSurahRevelationPlace.value;
    final verses = _audioController.rxCurrentSurahVersesCount.value;
    final juz = _audioController.rxCurrentSurahFirstJuz.value;

    if (place.isEmpty) return const SizedBox(height: 32);

    final isMakki = place.toLowerCase() == 'makkah';
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
    final brandGoldSoft = nurColors?.brandGoldSoft ?? theme.colorScheme.primaryContainer;
    
    Widget chip(String label, IconData icon) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: brandGoldSoft.withOpacity(0.5),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: brandGold.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: brandGold),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: brandGold),
            ),
          ],
        ),
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        chip(isMakki ? 'Makki' : 'Madani', isMakki ? Icons.mosque : Icons.eco),
        chip('$verses Ayahs', Icons.format_list_numbered),
        chip('Juz $juz', Icons.book),
      ],
    );
  }

  Widget _buildPlayControls(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: Icon(Icons.skip_previous_rounded, size: 40, color: theme.iconTheme.color?.withOpacity(0.7)),
          onPressed: () {
            HapticFeedback.lightImpact();
            final prev = _selectedSurahId > 1 ? _selectedSurahId - 1 : 114;
            _handleSurahChange(prev);
          },
        ),
        const SizedBox(width: 32),
        Obx(() {
          final isRadio = _audioController.rxIsRadioMode.value;
          final isPlaying = _audioController.rxIsPlaying.value;
          final isBusy = _audioController.rxIsBusy.value;
          
          return GestureDetector(
            onTapDown: isBusy ? null : (_) => setState(() => _isPlayPressed = true),
            onTapUp: isBusy ? null : (_) {
              setState(() => _isPlayPressed = false);
              _handleMainButton();
            },
            onTapCancel: isBusy ? null : () => setState(() => _isPlayPressed = false),
            child: AnimatedScale(
              scale: _isPlayPressed ? 0.9 : 1.0,
              duration: const Duration(milliseconds: 100),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                height: 80,
                width: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: brandGold,
                  boxShadow: [
                    BoxShadow(
                      color: brandGold.withOpacity(isPlaying ? 0.4 : 0.2),
                      blurRadius: isPlaying ? 20 : 12,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: isBusy
                      ? SizedBox(
                          width: 32,
                          height: 32,
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
                            size: 44,
                          ),
                        ),
                ),
              ),
            ),
          );
        }),
        const SizedBox(width: 32),
        IconButton(
          icon: Icon(Icons.skip_next_rounded, size: 40, color: theme.iconTheme.color?.withOpacity(0.7)),
          onPressed: () {
            HapticFeedback.lightImpact();
            final next = _selectedSurahId < 114 ? _selectedSurahId + 1 : 1;
            _handleSurahChange(next);
          },
        ),
      ],
    );
  }

  Widget _buildBottomSheetButtons(BuildContext context) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => _showReciterPicker(context),
              borderRadius: BorderRadius.circular(24),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: theme.cardColor,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: theme.dividerColor.withOpacity(0.5)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.person_rounded, size: 18, color: theme.colorScheme.primary),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        reciters.firstWhere((r) => r.id == _selectedReciterId).name,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: InkWell(
              onTap: () => _showSurahPicker(context),
              borderRadius: BorderRadius.circular(24),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: theme.cardColor,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: theme.dividerColor.withOpacity(0.5)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.menu_book_rounded, size: 18, color: theme.colorScheme.primary),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        _chapters.isEmpty ? 'Select Surah' : _chapters.firstWhere((c) => c.id == _selectedSurahId, orElse: () => _chapters.first).nameSimple,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showReciterPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final theme = Theme.of(context);
        final nurColors = theme.extension<NurColorsExtension>();
        final brandGold = nurColors?.brandGold ?? theme.colorScheme.primary;
        
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: theme.colorScheme.outline.withOpacity(0.3), borderRadius: BorderRadius.circular(2))),
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Select Reciter', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: reciters.length,
                  itemBuilder: (context, index) {
                    final r = reciters[index];
                    final isSelected = r.id == _selectedReciterId;
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isSelected ? brandGold.withOpacity(0.2) : theme.cardColor,
                        child: Icon(Icons.person, color: isSelected ? brandGold : theme.iconTheme.color),
                      ),
                      title: Text(r.name, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                      subtitle: Text('Riwaya: ${r.style}', style: const TextStyle(fontSize: 12)),
                      trailing: isSelected ? Icon(Icons.check_circle, color: brandGold) : null,
                      onTap: () {
                        Navigator.pop(context);
                        _handleReciterChange(r.id);
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

  Widget _buildFactsPanel(BuildContext context) {
    final theme = Theme.of(context);
    final nurColors = theme.extension<NurColorsExtension>();
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor.withOpacity(0.6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.auto_awesome, size: 16, color: theme.colorScheme.primary.withOpacity(0.7)),
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final nurColors = theme.extension<NurColorsExtension>();
    
    return Scaffold(
      body: Stack(
        children: [
          // Subtle full-screen animated background
          Positioned.fill(
            child: Obx(() {
              final isPlaying = _audioController.rxIsPlaying.value;
              return AnimatedContainer(
                duration: const Duration(seconds: 2),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      if (isPlaying) 
                        (nurColors?.brandGoldSoft ?? theme.colorScheme.primaryContainer).withOpacity(isDark ? 0.2 : 0.4)
                      else
                        theme.scaffoldBackgroundColor,
                      theme.scaffoldBackgroundColor,
                    ],
                  ),
                ),
              );
            }),
          ),
          
          SafeArea(
            child: ResponsiveLayout(
              mobile: _buildMobileLayout(context),
              desktop: _buildDesktopLayout(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Column(
      children: [
        _buildTopBar(context),
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
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
              const SizedBox(height: 24),
              _buildTrackInfo(context),
            ],
          ),
        ),
        _buildPlayControls(context),
        const SizedBox(height: 32),
        _buildFactsPanel(context),
        const SizedBox(height: 8),
        _buildBottomSheetButtons(context),
      ],
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 1,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildTopBar(context),
              const Spacer(),
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
              const SizedBox(height: 32),
              _buildTrackInfo(context),
              const Spacer(),
            ],
          ),
        ),
        const VerticalDivider(width: 1, thickness: 1),
        Expanded(
          flex: 1,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              _buildPlayControls(context),
              const SizedBox(height: 64),
              _buildFactsPanel(context),
              const SizedBox(height: 32),
              _buildBottomSheetButtons(context),
              const Spacer(),
            ],
          ),
        ),
      ],
    );
  }
}

