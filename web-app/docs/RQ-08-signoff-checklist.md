# RQ-08 — What's needed to close the Final Sign-Off Checklist

RQ-08 isn't a code bug — it's four categories of testing/documentation that were
either never run against the live site or never actually recorded, despite
`Milestone_6_Submission.pdf` narratively claiming cross-browser testing "Passed"
and a "self-regression check confirmation." Those claims predate this round of
fixes and, per RQ-03, weren't accurate for the account system at the time they
were made — so this needs a real pass now, not a rubber-stamp of the existing
claim.

Two documents already exist in this repo for exactly this purpose and are both
still blank/stale. Fill these in — they're what QA should actually receive as
evidence, not a fresh document:

- **`docs/cross-platform-testing.md`** — the browser/device matrix, currently
  every row marked "⏳ Pending". Covers items 1–2 below.
- **`docs/regression-checklist.md`** — the M1–M6 feature list, currently all
  checked ✅ as of commit `250342d` (2026-08-14) — but that predates this
  session's fixes and was proven wrong for M4 (RQ-03: account system was
  completely broken in production despite this file claiming "Registration,
  Login, and Logout flows work"). Re-run it for real; don't trust the existing
  checkmarks. Covers item 3 below.

---

## 1. Safari compatibility

Run the "Core Testing Scenarios" already listed in `docs/cross-platform-testing.md`
(reading/navigation, audio playback, study tools, accounts/modals, performance
impression) against:

- **Desktop Safari** (macOS, latest)
- **Mobile Safari** (iOS, latest) — this one matters more than usual here:
  iOS Safari has stricter autoplay/audio-unlock rules than Chrome, and this is
  an audio-heavy app (persistent mini-player, radio mode, word-click
  pronunciation, background/lock-screen playback via Media Session). Confirm
  specifically:
  - First tap on any Play button actually starts audio (no silent failure)
  - Lock-screen / Control Center media controls show the surah name and work
    (play/pause/next/prev — `AudioPlayerContext.tsx`'s Media Session wiring)
  - Radio mode survives backgrounding the browser tab/app

Record pass/fail + notes per scenario in the matrix's Status column.

## 2. Edge compatibility

Same "Core Testing Scenarios" against **Edge (Windows, latest)**. Edge is
Chromium-based so major functional breakage is unlikely, but check specifically
for anything Windows/Edge-specific: font rendering of the Arabic script
(`UthmanicHafs`/Amiri — Windows font fallback can differ from mac/Linux),
scrollbar-affected layouts, and the PNG export in Media Maker (uses
`html-to-image`, worth a direct check since canvas rendering can behave
differently across engines).

## 3. Milestones 1–5 regression pass

Re-run **every row** of `docs/regression-checklist.md` against the live
production site (`https://remember-quran-com.vercel.app`), not local dev —
that distinction is exactly what let the M4 account-system breakage go
unnoticed last time. In particular, prioritize re-checking the areas RQ-03
blocked before this session's fixes:

- **M4:** registration, login, logout, password reset, account settings
  (email/password change), bookmarks + collections, notes, "continue where you
  left off," reading goals/streaks, Media Maker export, guest-mode access to
  reading/audio/study features
- **M2:** persistent mini-player and word-highlight sync — re-verify the
  surah-switch behavior specifically (RQ-04 was just fixed: play a surah,
  navigate to another, press play, confirm it switches cleanly)
- **M3:** tafsir panel, specifically quoted-ayah rendering (RQ-05 was just
  fixed — confirm quoted ayaat now show in the correct Arabic font and RTL)

The full M1–M5 item list is already in that file; go through it top to bottom
and update it in place rather than re-deriving it.

## 4. No-ads / pop-ups / broken-pages check

Not covered by either existing doc — this needs a fresh pass. The app's own
footer already claims "Free forever · no ads · no tracking," so this should be
a clean pass, but it needs to actually be walked rather than assumed:

- **No ads / no unexpected pop-ups:** confirm no ad units, no cookie-consent
  banner, no newsletter/email-capture modal, no auto-opening dialog anywhere
  in the flow (the app does have legitimate modals — `SoftGateDialog` prompting
  guests to sign in, the Settings sheet, the media-maker share sheet — those
  are fine; flag anything that opens *without* a user action triggering it)
- **Broken-pages sweep** — check each of these loads without a 404/500 or a
  visibly broken layout:
  - `/`, `/search`, `/radio`, `/media-maker`, `/login`, `/register`, `/reset`,
    `/privacy`, `/terms`
  - A sample of surah pages, not just the first one — boundary cases matter
    most: `/1` (shortest), `/2` (longest, 286 ayahs — the one page most likely
    to show performance/layout issues), `/114` (last), plus a deep ayah link
    e.g. `/2/255`
  - `/account` and each of its six sub-pages (bookmarks, notes, goals, hifz,
    progress, settings) — both logged-in and logged-out (should redirect/soft-gate
    cleanly, not error)
  - An intentionally invalid surah number (e.g. `/999`) — should hit the
    custom not-found page, not a raw error
  - Both light and dark mode for all of the above

## 5. Branding-consistency check

Source of truth: **`docs/DESIGN-SYSTEM.md`** (the "Nur" system — ink-on-ivory
with a single gold accent reserved for ayah numbers/ornament/search
highlights, max ~4 gold marks per viewport, no animation on Arabic glyphs).
Check the live site against it, in both light and dark mode:

- Logo/wordmark identical across header, footer, and the OG share image
  (`/api/og/ayah`)
- Colour tokens match the documented hex values — no leftover accent colours
  from an earlier design pass
- Gold accent used sparingly per the system's own rule, not scattered
- Typography consistent: Arabic script font and translation serif font the
  same across the reader, tafsir panel (RQ-05's fix should now make this
  true for quoted ayaat too), and the ayah-card generator

**Also worth knowing before this pass:** `docs/DESIGN-ROLLOUT.md` (dated
2026-08-12) documented specific files still on an older visual language at
that time — reader action buttons, several audio components, all seven
account views, and the auth/study/search forms. Several UI-focused commits
have landed since then (`c48d9ec`, `3f31a56`, `d6b47bb`, `0364b0b`), so that
list may already be stale/resolved — but it's the fastest way to know exactly
*where* to look first rather than eyeballing the whole site cold. Spot-check
those specific files/pages before assuming the doc is out of date.

---

## What I can help automate vs. what needs a human

I can script an automated sweep for parts of #3 and #4 — page-load/console-error
checks across the route list above, and a Chromium-based proxy for Edge's
functional scenarios (Edge is Chromium under the hood, so this is a reasonable
stand-in for *functional* checks, though not a substitute for an actual Edge
run on the font-rendering/canvas-export points above). I can't script real
Safari/WebKit or iOS testing from this environment, and the visual/subjective
calls in #5 (does this *look* consistent) and the "no unexpected pop-up"
judgment in #4 need an actual person looking at it. Say the word if you want
me to run the automatable parts now.
