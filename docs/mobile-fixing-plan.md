# Mobile App (RQM) Fixing Plan

Source: `docs/QA_Tracker_RememberQuran_Mobile - QA Tracker.pdf` (RQM-01–RQM-19),
analyzed against the actual Flutter codebase at `rememberquran/`. No code was
changed for this pass — this is analysis only, produced by three parallel
codebase investigations plus one direct follow-up check (RQM-08), covering
every item with file:line evidence.

**Headline finding:** this tracker is noisier than the web one. Six items are
already fully implemented and working — the tracker calling them "Open" looks
like it was written from an earlier build or a partial test pass, not the
current code. Three more are *mostly* correct with one small real gap each.
Ten are genuine bugs or missing features. None of the "Already implemented"
verdicts below are guesses — each cites the actual file and logic that proves
it works.

A recurring pattern worth flagging on its own: **the codebase has a lot of
0-byte dead stub files** sitting alongside working implementations —
`lib/features/study/views/tafsir_view.dart`, `word_detail_view.dart`,
`lib/features/media_maker/` (the whole folder — the real Media Maker lives in
the sibling `lib/features/media/`), `lib/features/audio/widgets/reciter_selector.dart`,
`repeat_controls.dart`, `speed_control.dart`, `lib/data/models/morphology_entry.dart`,
`lib/data/datasources/local/prefs_ds.dart`, `lib/data/models/streak.dart`. These
look like an initial scaffold (`fc4da88 Add RememberQuran Flutter app — full
feature implementation`) that was partially superseded by later real
implementations without the stubs being deleted. Worth a cleanup pass
independent of this tracker — they make the codebase harder to navigate and
at least one of them (`morphology_entry.dart`) is sitting right next to data
that's already bundled and ready to use (see RQM-12).

---

## Already implemented — no code change needed

### RQM-03 — Surah index shows only 8 of 114 surahs
**Not an actual bug.** `home_controller.dart:23-33` loads all chapters with no
limit; `quran_repository.dart:27-37` and the remote datasource hit
`api.quran.com/api/v4/chapters` unpaginated; both grid and list views key
`itemCount` off `controller.chapters.length`. The only "8" anywhere in the
codebase is `AppShimmer.surahList(count: 8)` — a **loading skeleton** shown
while `isLoading && chapters.isEmpty`. This was almost certainly a testing
screenshot taken during the loading state, not a real data limit.

