# Milestone 6 QA Fixing Plan

Source: client QA pass on the `firestore-migration` branch. IDs kept as `M6-0x` per the
client's note — renumber to `RQ-xxx` once the M1–5 sequence is confirmed (no `RQ-`
numbering scheme exists anywhere in this repo, so that continuation number has to come
from wherever M1–5 tickets are actually tracked, not from the code).

Cross-cutting note: `docs/regression-checklist.md` was checked off as fully passing in
commit `250342d` (2026-08-14), which is *after* the Mongo→Firestore migration
(`8e59d4f`). No auth/account code has changed since that checklist was signed off. That
strongly suggests the checklist was validated against a local dev environment (which has
working Firebase credentials in `.env`) and never re-validated against the actual
deployed site — which is exactly where M6-01 shows up. Treat that checklist as stale for
the account system until it's re-run against the real deployment.

---

## M6-01 (Critical) — Registration/Login broken, raw HTTP 500 on login

**STATUS: Fixed and verified live in production as of 2026-08-21.** The original
hypothesis below (missing Vercel env vars) turned out to be wrong — `vercel env ls
production` showed `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`
already present (added 9 days prior). The actual causes were two real, unrelated code/config
bugs, both now fixed:

1. **`uuid` v14 is ESM-only; `gaxios` (a `firebase-admin` transitive dependency) still
   `require()`s it → hard crash on every Firestore-touching route.**
   `pnpm-workspace.yaml` had `overrides: { uuid@<11.1.1: '>=11.1.1' }` (added earlier to
   patch a `uuid` security advisory). That open-ended `>=` range resolved to `uuid@14.0.1`,
   which dropped the CJS `require()` export condition entirely (confirmed against the npm
   registry: `uuid@11.1.1`'s `exports["."].node.require` points at a real file;
   `uuid@12.0.0`+ has no `require` condition at all — pure ESM). Next.js externalizes
   `firebase-admin` for the server bundle, so it's loaded via a real Node `require()` at
   runtime, not bundled/transpiled — and that blew up with
   `Error [ERR_REQUIRE_ESM]: require() of ES Module .../uuid/dist-node/index.js ... not
   supported`, confirmed via `vercel logs` on every `/api/health` and
   `/api/account/register` call. **Fix:** pinned the override to the exact patched version
   that still ships CJS — `uuid: '11.1.1'` in `pnpm-workspace.yaml` — and regenerated
   `pnpm-lock.yaml`.
