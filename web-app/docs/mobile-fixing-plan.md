# Mobile App (RQM) Fixing Plan

Source: `docs/QA_Tracker_RememberQuran_Mobile - QA Tracker.pdf` (RQM-01–RQM-19),
analyzed against the actual Flutter codebase at `rememberquran/`, produced by
three parallel codebase investigations plus one direct follow-up check
(RQM-08), covering every item with file:line evidence.

**Headline finding:** this tracker is noisier than the web one. Six items are
already fully implemented and working — the tracker calling them "Open" looks
like it was written from an earlier build or a partial test pass, not the
current code. Three more were *mostly* correct with one small real gap each
— RQM-01's, RQM-14's, and RQM-17's gaps have all since been fixed on the
code side (RQM-14's actual reported symptom is a Firebase console
configuration question that can't be resolved from here — see its section
below). Ten are genuine bugs or missing features; all ten (RQM-02, RQM-05,
RQM-06, RQM-08, RQM-09, RQM-12, RQM-15, RQM-16, RQM-18, RQM-19) have since
been fixed.
None of the "Already implemented" verdicts below are guesses — each cites the
actual file and logic that proves it works.

A recurring pattern worth flagging on its own: **the codebase has a lot of
0-byte dead stub files** sitting alongside working implementations —
`lib/features/study/views/tafsir_view.dart`, `word_detail_view.dart`,
`lib/features/media_maker/` (the whole folder — the real Media Maker lives in
the sibling `lib/features/media/`), `lib/features/audio/widgets/reciter_selector.dart`,
`speed_control.dart`, `lib/data/models/morphology_entry.dart`,
`lib/data/datasources/local/prefs_ds.dart`, `lib/data/models/streak.dart`. These
look like an initial scaffold (`fc4da88 Add RememberQuran Flutter app — full
feature implementation`) that was partially superseded by later real
implementations without the stubs being deleted. Worth a cleanup pass
independent of this tracker — they make the codebase harder to navigate and
at least one of them (`morphology_entry.dart`) is sitting right next to data
that's already bundled and ready to use (see RQM-12). (`repeat_controls.dart`
was in this list too — deleted as part of RQM-19, see below.)

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
**STATUS: Fixed (commit `7880a2a`), `dart analyze` clean, not yet verified on a
live device/simulator** — no Flutter emulator was available in this session to
click through the actual repro. The fix below mirrors an already-proven
working pattern elsewhere in the same codebase, so confidence is high, but
this should still get a real re-test: log in, add a bookmark, log out, log
back into the *same* account, confirm the bookmark is still there and no
stale/wrong-user data ever flashes in between.

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
until something forces a rebuild. **Fix applied:** `BookmarksController` now
has the same `firebaseUser.listen(...)` pattern `NotesController` already had
— clears `collections`/`notes`/`currentCollectionBookmarks`/`currentCollection`
on logout, reloads them (plus the currently-viewed collection, if any) on
login.

### RQM-14 — Password reset email not arriving
**STATUS: Code-complete (commits `77584a2`, `f9844e7`), `dart analyze`
clean. Every part of this that can be fixed by editing the Flutter app has
been; the actual reported symptom (a real account not receiving the email)
is a Firebase project configuration question that genuinely cannot be
diagnosed or fixed from this environment — see below.**

The code itself was correct: `resetPassword()` calls Firebase Auth's real
`sendPasswordResetEmail` directly (not a custom backend — the mobile app
doesn't share the web app's `/api/auth/reset/request` endpoint at all), with
proper `FirebaseAuthException` handling and a success snackbar. Also
double-checked the app is registered against the *same* Firebase project as
the web app (`remember-quran`, confirmed in `firebase_options.dart`) — not a
wrong-project misconfiguration.

**Fixed (commit `77584a2`):** the catch clause only handled
`FirebaseAuthException`; any other exception (e.g. a network/DNS failure)
previously propagated uncaught, so a failed request silently reset the
loading state with zero feedback (`error.value`, what the screen actually
displays, was never set). Added a catch-all fallback.

**Fixed (commit `f9844e7`):** the success message stated "We've sent
password reset instructions to X" unconditionally. Firebase's email
enumeration protection makes `sendPasswordResetEmail` resolve successfully
even when no account exists for that address, by design, and the client has
no way to see through that — so the old copy was asserting something as
fact that the app can't actually confirm. Reworded to "If an account exists
for X, we've sent..." plus a spam/junk-folder nudge, which also covers the
other realistic explanation for "the email never arrived": a genuine send
that got filtered.

