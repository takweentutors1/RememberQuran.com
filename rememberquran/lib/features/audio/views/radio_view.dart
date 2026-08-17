import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/audio_controller.dart';
import '../../../core/models/reciter.dart';
import '../../../data/repositories/quran_repository.dart';
import '../../../data/datasources/local/quran_db.dart';
import '../../../core/theme/app_colors.dart';

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

  @override
  void initState() {
    super.initState();
    _selectedSurahId = _audioController.rxCurrentSurahId.value;
    _selectedReciterId = _audioController.rxCurrentReciterId.value;
    _loadChapters();
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

    if (isRadio && (isPlaying || _audioController.rxIsPlaying.isFalse)) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quran Radio'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Playback section
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Obx(() {
                      final isRadio = _audioController.rxIsRadioMode.value;
                      final isPlaying = _audioController.rxIsPlaying.value;
                      final isBusy = _audioController.rxIsBusy.value;
                      
                      return GestureDetector(
                        onTap: isBusy ? null : _handleMainButton,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          height: 96,
                          width: 96,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isBusy ? Colors.grey : Theme.of(context).colorScheme.primary,
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
                                ? const CircularProgressIndicator(color: Colors.white)
                                : Icon(
                                    (!isRadio || !isPlaying) ? Icons.play_arrow_rounded : Icons.pause_rounded,
                                    color: Colors.white,
                                    size: 48,
                                  ),
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 24),
                    Obx(() {
                      final isRadio = _audioController.rxIsRadioMode.value;
                      if (isRadio) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Theme.of(context).cardColor,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'Now playing: Surah ${_audioController.rxCurrentSurahId.value}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        );
                      }
                      return Text(
                        'Continuous recitation, surah after surah — from your chosen starting point to the end of the Quran and around again.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                      );
                    }),
                  ],
                ),
              ),

              // Controls section
              const Text(
                'START FROM',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.2),
              ),
              const SizedBox(height: 8),
              if (_chapters.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<int>(
                      isExpanded: true,
                      value: _selectedSurahId,
                      items: _chapters.map((c) {
                        return DropdownMenuItem(
                          value: c.id,
                          child: Text('${c.id}. ${c.nameSimple}'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) _handleSurahChange(val);
                      },
                    ),
                  ),
                )
              else
                const Center(child: CircularProgressIndicator()),
                
              const SizedBox(height: 24),
              
              const Text(
                'RECITER',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.2),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          isExpanded: true,
                          value: _selectedReciterId,
                          items: reciters.map((r) {
                            return DropdownMenuItem(
                              value: r.id,
                              child: Text('${r.name} (${r.style})'),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) _handleReciterChange(val);
                          },
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildDownloadButton(context),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