2. **The local `.env` file was being uploaded as part of `vercel deploy` and silently
   shadowing the correct Vercel dashboard env vars at runtime.** `.env` sets
   `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` for local dev (intentionally — see the comment
   in that file); Next.js loads `.env` automatically wherever it finds one, including
   inside the deployed function, which made every deployed Firestore call try to reach a
   local emulator that doesn't exist in the serverless environment
   (`connect ECONNREFUSED 127.0.0.1:8080`, confirmed via `/api/health`'s error field).
   **Fix:** added `.vercelignore` excluding `.env` / `.env.local` / `.env.*.local` (plus
   the unrelated `rememberquran/` Flutter app subtree also living in this repo, and a few
   large PDFs/zips, which were bloating the upload and one Flutter build artifact's broken
   iOS symlink was failing the deploy outright).
   - Separately: `.env` itself had a typo — `FIREBASE_PRIVATE_nKEY` instead of
     `FIREBASE_PRIVATE_KEY` — which meant `FIREBASE_PRIVATE_KEY` was never actually set
     locally either; it only "worked" in dev because `FIRESTORE_EMULATOR_HOST` short-circuits
     `admin.ts` before that variable is ever read. Fixed the typo in the local file (not
     committed — `.env*` is gitignored).

**Verified against the live production deploy after both fixes:**
- `GET /api/health` → `200 {"ok":true,"database":{"configured":true,"connected":true}}`
- `POST /api/account/register` → `201`, real user doc created in Firestore
- Full NextAuth credentials login (`/api/auth/csrf` → `/api/auth/callback/credentials`)
  → `302` (NextAuth's normal success redirect, not an error)
- The test account and its default bookmark collection were deleted from production
  Firestore afterward — no leftover test data.

**Hardening — done:** `src/auth.ts` `authorize()` now wraps its whole body in try/catch
(logs and returns `null` on any failure, same outward result as a wrong password) and the
`jwt` callback's password-revalidation Firestore read fails open (skips the check that
cycle and retries later, instead of crashing every authenticated page load). Neither path
can surface a raw platform 500 anymore.

**Not yet done:**
1. ~~Commit `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `.vercelignore`~~ — done, commit
   `784bce6` on `firestore-migration` (not pushed).
2. Re-run `docs/regression-checklist.md` row "Registration, Login, and Logout flows
   work" (M4) end-to-end in a browser (this pass only verified the API layer via curl).
3. Now that login works: bookmarking, notes, reading goals, and logged-in image sharing
   become testable — these are still unverified, not confirmed working or broken.
4. ~~The three Firebase Admin vars are still Production-only on Vercel, not scoped to
   Preview~~ — corrected: re-checked with `vercel env ls` (no filter) and they're already
   scoped to both Preview and Production (added 9 days ago). The earlier claim was based
   on only checking the `production` filter in isolation. No action needed here.

---

## M6-02 (Critical) — Audio doesn't update when switching surahs

**STATUS: Partial fix applied (lead #1 below); NOT independently confirmed live** — no
browser tool was available in this session (declined) to reproduce and verify against
actual playback. Ship the fix, but re-test manually before calling this closed.

Not browser-specific per the report (reproduced on Chrome, but flagged as general). Two
concrete leads were identified by static reading of `src/context/AudioPlayerContext.tsx`
(otherwise a fairly defensive state machine — chapter-id tracking via `chapterIdRef`, a
`loadTokenRef` guard against stale async loads, a per-chapter+reciter promise cache in
`src/lib/audioApi.ts:14` keyed correctly by chapter id):

1. **Fixed.** `loadChapter()` (`AudioPlayerContext.tsx:488-494`) reassigns `audio.src`
   directly on the single shared `<audio>` element while it may still be playing the
   previous chapter. Reassigning `.src` on a currently-playing element can fire a native
   `pause` event for the outgoing source. `handlePause` (`AudioPlayerContext.tsx:788-799`)
   used to dispatch `{ type: "PAUSED" }` unconditionally whenever
   `audioRef.current?.currentSrc` was truthy, with no check for an in-flight load. Since
   the reducer's `PAUSED` case only special-cases `status === "idle"`, this could clobber
   the `"loading"` status `LOAD_START` had just set (and `LOAD_SUCCESS` never resets
   `status` back), stranding the bar on "paused" instead of transitioning to "playing" for
   the new chapter. **Fix applied:** `handlePause` now returns early when
   `statusRef.current === "loading"` — a pause event during an active load is never
   meaningful; the real transition to "playing" still comes from the native `play`/
   `playing` events once the new source actually starts.
2. **Not addressed — lower-priority, needs its own repro.** Reader toolbar trigger
   `src/components/reader/ReaderControls.tsx:53,57-64` (`handlePlaySurah`) decides
   `togglePlayPause()` vs. `playChapter()` based on `player.chapterId === toolbarId`, and
   `toolbarId` comes from `pendingSurahId ?? chapter?.id ?? parseSurahId(pathname)`
   (`ReaderControls.tsx:50`, sourced from `src/context/SurahContentContext.tsx`'s own
   client-side navigation/caching layer). If `chapter?.id` lags behind the route during a
   fast surah-to-surah navigation, this button could briefly compute the wrong `toolbarId`
   and either no-op or target the previous chapter. Left alone since lead #1 is the more
   likely and more broadly-triggering cause; revisit if the bug persists after re-test.

**Next step:** re-test manually (or with a browser tool in a future session) — play a
surah, switch to another surah's page while it's still playing, press Play there, and
confirm the bar switches to the new chapter's audio and correctly shows "playing" rather
than getting stuck on "paused" or continuing the old chapter. If it still reproduces,
lead #2 is next.

---

## M6-03 — Tafsir-quoted ayat not in the platform's Arabic font

**STATUS: Fixed, deployed to production, build/lint verified.** Not independently
re-checked in a live browser (no browser tool available this session) — worth a quick
visual spot-check on an English-language tafsir with an inline ayah quote.

Root cause identified with high confidence — two compounding issues:

1. **`src/app/api/tafsir/[slug]/[surahId]/[ayahId]/route.ts:16-34`** —
   `sanitizeTafsirHtml()` allows `span` tags but grants them **no attributes at all**
   (`allowedAttributes: { a: ["href"] }` only). Any `class`, `dir`, or `lang` the
   upstream QDC HTML used to mark an inline Arabic ayah quote is stripped during
   sanitization, so the quote reaches the browser as a bare, unstyled `<span>`.
2. **`src/app/globals.css:236-238`** — `.study-prose` (the container `TafsirBody`
   renders into, `src/components/study/TafsirView.tsx:101-106`) hardcodes
   `var(--font-uthmani)` in its font stack. Everywhere else in the reader, Arabic text
   uses the `.font-arabic` class instead, which resolves to
   `var(--reader-arabic-font, var(--font-uthmani))` (`globals.css:219`) — i.e. it
   respects the user's selected Quran font from Reader Settings
   (`ReaderSettingsContext`/`ReaderSettingsPanel.tsx`). `.study-prose` bypasses that
   preference entirely, so even when it does pick up an Arabic fallback font via glyph
   coverage, it's always the *default* Uthmani font, never whatever font/script the user
   actually has selected — which is "not the proper font used elsewhere on the platform."

**Fix applied:**
1. `sanitizeTafsirHtml()` (`src/app/api/tafsir/[slug]/[surahId]/[ayahId]/route.ts`) now
   allows `dir` and `lang` on every allowed tag (`allowedAttributes: { a: ["href"], "*":
   ["dir", "lang"] }`), so inline RTL/language markup on Arabic ayah quotes survives
   sanitization instead of degrading to plain, direction-less spans. Left `class` out
   deliberately — `dir`/`lang` alone fix both the direction and (via the font-stack change
   below) the font; allowing arbitrary `class` values would be unnecessary surface area for
   what it fixes.
2. `.study-prose`'s font stack (`globals.css:236-238`) now uses
   `var(--reader-arabic-font, var(--font-uthmani))` in place of the hardcoded
   `var(--font-uthmani)`, matching `.font-arabic`, so embedded ayah quotes track whatever
   font the reader is actually using rather than always falling back to the default.

---

## M6-04 — Reading mode formatting "behind comparable Quran sites"

Per the client's own note, this needs clarification on whether it's a correctness bug or
a polish/taste gap before scoping a fix — recommend confirming with them what specifically
reads as behind (e.g. missing Juz/Hizb/page markers? line spacing? something else?) rather
than guessing.

For reference, the current implementation
(`src/components/reader/ReadingModeView.tsx`) already does continuous RTL flow with
justified text (`text-justify leading-[2.15]`, line 75), per-verse highlighting, and
mushaf-style end-of-ayah medallions (`AyahEndMarker.tsx`). Two concrete, low-risk gaps
worth raising with the client as candidate interpretations of the feedback, since sites
like quran.com typically include them and this view currently doesn't:

- No Juz/Hizb/Ruku or Mushaf-page boundary markers within the continuous flow.
- Translations render as a fully separate block after all Arabic verses
  (`ReadingModeView.tsx:86-112`) rather than interleaved per-verse, which can feel
  disconnected compared to sites that keep translation adjacent to its ayah even in a
  flowing view.

Hold off on implementation until the client confirms which of these (or something else)
they mean.

---

## M6-05 — Card creation text not centered

**STATUS: Fixed, deployed to production, build/lint verified.** Not independently
re-checked visually in a live browser (no browser tool available this session).

Root cause identified with high confidence — `src/components/media-maker/AyahCardDesigner.tsx`:

- Line 250: the Arabic ayah paragraph is `text-right` (in an RTL block, "right" is the
  *start* edge — visually equivalent to left-aligned text in an LTR layout, not centered).
- Line 255 (translation) and lines 268/273/282 (surah name, verse key, footer label) set
  no `text-align` at all, so they default to `start` (left, since the card container
  itself isn't `dir="rtl"`).

None of the card's text blocks are ever centered — this reads as a straightforward
styling gap against whatever the intended card design was (typical shareable
ayah-card/quote-card layouts center all text blocks).

**Fix applied:** the Arabic paragraph is now `text-center` (was `text-right`), and the
translation paragraph is now `mx-auto text-center` (was unaligned, and not centered as a
block despite its `max-w-[88%]`). Left the footer (surah name / verse key / watermark row)
edge-aligned, as originally planned — that split layout (attribution on one side,
branding on the other) reads as an intentional design choice, not the same bug; revisit
only if the client specifically calls it out too.

---

## Final Sign-Off Checklist gaps

The client flagged blank rows for Safari, Edge, and all five milestone regression checks
(M1–5) — the brief treats regressions as a Red Flag category, so this needs a deliberate
pass, not a rubber-stamp. `docs/regression-checklist.md` exists internally and is marked
fully passed as of `250342d`, but per the note at the top of this document, that pass
predates real-environment validation of the Firestore migration and should be re-run
against the actual deployed site — not just checked off from the existing (stale) record —
once M6-01 is fixed. Safari/Edge have no existing internal pass to fall back on and need a
first-time run.
