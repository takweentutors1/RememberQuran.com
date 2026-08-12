# RememberQuran.com — Status vs. Brief (Brief 9, July 2026)

Analysis of the current codebase against `Brief_RememberQuran_Haseeb_v2.docx`, as of 2026-08-12.
Source: 75 commits on `main`, `src/` tree, `README.md`, `package.json`.

**Headline: M1–M4 are fully built and match the brief closely. M5 is mostly built already (README undersells it — it says "Upcoming" but the reciter/translation/tafsir/hifz work is in the tree). M6 (polish/perf/QA sign-off) has not been started.**

---

## Milestone 1 — Core Reading Experience — ✅ Done

| Brief requirement | Status | Evidence |
|---|---|---|
| Arabic text, Uthmani script, RTL, diacritics | ✅ | `ArabicWord.tsx`, `ArabicLine.tsx`, KFGQPC Uthmanic Hafs font |
| Reading mode + verse-by-verse mode | ✅ | `ReadingModeView.tsx`, `DisplayModeToggle.tsx` |
| Adjustable font size (S/M/L/XL) + font style | ✅ | `FontSizeSelector.tsx`, `FontTypeSelector.tsx` |
| Surah list (name, translit., meaning, ayah count, Makki/Madani) | ✅ | `SurahListPage.tsx`, `SurahCard.tsx` |
| Direct nav to surah/ayah, prev/next, shareable URLs (`/2/255`) | ✅ | `[surahId]/[ayahId]/page.tsx` |
| Persistent sidebar/nav | ✅ | `SurahSidebar.tsx`, `SurahSheet.tsx`, `SurahCommand.tsx` |
| Two translations (Saheeh Intl. + Clear Quran), toggle none/one/both | ✅ | `translations.ts`, `TranslationSelector.tsx` |
| Word-by-word hover/tap tooltip | ✅ | `WordMeaningContent.tsx` |
| Light/dark mode, persisted | ✅ | `ThemeToggle.tsx` (next-themes) |
| Mobile responsive, no ads | ✅ | confirmed throughout layout components |

**Gap:** none against the brief. Minor: `README.md` milestone table is stale (see "Loose ends" below).

---

## Milestone 2 — Audio & Recitation — ✅ Done

| Brief requirement | Status | Evidence |
|---|---|---|
| ≥2 reciters | ✅ (14 shipped, see M5 note) | `audioSources.ts` |
| Per-ayah play, continuous surah, playback speed 0.75–1.5x | ✅ | `AudioPlayerContext.tsx`, `SpeedControl.tsx` |
| Repeat: single ayah (N times) + custom range (N times, incl. ∞) | ✅ | `RepeatControls.tsx` |
| Persistent mini player | ✅ | `AudioPlayerBar.tsx`, `AudioDockSpacer.tsx` |
| Word-by-word highlight sync during playback | ✅ | `wordSync.ts`, timing-segment sync in `AudioPlayerContext.tsx` |
| Click-to-hear single word | ✅ | `getWordAudioUrl()` in `audioSources.ts`, wired in `ArabicWord.tsx` |
| Quran Radio (continuous, reciter-selectable) | ✅ | `/radio`, `RadioPanel.tsx` |

**Gap:** none. Brief explicitly allows "no sync" for reciters lacking timing files — current registry marks `hasWordTiming` per reciter, so that fallback path already exists.

---

## Milestone 3 — Study Tools — ✅ Done

| Brief requirement | Status | Evidence |
|---|---|---|
| Tafsir panel, starting with Ibn Kathir (EN) | ✅ (5 books shipped, see M5) | `studyApi.ts` → `TAFSIR_RESOURCES` |
| Tajweed colour coding, toggleable | ✅ | `tajweed.ts`, `TajweedToggle.tsx`, `TajweedLegend.tsx` |
| Keyword search (Arabic + English), fast, jump-to-ayah | ✅ | `/search`, `searchApi.ts`, debounced client |
| Word morphology (root, form, grammar) on click | ✅ | `morphologyApi.ts`, `WordDetailView.tsx` (build-time corpus data) |
| Asbab al-Nuzul (reasons for revelation), toggleable, partial coverage OK | ✅ | `AsbabView.tsx`, `asbabIndex.ts`, `data/asbab-index.json` |

**Gap:** none against the brief text.

---

## Milestone 4 — Accounts & Personal Features — ✅ Done

| Brief requirement | Status | Evidence |
|---|---|---|
| Email/password register, login, logout, forgot-password | ✅ | Auth.js v5, `auth.config.ts`, `/api/auth/reset/*` |
| Account settings: change email, change password | ✅ | `SettingsForms.tsx`, `/api/account/settings/*` |
| User model future-proofed for community (roles, moderation flags) w/o building it | ✅ | `models/User.ts` — `roles`, `moderation.flagged/suspended` present, unused in UI |
| Bookmarks in custom collections | ✅ | `BookmarksView.tsx`, `models/Bookmark.ts` + `BookmarkCollection.ts` |
| Private per-ayah notes | ✅ | `NotesView.tsx`, `NoteEditor.tsx`, `models/Note.ts` |
| "Continue where you left off" | ✅ | `ContinuePrompt.tsx`, `lastPosition` on `User` model |
| Reading progress by surah | ✅ | `ProgressView.tsx`, `models/ProgressEvent.ts` |
| Daily goals + streaks | ✅ | `GoalsView.tsx`, `models/Goal.ts`, `models/StreakState.ts`, `goals/evaluate.ts` |
| Media Maker — export shareable ayah image, background options, watermark | ✅ | `/media-maker`, `AyahCardDesigner.tsx`, `/api/og/ayah`, 4 colour presets, "RememberQuran.com" watermark baked into export |
| Reading/audio/study stay usable without login (soft-gate) | ✅ | `SoftGateContext.tsx`, `SoftGateDialog.tsx` |

