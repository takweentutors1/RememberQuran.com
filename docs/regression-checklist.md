# Regression Checklist

Run through these tests before signing off on Milestone 6.

## M1: Core Reading Experience
- [x] Verify all 114 surahs load correctly.
- [x] Check Arabic text rendering with Uthmani script and diacritics.
- [x] Hover/tap Arabic word shows English meaning and transliteration.
- [x] Translations toggle correctly (Saheeh Intl. vs Clear Quran).
- [x] Switching between verse-by- and continuous modes works.
- [x] Arabic font style (Hafs/Amiri) and text versesize adjustments work.
- [x] Light/Dark mode toggles and persists.
- [x] Direct linking to specific ayah (e.g., `/2/255`) scrolls to correct verse.
- [x] Copy and Share ayah buttons work.

## M2: Audio & Recitation
- [x] Audio plays correctly for all 20 reciters. (id 8, Al-Minshawi Mujawwad, removed 2026-08-14 — upstream QDC/BunnyCDN 404s on every chapter; re-add once fixed and bump back to 21)
- [x] Persistent mini player works across pages.
- [x] Word-by-word highlight syncs with audio (for supported reciters).
- [x] Click-to-hear word pronunciation works.
- [x] Repeat ayah/range works. (fixed: manual navigation during an active repeat now cancels it instead of snapping back)
- [x] Playback speed controls work.
- [x] Quran Radio (`/radio`) plays continuously. (fixed: stale/active repeat state could stall radio on one chapter forever)

## M3: Study Tools
- [x] Tafsir panel loads and displays content (5 books).
- [x] Tajweed colour coding toggles correctly on Arabic text.
- [x] Keyword search (`/search`) returns accurate Arabic/English results.
- [x] Word morphology (root, lemma, grammatical form) displays correctly on click. (fixed: ~25 grammar feature codes were leaking as raw untranslated chips, e.g. "MS"/"MP" instead of "Masculine Singular"/"Masculine Plural")
- [x] Asbab al-Nuzul (reasons for revelation) displays where available.

## M4: Accounts & Personal Features
- [x] Registration, Login, and Logout flows work.
- [x] Password reset flow works. (hardened: timing-based email enumeration fixed; sessions now revoked on password change)
- [x] Account settings (change email, password) function correctly. (hardened: email change now also revokes stale sessions, matching password change)
- [x] Adding/removing bookmarks and collections works. (fixed: closed a TOCTOU gap that could orphan a bookmark against a concurrently-deleted custom collection)
- [x] Adding/editing/deleting private per-ayah notes works. (fixed: closed a count-limit race in notes, and fully closed the same class of race in bookmarks — count check is now transactional in both)
- [x] "Continue where you left off" prompt redirects accur  ately.
- [x] Reading progress, daily goals, and streaks update correctly. (fixed: day boundary now uses the user's local timezone instead of UTC; non-contiguous reading no longer inflates the daily count)
- [x] Media Maker (`/media-maker`) generates and exports image successfully.
- [x] Reading, audio, and study features work for logged-out (guest) users.

## M5: Expansion
- [x] 10 translations load correctly.
- [x] 5 tafsir books load correctly.
- [x] "Hide Arabic" mode for memorisation testing toggles correctly.
- [x] Hifz progress tracker updates correctly by surah/juz (`/account/hifz`). (fixed: closed the same count-limit race already fixed in bookmarks/notes)
- [x] Range repeat includes pause between repetitions (for memorisation). (fixed: play/pause and scrubber seeks during a pause gap no longer leave a stray timer that yanks playback backward later)

## M6: Polish & Performance
- [x] Initial load < 3s.
- [x] Audio start < 2s.
- [x] Cross-browser testing passed.
- [x] Cross-device testing passed.
- [x] Full regression test across all milestones.
- [x] Final README with full tech stack + data sources + deployment.
