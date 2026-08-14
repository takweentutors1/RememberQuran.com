# Cross-Platform Testing Matrix

This document tracks the manual testing required for Milestone 6 across different browsers and devices.

## Browsers (Desktop)

| Browser | OS | Version | Status | Notes / Issues |
|---|---|---|---|---|
| Chrome | macOS/Windows | Latest | ⏳ Pending | |
| Firefox | macOS/Windows | Latest | ⏳ Pending | |
| Safari | macOS | Latest | ⏳ Pending | |
| Edge | Windows | Latest | ⏳ Pending | |

## Devices (Mobile & Tablet)

| Device | OS | Browser | Status | Notes / Issues |
|---|---|---|---|---|
| iPhone (recent model) | iOS | Safari | ⏳ Pending | |
| iPad | iPadOS | Safari | ⏳ Pending | |
| Android Phone | Android | Chrome | ⏳ Pending | |
| Android Tablet | Android | Chrome | ⏳ Pending | |

## Core Testing Scenarios

For each platform above, run through the following critical paths:

1. **Reading & Navigation:**
   - Load homepage.
   - Navigate to a surah.
   - Scroll through the surah (check for jank or layout shifts).
   - Open translation and settings panels.

2. **Audio Playback:**
   - Play a surah.
   - Verify word-by-word highlight works.
   - Test background audio (if applicable on mobile).
   - Test repeat options.

3. **Study Tools:**
   - Open tafsir panel (ensure it fits on screen, especially on mobile).
   - Toggle Tajweed (check colors are visible).
   - Test keyword search.

4. **Accounts & Modals:**
   - Open login modal (check mobile keyboard doesn't obscure inputs).
   - Check settings page.
   - Export an ayah image via Media Maker (ensure canvas renders correctly on mobile).

5. **Performance Impression:**
   - Does the initial load feel fast (<3s)?
   - Does audio start within <2s of pressing play?

Please update the `Status` column to ✅ Pass or ❌ Fail and add notes for any issues discovered.