**Cannot be fixed from here — needs the project owner to check the Firebase
console:** attempted to inspect the project's Authentication email/template
configuration this session via the Firebase CLI, but that would have
required minting a new CI access token, which was correctly declined — this
environment doesn't have (and shouldn't request) standing credentials for
Firebase Console access. Recommend: confirm the test email actually has an
account, check Firebase Console → Authentication → Templates → Password
reset is enabled with a verified sender domain (SPF/DKIM), and check spam
folders before assuming it's still broken after re-testing.

### RQM-17 — Reading streak doesn't update
**STATUS: Fixed (commit `c697624`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually reproduce the timing window. Worth a real re-test: with a goal
set, read enough to meet it, immediately back out of the reader straight to
Goals, and confirm it reflects the session right away.

The pipeline (scroll-dwell detection → debounced progress events →
Firestore → streak evaluation → Goals display) was fully wired end-to-end
and looked correct — not a stub, no logic bug found in it. But
`ReaderController.onClose()` is synchronous (a GetX constraint), so its
flush of the last pending (debounced) progress event was necessarily
fire-and-forget. A user who finishes reading and immediately opens Goals
could reach `GoalsController.loadGoalData()` before that write actually
landed in Firestore — showing a snapshot that doesn't yet reflect what they
just read. This matches the reported symptom closely ("after completing the
reading task... the streak is not updated"). **Fix applied:** new
`ReaderController.flushPendingProgress()`, an awaitable version of the same
flush, called from a `PopScope` in `SurahReaderView` that awaits it before
letting the back-navigation complete — covers both the system back gesture
and the AppBar's automatic back button. Doesn't affect in-place surah
switching (RQM-05's prev/next buttons, the sidebar), since that never pops
the route.

**Two more real gaps identified, not addressed by this fix — worth
re-testing after this one before pursuing either further:**
1. Streak tracking only activates once a user has set an *active goal* — if
   never set, the streak correctly stays at zero, not a bug, but could read
   as one to a tester who didn't set a goal first.
2. The Goals screen still recalculates lazily (on load/pull-to-refresh), not
   via a live Firestore listener, so it won't tick up while sitting on it
   mid-session (distinct from the race this fix closes, which was about
   *leaving* the reader too fast, not staying on Goals too long).

---

## Real gaps and bugs — need actual implementation work

### RQM-02 — Surah auto-advance shows an error and skips a surah
**STATUS: Fixed (commit `bafe3b3`), `dart analyze` clean project-wide, not yet
verified on a live device/simulator** — no Flutter emulator was available in
this session to actually let a surah play to completion and watch the
transition. The reasoning is solid (below) and reuses a flag the app was
already tracking, but this should still get a real re-test: let radio mode
run through at least 3-4 surah transitions and confirm none are skipped.

A prior infinite-skip-loop bug (instantly-completing broken audio sources
looping forever) was already fixed in commit `d6b47bb`. The remaining bug:
`_onPlaybackCompleted()` had **no debounce/re-entrancy guard** —
`_loadAndPlayChapter()` performs several `await`s before `updateQueue()` moves
the player out of `AudioProcessingState.completed`, and the audio engine's
`playbackState` stream can keep re-emitting a stale `completed` state during
that window. Each re-emission re-entered `_onPlaybackCompleted()` →
`advanceRadio()` → `radioSkipToNext()`, which reads/writes
`rxCurrentSurahId.value` synchronously before the next chapter's load even
starts — two rapid re-entries in a row visibly skip a surah (the reported
"1 to 3, missing 2").

**Fix applied:** the controller already tracked `rxIsBusy` — `true` for the
entire span of `_loadAndPlayChapter()` (previously only read by the UI to
show a loading spinner, never used as a guard). Added
`if (rxIsBusy.value) return;` at the top of `_onPlaybackCompleted()`: a
completion event can only be stale while a load is already in flight, since
the outgoing track has already fully stopped by the time a new load starts,
and the guard clears itself the moment the new chapter is ready — no new
state needed, no risk of it getting stuck permanently true (the reset is in
`_loadAndPlayChapter`'s `finally` block).

### RQM-05 — No previous/next surah buttons
**STATUS: Fixed (commit `1177c8e`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually tap through it. Worth a quick re-test: open a surah, tap next a
few times through a wraparound (113→114→1), tap previous back the other way
(1→114→113), and confirm the title/content updates each time with no double
loads from rapid tapping.

The reader's AppBar only had Quick Jump and Settings icons — no prev/next
control. Radio mode has its own skip-surah logic
(`radioSkipToPrevious`/`radioSkipToNext`) that's audio-only and unrelated to
text navigation. **Fix applied:** two new `IconButton`s
(`navigate_before`/`navigate_next`) in `surah_reader_view.dart`'s AppBar
`actions`, calling the same `ReaderController.loadChapter()` the desktop
sidebar's tap handler already uses (an in-place content swap, not a new
navigation route), wrapping 1↔114 to match the convention
`AudioController.nextAvailableSurahId` already uses elsewhere. Each button is
individually `Obx`-wrapped and disabled while a chapter is loading, so rapid
tapping can't fire overlapping loads.

### RQM-06 — Reciter selection unavailable in reading mode
**STATUS: Fixed (commit `7984bbc`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually tap through it. Worth a quick re-test: open the reading-mode
"Now Playing" sheet, tap the reciter name, pick a different reciter, and
confirm playback switches to that reciter's audio and resumes from the same
ayah rather than restarting the surah.

The only reciter picker in the app was a private method inside `RadioView`.
The reading-mode "Now Playing" sheet only *displayed* the current reciter's
name as static text with no way to change it. **Fix applied:** the empty
`lib/features/audio/widgets/reciter_selector.dart` stub now holds a shared,
parameterized `showReciterPicker()` extracted from `RadioView`'s original
implementation (both call sites use the same picker instead of drifting
apart); `RadioView._showReciterPicker` is now a thin wrapper around it with
no behavior change. Added `AudioController.changeReciter()`: in Radio mode it
restarts the current surah with the new reciter (matching Radio's existing
behavior); otherwise it reloads whatever chapter is currently playing with
the new reciter's audio and seeks back to the same ayah, so switching
reciters mid-recitation doesn't reset you to the start of the surah. The
reciter name in the Now Playing header is now tappable (small chevron added
as a visual affordance) and opens the picker.

### RQM-08 — Persistent mini audio player missing
**STATUS: Fixed (commit `306d3cf`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually watch it appear while scrolling. Worth a quick re-test: start
playback (from Radio or by tapping an ayah's play button), open a surah in
the reader, scroll through it, and confirm the mini player stays visible and
usable at the bottom the whole time.

A `MiniPlayer` widget did exist, but it was only mounted inside `AppScaffold`
(the 4-tab Home/Radio/Search/Account shell). The surah reader
(`surah_reader_view.dart`) is a **separate, full-screen pushed route** with
its own bare `Scaffold` and no `MiniPlayer` anywhere in it. So the one place
users actually read and scroll — the reader itself — was precisely where the
mini player disappeared, which is exactly the complaint ("no persistent mini
player... while scrolling/reading elsewhere"). **Fix applied:** `MiniPlayer`
is now `SurahReaderView`'s `bottomNavigationBar`. It was already safe to mount
unconditionally — it renders `SizedBox.shrink()` whenever there's no active
audio — so this took no other change; Scaffold automatically sizes the
scrollable body above it, no content-overlap risk.

### RQM-09 — Ayah repeat (single + range) missing
**STATUS: Fixed (commit `d68d1b2`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually listen to it loop. Worth a real re-test: turn on single-ayah
repeat mid-surah and confirm the same ayah loops the set number of times
(with the pause delay honored) before continuing; then try range repeat,
including the edge case where the range end is the surah's last ayah.

The UI was fully built — `RepeatMode` selector, count slider, delay slider,
range dropdowns — but the trigger logic only fired on whole-*track*
completion or a queue-index change, and since the whole surah is one
continuous `MediaItem` (see RQM-07), neither ever fired mid-surah at the
actual target ayah/range boundary — repeat only kicked in once the entire
chapter had already played through once, regardless of what was selected.
Worse, the "restart" call (`skipToQueueItem`) was never overridden in the
app's audio handler, so it silently fell through to the audio_service
package's default no-op — even the rare cases that did trigger didn't
actually seek anywhere. **Fix applied:** trigger now hooks into
`_onPositionTick`, which already tracks the live playing-ayah index
(`_lastVerseIdx`) for word-sync highlighting — the same signal RQM-02's fix
builds on — intercepting right at the verse-boundary crossing that would
otherwise advance past the target ayah/range end. `_onPlaybackCompleted`
still has its own check for the edge case where the target is the surah's
last ayah (no "next ayah" tick exists to intercept there). Restart now seeks
to the real verse timestamp via `_timings` instead of the no-op
`skipToQueueItem`.

### RQM-12 — Word morphology/grammar panel missing
**STATUS: Fixed (commit `89cb40f`), `dart analyze` clean, data-layer logic
verified standalone against the real bundled asset — not yet verified in the
actual app UI on a live device/simulator** (no Flutter emulator was available
in this session). Worth a quick re-test: tap an Arabic word and confirm the
sheet shows Part of Speech / Lemma / Root / Grammar beneath the translation.

The data was already there; only the UI was missing. Tapping a word already
opened a sheet, but it only showed translation/transliteration, no
root/lemma/form. The per-word morphology data (POS, lemma, root, features)
was **already bundled as JSON assets** (`assets/data/morphology/v1/
{surah}.json`, declared in `pubspec.yaml`) and there was a ready-made
label-humanizing utility (`lib/core/utils/morphology_labels.dart`,
`humanizePOS()`/`humanizeFeatures()`) fully written with zero callers.
**Fix applied:** filled in the two empty stub files —
`morphology_entry.dart` (model) and `morphology_local_ds.dart` (loads/caches
the bundled per-surah JSON via `rootBundle`, no network call) — then wired
`WordMeaningSheet` to load and render it (it needed `verseKey`, which
`ArabicWord` already had but wasn't passing through). Verified the data-layer
logic standalone outside Flutter: `1:1` ("بِسْمِ") correctly resolves to
Noun / lemma اسْم / root سمو (matches known Arabic grammar), and a
nonexistent key resolves to `null` cleanly rather than throwing.

### RQM-15 — Bookmark collection assignment not available while saving
**STATUS: Fixed (commit `8096a98`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually click through it. Worth a real re-test: bookmark a fresh ayah,
confirm the collection picker appears, create a new collection inline and
confirm it's selected, then check the bookmarks page shows it under the
right collection with the right count.

The data model and repository already fully supported multiple collections
(`createBookmark`/`moveBookmark` both take an explicit `collectionId`), but
the only place a bookmark actually got created — `toggleBookmark()` in the
reader — always passed `null`, which the repository then defaulted straight
to Favourites. There was no collection-picker UI anywhere. **Fix applied:**
new `CollectionPickerSheet` — lists existing collections (with bookmark
counts, Favourites starred) to tap, or a name field to create-and-select a
new one inline — shown only on the *create* path (removing an existing
bookmark stays a single fast tap, unchanged). `toggleBookmark()` now takes an
optional `collectionId`, passed straight through; omitting it keeps the
exact prior default-to-Favourites behavior, so nothing else that might call
it breaks. Didn't need to touch the bookmarks display page — it already
correctly filters bookmarks per collection; every non-Favourites collection
was simply always empty because nothing was ever being saved into it. Left
`moveBookmark` (re-assigning an *existing* bookmark to a different
collection after the fact) unaddressed — that's a distinct, smaller
follow-up if wanted, not part of what RQM-15 asked for.

### RQM-16 — Clicking a bookmark doesn't open the ayah
**STATUS: Fixed (commit `9536b17`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually tap through it. Worth a quick re-test: tap a bookmark on the
collection details page and a note on the Notes tab, confirm both jump to
the right ayah.

The bookmark card's `onTap` in `collection_details_view.dart` was a literal
no-op, with a commented-out line referencing a route (`Routes.READER`) that
doesn't even exist in the app's actual route table. The notes list had the
same gap — no `onTap` at all. **Fix applied:** both now mirror the pattern
already used by search results (`search_controller.dart`'s
`onResultTapped`), navigating to `Routes.SURAH_AYAH` built from the same
`chapterId:verseNumber` format bookmarks/notes already store. The notes fix
wasn't part of the filed ticket title, but it's the identical bug in the
same screen, found while fixing the bookmark side — same one-line pattern,
not worth leaving half-fixed.

### RQM-18 — Media Maker missing branding and no download option
**STATUS: Fixed (commit `3db4d00`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually tap through the save flow or inspect a saved PNG. Worth a quick
re-test: design a card, tap Save (both the AppBar icon and the bottom button),
confirm the photo-library permission prompt appears and the saved image in
Photos/Gallery shows the branding footer baked in.

Note: the actual working Media Maker lives in `lib/features/media/` — the
identically-named `lib/features/media_maker/` folder is dead (empty stub
files). Neither the rendered card nor the share caption included any visible
branding in the actual image — the app name only appeared in the share-sheet
caption text, which disappeared if the image was saved/reposted alone.
There was also genuinely no download/save action — `shareCard()` was the
only capability, and no gallery-saving package was even a dependency.
**Fix applied:** a branding footer (app icon + "RememberQuran.com") is now
baked directly into `_buildCard()`'s widget tree, so it's part of the
captured PNG itself, not just the share caption. Added the `gal` package and
a new `saveToGallery()` method on the controller (checks/requests photo
library access, writes via `Gal.putImageBytes`, surfaces permission/
`GalException` failures via snackbar), reusing the same PNG-capture logic
that `shareCard()` uses via a shared `_capturePng()` helper. Added a Save
button in both the AppBar (download icon) and the bottom controls (alongside
Share), with a loading spinner while the save is in flight. Added the native
permissions `gal` needs: iOS `NSPhotoLibraryAddUsageDescription`/
`NSPhotoLibraryUsageDescription`, Android `WRITE_EXTERNAL_STORAGE`
(`maxSdkVersion=29`, unneeded on scoped storage).

### RQM-19 — Memorisation tools largely unimplemented
**STATUS: Fixed (commit `471144c`), `dart analyze` clean, not yet verified on
a live device/simulator** — no Flutter emulator was available in this session
to actually tap through any of the three pieces below. Worth a real re-test:
(a) mark an ayah as memorised in the reader, then check the Hifz Progress
screen reflects it (note: that screen doesn't live-refresh — re-enter it
after marking); (b) turn on Hifz Mode, set a from/to ayah range, confirm
ayahs outside the range stay visible while ones inside still hide/reveal
per-tap as before; (c) open the Now Playing sheet's range-repeat picker and
confirm it still works as it already did before this ticket.

**More was built than the tracker implied, but the gaps were real.**
Single-ayah hide/reveal genuinely worked as designed (confirmed, unchanged).
Range selection for hide/reveal didn't exist at all — hifz mode was a single
global on/off toggle, not a range picker. A memorisation progress tracker was
**already fully built** on both ends — Firestore repository methods
(`markMemorised`/`unmarkMemorised`), a controller computing per-surah/per-juz
percentages, and a complete "Hifz Progress" screen with tabs and progress
bars, all reachable from the account menu — but `markMemorised`/`unmarkMemorised`
were **never called from anywhere in the app**. There was no button anywhere
to actually mark an ayah as memorised, so the fully-built progress screen
could only ever show 0%. Range-repeat was also filed as missing, but turned
out to already be fully implemented (`AudioController`'s `RepeatMode.range`
engine, wired to a working start/end ayah picker in the Now Playing sheet) —
that part of the ticket was a documentation gap, not a code gap.

**Fix applied:** (1) `ReaderController` now loads the current chapter's
memorised verse keys alongside its bookmarks in `loadChapter()`, and a new
`toggleMemorised()` calls `markMemorised`/`unmarkMemorised` with optimistic
UI + rollback on failure — same shape as the existing `toggleBookmark()`.
`AyahBlock` gained a "Mark as Memorised" button mirroring the bookmark
button. (2) `ReaderSettingsController` gained a session-only, optional
ayah-number range (`hifzRangeStart`/`hifzRangeEnd`, cleared on chapter
change since ayah numbers reset per surah), with a from/to picker added to
the reader settings sheet shown only while Hifz Mode is on; `HideableArabic`
now shows ayahs outside the selected range normally instead of hiding them.
(3) Range-repeat needed no code change — instead removed the actual dead
code, a 0-byte orphaned `lib/features/audio/widgets/repeat_controls.dart`
stub with zero references anywhere, left over from before the real UI moved
inline into `audio_player_sheet.dart`.

---

## Suggested priority order

1. ~~RQM-16~~ — done.
2. ~~RQM-08, RQM-12~~ — done.
3. ~~RQM-05, RQM-06, RQM-15~~ — done.
5. ~~RQM-02, RQM-09~~ — both done (same file, same underlying
   single-continuous-track architecture).
6. ~~RQM-18~~ — done (branding baked into the rendered card, `gal`-backed
   save-to-gallery flow).
7. ~~RQM-17~~ — the code-fixable race is done.
8. ~~RQM-19~~ — done (hifz range picker, "mark as memorised" wiring;
   range-repeat turned out to already work, no code needed there).
9. ~~RQM-14~~ — code-complete. Its actual reported symptom (a real account
   not receiving the email) needs the project owner to check the Firebase
   console (Authentication → Templates, sender domain/SPF/DKIM) — outside
   what any code change can fix or what this environment has credentials
   to inspect.

Every RQM item is now fully fixed on the code side. RQM-14 is the one
exception where a remaining Firebase console check by the project owner is
needed to close out the originally reported symptom.