**Gap:** none against the brief text.

---

## Milestone 5 — Expansion — 🟡 Feature-complete, needs docs/housekeeping

The brief scopes this as a later milestone, but the code is already largely there — commits `99babd8` ("Add Milestone 5 implementation plan and resource inventory") and `24519c0` ("Add Hifz tracking and Hide Arabic features"), plus the reciter expansion below, mean every numeric target in this milestone is now met. **README.md still marks M5 as "Upcoming," which is inaccurate.**

| Brief requirement | Target | Actual | Status |
|---|---|---|---|
| More reciters | 20+ | **21** (`RECITERS` in `audioSources.ts`) | ✅ Target met |
| More translations | 10+ | **10** (`TRANSLATIONS` in `translations.ts`: Saheeh Intl., Clear Quran, Abdel Haleem, Pickthall, Yusuf Ali, Usmani, Hilali-Khan, Maududi, Bridges, Junagarhi/Urdu) | ✅ Target met |
| More tafsir books | 5+ | **5** (Ibn Kathir, Ma'arif al-Qur'an, Tazkirul Quran, Al-Sa'di, Tafsir Muyassar) | ✅ Target met |
| Hide mode (memorisation testing) | — | ✅ `HideArabicToggle.tsx`, `HideableArabic.tsx` | ✅ Done |
| Ayah/range repeat with pause between reps | — | ✅ `RepeatControls.tsx` + `pauseMs` gap logic in `AudioPlayerContext.tsx` | ✅ Done |
| Hifz progress tracker (by surah/juz) | — | ✅ `HifzView.tsx`, `models/MemorisedAyah.ts`, `/account/hifz` | ✅ Done |

**Remaining work for M5 sign-off:**
1. ~~Add ~6 more reciters to close the 14→20+ gap~~ ✅ Done — added Saad Al-Ghamdi (id 13), Maher Al Muaiqly (id 65), Khalid Al-Jaleel (id 170), Ali Al-Huthaifi (id 167), Abdullah Basfar (id 163), Mohammad Al-Tablawi (id 91), and Bandar Baleela (id 160). All 7 verified directly against the QDC `audio/reciters/{id}/audio_files` endpoint for full 1–114 chapter coverage; none have word-timing `segments` (confirmed via `segments=true` check), so they're registered with `hasWordTiming: false` — the brief's documented no-sync fallback. Registry is now 21 reciters.
2. Update `README.md` milestone table and feature list to reflect actual M5 state (currently understates it).
3. `package.json` still references `scripts/build-morphology.mjs` and `scripts/m5-phase0-inventory.mjs` (`build:morphology`, `m5:inventory`) but the `scripts/` directory was deleted in a later cleanup commit (`058dc50`) — these npm scripts are currently broken/dead. Either restore the scripts or remove the dead package.json entries.
4. Re-run/produce the M5 resource inventory doc referenced in commit history (`docs/m5-resource-ids.md` is referenced from a code comment in `audioSources.ts` but no longer exists in the tree — was removed in the docs cleanup).

---

## Milestone 6 — Final Polish & Sign-Off — ❌ Not started

| Brief requirement | Status |
|---|---|
| Performance target: <3s initial load, audio start <2s | ❌ Not measured. `next.config.ts` has only baseline `optimizePackageImports` + static-asset cache headers — no image optimization audit, no bundle analysis done yet |
| Lighthouse / PageSpeed scores documented | ❌ None found in repo |
| Cross-browser testing (Chrome/Firefox/Safari/Edge) | ❌ Not documented |
| Cross-device testing (desktop/tablet/mobile, iOS/Android) | ❌ Not documented |
| Full regression test across all milestones | ❌ No regression checklist artifact currently in repo (`docs/regression-checklist.md` is referenced in README but does not exist in the current tree — likely removed in the docs cleanup commit) |
| Final README with full tech stack + data sources + deployment | 🟡 Partially — current README is good but stale on milestone status (see above) |

This entire milestone is greenfield work.

---

## Not built (correctly, per brief instructions) — do not build yet

These are explicitly "future vision, not this brief" items, and none of them are in the codebase — correct:
- Community/social features (reflections, shared notes, discussion)
- Learning plans (e.g. "Read the Quran in 30 days")
- Multi-channel Quran Radio
- Mobile app
- Hadith platform integration
- AI-powered live tajweed feedback

The `User` model's `roles`/`moderation` fields confirm the future-proofing instruction was followed without over-building.

---

## Recommended plan of action

1. **Close out M5 properly** (small effort — most of it is done):
   - Add remaining reciters to hit 20+.
   - Fix the broken `package.json` scripts (either restore `scripts/` or drop the dead entries).
   - Update `README.md` milestone table (M5 → "In progress" or "Complete" once reciters are topped up).
   - Post the M5 QA submission per brief §5 (live link, data sources used, self-regression confirmation, known limitations).

2. **Start M6** (nothing built yet):
   - Run Lighthouse/PageSpeed on the live domain, record scores, fix obvious regressions (image formats, font loading, JS bundle size).
   - Manual cross-browser/cross-device pass, write up findings.
   - Full regression pass across M1–M5 features, document as a checklist (this file's tables above are a reasonable starting checklist).
   - Rewrite the final README to brief spec (§5 item 10).
   - Answer the three product-thinking questions in §6 for the final submission.

3. **Housekeeping while at it:**
   - Restore or re-derive `docs/m5-resource-ids.md` and `docs/regression-checklist.md` since other parts of the codebase/README still reference them.
   - Reconcile README's data-source table (it lists Clear Quran as translation ID 57; `translations.ts` uses ID 131 for the same translation — pick one source of truth and fix the mismatch).