### RQM-04 — No way to jump directly to a specific ayah
**Already built.** `lib/features/reader/views/widgets/quick_jump_sheet.dart`,
opened from the reader's AppBar search icon, accepts both a typed `surah:ayah`
pattern (validated against the chapter's real ayah count) and a tap-through
surah→ayah grid, navigating via `Routes.SURAH_AYAH`.

### RQM-07 — Continuous full-surah playback missing
**Already true by construction.** Each chapter loads as one continuous audio
file (`_loadAndPlayChapter()`, one `MediaItem` per chapter); tapping any ayah's
play button seeks into that file and plays through to the end. There's no
separate "continue to next ayah" logic needed because there's no per-ayah
audio file to begin with.

### RQM-10 — Playback speed control missing
**Already built.** `audio_player_sheet.dart:363-378` — a segmented control for
0.5x/1x/1.5x/2x, wired to `AudioController.setSpeed()` → the real player. The
QA report's example (0.75x) isn't one of the offered steps, but the feature
itself works; adding a 0.75x option is a one-line change if wanted, not a bug.

### RQM-11 — Tafsir missing entirely
**Already built, fully wired.** `tafsir_remote_ds.dart` calls the same
`/api/tafsir/...` endpoint the web app uses; `tafsir_controller.dart` exposes
all 5 books; `tafsir_sheet.dart` renders it with book selection, loading,
error, and empty states; it's opened from every ayah's action row in
`ayah_block.dart`. (The dead `tafsir_view.dart` stub mentioned above is not
what's actually used — don't be misled by it.)

### RQM-13 — Reasons for revelation missing
**Already built, same pattern as tafsir.** `asbab_remote_ds.dart` checks a
bundled coverage index before hitting the network (so "no asbab for this
ayah" shows instantly without a round-trip), `asbab_controller.dart` and
`asbab_sheet.dart` handle the full flow, wired from `ayah_block.dart`.

---

## Mostly correct — one real gap each, needs a small fix to fully close

### RQM-01 — Notes/bookmarks persistence after logout: contradictory findings
**The contradiction has an explanation, and there's one real bug underneath
it.** This is not local-device storage — notes and bookmarks live entirely in
Firestore under `users/{userId}/...`, and `logout()` only calls
`FirebaseAuth.signOut()` — it never touches Firestore data. So: logging back
into the *same account* will always correctly show the same data (that's
correct behavior, not a bug), while checking the UI screen immediately after
logout (before signing back in) will correctly show empty lists. Both testers
were probably right about what they saw; the "contradiction" is two different,
both-valid, scenarios.

**The real bug:** `NotesController` has an auth-state listener
(`notes_controller.dart:33-35`, `_authSubscription = _authController.firebaseUser.listen(...)`)
that reloads on login/logout. **`BookmarksController` has no such listener** —
it only loads once in `onInit()`. If that controller instance survives a
logout (e.g. it isn't disposed by GetX's binding lifecycle on every
navigation path), it could keep showing the previous user's bookmarks/collections
until something forces a rebuild. **Fix:** add the same `ever(_auth.firebaseUser, ...)`
pattern to `BookmarksController` that `NotesController` already has.

### RQM-14 — Password reset email not arriving
**The code is correct.** `resetPassword()` calls Firebase Auth's real
`sendPasswordResetEmail` directly (not a custom backend — the mobile app
doesn't share the web app's `/api/auth/reset/request` endpoint at all), with
proper `FirebaseAuthException` handling and a success snackbar.

**Most likely actual cause, outside the code:** Firebase's default "email
enumeration protection" makes `sendPasswordResetEmail` return success even for
an email with no account — so the in-app success message doesn't prove an
email was actually sent. Check the Firebase console: email templates enabled,
sender domain/SPF/DKIM configured, and whether the test email actually has an
account. **One real (minor) code gap:** the catch clause only handles
`FirebaseAuthException` — a network error (e.g. `SocketException`) would
propagate unhandled instead of showing a friendly error, worth a broader
`catch (e)` fallback.

### RQM-17 — Reading streak doesn't update
**The pipeline is fully wired end-to-end and looks correct.** Scroll-dwell
detection → debounced progress events → Firestore → streak evaluation
(same-day/yesterday/gap logic) → display on the Goals screen — all present
and connected, not a stub.

**Two real UX gaps that could easily read as "doesn't update" in testing:**
1. Streak tracking only activates once a user has set an *active goal* — if a
   tester never opened Goals → "Create Goal" first, the streak will correctly
   stay at zero forever, not because tracking is broken but because there's
   nothing to track against.
2. The streak is recalculated lazily (on screen load, auth change, or
   pull-to-refresh), not via a live Firestore listener — so it won't visibly
   tick up while sitting on the Goals screen mid-session. Navigating away and
   back is required to see the update.

Neither is a defect exactly, but both are worth either fixing (add a live
listener; prompt for a goal earlier) or explicitly re-testing with a goal set
before treating this as resolved.

---

## Real gaps and bugs — need actual implementation work

### RQM-02 — Surah auto-advance shows an error and skips a surah
**Partially fixed already, one bug remains.** A prior infinite-skip-loop bug
(instantly-completing broken audio sources looping forever) was already fixed
in commit `d6b47bb`. But `_onPlaybackCompleted()` has **no debounce/re-entrancy
guard** — `just_audio`'s event stream can re-emit while `processingState` is
still `completed` during the multi-`await` chapter-load sequence, and each
re-emission re-enters the advance logic, which can visibly skip a surah (the
reported "1 to 3, missing 2"). **Fix location:** `audio_controller.dart`,
around the `playbackState.listen`/`_onPlaybackCompleted()` block — add a busy
flag or edge-detect the completed transition before calling `advanceRadio()`.

### RQM-05 — No previous/next surah buttons
**Confirmed missing.** The reader's AppBar only has Quick Jump and Settings
icons — no prev/next control. Radio mode has its own skip-surah logic
(`radioSkipToPrevious`/`radioSkipToNext`) that's audio-only and unrelated to
text navigation. **Fix location:** add prev/next `IconButton`s to
`surah_reader_view.dart`'s AppBar `actions`, wrapping 1↔114.

### RQM-06 — Reciter selection unavailable in reading mode
**Confirmed missing.** The only reciter picker in the app is a private method
inside `RadioView`. The reading-mode "Now Playing" sheet only *displays* the
current reciter's name as static text with no way to change it. **Fix
location:** the empty `lib/features/audio/widgets/reciter_selector.dart` stub
is exactly where this should live — extract the picker logic out of
`radio_view.dart` into it, then call it from `audio_player_sheet.dart`.

### RQM-08 — Persistent mini audio player missing
**Confirmed missing — and it's missing exactly where it matters most.** A
`MiniPlayer` widget does exist, but it's only mounted inside `AppScaffold`
(the 4-tab Home/Radio/Search/Account shell). The surah reader
(`surah_reader_view.dart`) is a **separate, full-screen pushed route** with
its own bare `Scaffold` and no `MiniPlayer` anywhere in it. So the one place
users actually read and scroll — the reader itself — is precisely where the
mini player disappears, which is exactly the complaint ("no persistent mini
player... while scrolling/reading elsewhere"). **Fix location:** either mount
`MiniPlayer` inside `SurahReaderView`'s own `Scaffold`, or restructure so the
reader route sits inside `AppScaffold` rather than replacing it.

### RQM-09 — Ayah repeat (single + range) missing
**UI is fully built; the underlying mechanism is broken.** All the pieces are
there — `RepeatMode` selector, count slider, delay slider, range dropdowns —
but the trigger logic only fires on whole-*track* completion or a queue-index
change, and since the whole surah is one continuous `MediaItem` (see RQM-07),
neither ever fires mid-surah at the actual target ayah/range boundary. Worse,
the "restart" call (`skipToQueueItem`) is never overridden in the app's audio
handler, so it silently falls through to the audio_service package's default
no-op — the repeat doesn't even seek back to the right position when it does
trigger. **Fix location:** `audio_controller.dart` — `_handleRepeatLogic()`
needs a real per-ayah-boundary trigger (compare the live position against the
target verse timing on each position tick, not queue/track-completion events),
and `_pauseAndScheduleRestart()` needs to seek to the actual verse start
instead of calling the no-op `skipToQueueItem`.

### RQM-12 — Word morphology/grammar panel missing
**The data is already there; only the UI is missing.** Tapping a word already
opens a sheet — but it only shows translation/transliteration, no
root/lemma/form. The per-word morphology data (POS, lemma, root, features) is
**already bundled as JSON assets** (`assets/data/morphology/v1/{surah}.json`,
declared in `pubspec.yaml`) and there's even a ready-made label-humanizing
utility (`lib/core/utils/morphology_labels.dart`, `humanizePOS()`/
`humanizeFeatures()`) that's fully written but has zero callers anywhere in
the app. **Fix location:** implement a small local datasource to load/parse
the bundled JSON (no network call needed), then extend the existing word-tap
sheet (or resurrect the empty `word_detail_view.dart` stub) to display it
using the humanizer that's already sitting there unused. This is the
lowest-effort "missing feature" on this list — most of the work is done.

### RQM-15 — Bookmark collection assignment not available while saving
**Confirmed missing.** The data model and repository already fully support
multiple collections (`moveBookmark(userId, verseKey, collectionId)` exists
and works), but the only place a bookmark actually gets created —
`toggleBookmark()` in the reader — always passes `null`, which the repository
then defaults straight to Favourites. There's no collection-picker UI
anywhere, and `moveBookmark` is never called from any screen. **Fix
location:** add a collection picker (sheet/dropdown) triggered from the
bookmark action in `ayah_block.dart`/`reader_controller.dart`, and/or wire the
existing `moveBookmark` method to a "move to collection" action on the
bookmarks screen.

### RQM-16 — Clicking a bookmark doesn't open the ayah
**Confirmed — and it's about as clear-cut as a bug gets.** The bookmark
card's `onTap` in `collection_details_view.dart` is a literal no-op, with a
commented-out line referencing a route (`Routes.READER`) that doesn't even
exist in the app's actual route table anymore. The notes list has the same
gap — no `onTap` at all. The correct pattern already exists elsewhere in the
app (`search_controller.dart`'s `onResultTapped`, which navigates to
`Routes.SURAH_AYAH` built from the same `chapterId:verseNumber` format
bookmarks already store). **Fix location:** replace the empty `onTap` with the
same `Routes.SURAH_AYAH` navigation pattern, parsing `bookmark.verseKey`.

### RQM-18 — Media Maker missing branding and no download option
**Both confirmed.** Note: the actual working Media Maker lives in
`lib/features/media/` — the identically-named `lib/features/media_maker/`
folder is dead (empty stub files). Neither the rendered card nor the share
caption includes any visible branding in the actual image — the app name only
appears in the share-sheet caption text, which disappears if the image is
saved/reposted alone. There's also genuinely no download/save action —
`shareCard()` is the only capability, and no gallery-saving package is even a
dependency. **Fix location:** `ayah_card_designer_view.dart`'s `_buildCard()`
needs a branding row/watermark added to the actual rendered widget tree
(not just the share caption); `ayah_card_designer_controller.dart` already
captures the card to PNG bytes for sharing — add a gallery-save package and a
`saveToGallery()` method reusing that same byte buffer.

### RQM-19 — Memorisation tools largely unimplemented
**More is built than the tracker implies, but the gaps are real.**
Single-ayah hide/reveal genuinely works as designed (confirmed). Range
selection for hide/reveal doesn't exist at all — hifz mode is a single global
on/off toggle, not a range picker. A memorisation progress tracker is
**fully built** on both ends — Firestore repository methods
(`markMemorised`/`unmarkMemorised`), a controller computing per-surah/per-juz
percentages, and a complete "Hifz Progress" screen with tabs and progress
bars, all reachable from the account menu — but `markMemorised`/`unmarkMemorised`
are **never called from anywhere in the app**. There's no button anywhere to
actually mark an ayah as memorised, so the fully-built progress screen will
permanently show 0% for everything. **Fix locations:** (1) range
selection needs start/end pickers added to the hifz settings UI and the
reveal-gating logic in `reader_settings_controller.dart`/`hideable_arabic.dart`
changed to operate over a range instead of the whole surah; (2) range-repeat
could reuse the audio player's existing repeat-count UI/logic as a model; (3)
the progress tracker just needs a "mark as memorised" action wired to the
already-built `HifzRepository.markMemorised()` — the hard part (storage,
math, and the screen) is already done.

---

## Suggested priority order

1. **RQM-16** (bookmark tap) — smallest, clearest fix; broken navigation with
   an already-correct pattern to copy from elsewhere in the same codebase.
2. **RQM-08** (mini player in the reader) and **RQM-01**'s auth-listener gap —
   both small, both fix a real persistence/continuity gap in the core reading
   experience.
3. **RQM-12** (morphology panel) — data's already bundled, humanizer already
   written; mostly UI wiring.
4. **RQM-05, RQM-06, RQM-15** — straightforward additive UI, no architectural
   rework.
5. **RQM-02, RQM-09** — both need real changes to the audio completion/repeat
   logic in `audio_controller.dart`; do these together since they touch the
   same file and the same underlying single-continuous-track architecture.
6. **RQM-18, RQM-19** — larger scope (branding asset + save flow; memorisation
   range UI + progress-tracker wiring); worth scoping as their own pieces of
   work rather than quick fixes.
7. **RQM-14, RQM-17** — not code fixes so much as verification: check the
   Firebase console for RQM-14, re-test RQM-17 with a goal actually set.
