# RememberQuran — Design System

**Codename:** Nur (نور) — light.
**Principle:** the Quran is the only thing on the page allowed to be loud.

Everything here is implemented in `src/app/globals.css`. This document is the
contract; the CSS is the source of truth. If they disagree, the CSS wins and
this file is stale — fix it.

---

## 1. Philosophy

Four rules, in priority order. When they conflict, the lower number wins.

1. **Arabic gets the light.** Every surface behind Quranic text is the lightest
   tone available in the mode. Chrome sits on the darker sunk tone. The eye
   lands on the text before it lands on the UI.
2. **Never animate Arabic.** No transform, scale, opacity, or filter on a glyph.
   Word-sync highlighting is `background-color` only. A shifting glyph breaks
   reading and reads as disrespectful.
3. **One accent, one gold.** `--primary` (ink) marks state — active, playing,
   selected. `--brand-gold` marks the sacred frame only — ayah numbers,
   ornament, root letters, search highlight. Maximum four gold marks per
   viewport. Nothing else is coloured.
4. **Quiet by default.** If a border, shadow, or animation can be removed
   without losing meaning, remove it.

---

## 2. Colour

Nur is ink on ivory with a single amber accent. It is deliberately close to
monochrome so that gold carries real weight when it appears.

### Light

| Token | Hex | Role |
|---|---|---|
| `--background` | `#FBFAF7` | Page canvas |
| `--card` / `--popover` | `#FFFFFF` | Raised surface, ayah rows on hover |
| `--muted` / `--secondary` | `#F2F0EA` | Sunk surface, chrome, inputs |
| `--surface-sunk` | `#E9E6DE` | Deepest — track fills, skeleton base |
| `--foreground` | `#15161A` | Body text |
| `--muted-foreground` | `#53565E` | Supporting text |
| `--foreground-subtle` | `#8A8D95` | Captions, metadata |
| `--foreground-faint` | `#B4B6BC` | Column headings, disabled |
| `--border` | `#E8E5DD` | Default hairline |
| `--border-strong` | `#D3CFC4` | Emphasised divider, control borders |
| `--primary` | `#15161A` | Brand / active state |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--accent` | `#EEEDE8` | Primary tint — active nav, chips |
| `--brand-gold` | `#B07C22` | Sacred accent |
| `--brand-gold-strong` | `#8A5F16` | Gold text on gold-soft (AA) |
| `--brand-gold-soft` | `#FAF0DC` | Gold tint fill |
| `--reader-ink` | `#0D0E11` | Arabic glyph colour |

### Dark

True dark, not inverted grey. `#0C0C0E` page with warm off-white glyphs at
`#F7F5F0` — built for night reading without eye strain.

| Token | Hex |
|---|---|
| `--background` | `#0C0C0E` |
| `--card` / `--popover` | `#151618` |
| `--muted` / `--secondary` | `#1D1E22` |
| `--surface-sunk` | `#08080A` |
| `--foreground` | `#F2F1ED` |
| `--muted-foreground` | `#A6A8AE` |
| `--foreground-subtle` | `#74767C` |
| `--foreground-faint` | `#54565C` |
| `--border` | `#232427` |
| `--border-strong` | `#33353A` |
| `--primary` | `#F2F1ED` |
| `--primary-foreground` | `#0C0C0E` |
| `--accent` | `#1C1D20` |
| `--brand-gold` | `#E0AE55` |
| `--brand-gold-strong` | `#F0C378` |
| `--brand-gold-soft` | `#221A0C` |
| `--reader-ink` | `#F7F5F0` |

### Rules

- **Never hardcode a hex in a component.** Use the token. A raw `#333` is
  invisible in dark mode and will not be reviewed through.
- **Gold text on gold fill** uses `--brand-gold-strong`, never `--brand-gold` —
  the base gold fails AA on `--brand-gold-soft` in light mode.
- **Tajweed colours are exempt** from the one-accent rule. They are semantic
  data, not decoration, and live in their own `--tj-*` namespace with a full
  dark ramp.
- `--primary` in dark mode is *light*. Any `bg-primary` must pair with
  `text-primary-foreground`, never a hardcoded white.

---

## 3. Typography

| Family | Variable | Use |
|---|---|---|
| Inter (system fallback) | `--font-sans` | All UI chrome |
| Source Serif 4 | `--font-serif` | Translations, editorial voice |
| KFGQPC Uthmanic Hafs | `--font-uthmani` | Quranic Arabic — default |
| Amiri Quran | `--font-amiri-quran` | Quranic Arabic — alternate |

Scale: h1 30px / h2 20px / h3 17px / body 14px / caption 12px / micro 11px.
**Two weights only — 400 and 500.** 600 and 700 read heavy against the hairlines
and are not used anywhere in chrome. Sentence case everywhere; Title Case is for
proper nouns only.

Arabic sizing is user-controlled via `--arabic-font-size` (scale 1–6, see
`src/lib/readerFonts.ts`). Never hardcode a size on `.quran-arabic`.

---

## 4. Motion

```css
--dur-fast:  120ms   /* colour, opacity */
--dur-base:  180ms   /* hover, press, most transitions */
--dur-slow:  260ms   /* panels, accordions, entrance */
--dur-glacial: 1400ms /* one-shot: progress rings, count-up */

--ease-out:      cubic-bezier(.16, 1, .3, 1)   /* the default */
--ease-in:       cubic-bezier(.7, 0, .84, 0)
--ease-overshoot: cubic-bezier(.3, 1.5, .5, 1)  /* springs only */
```

**Ceilings.** Nothing interactive exceeds `--dur-slow`. One-shot celebratory
motion (a ring filling on mount) may use `--dur-glacial` but must never re-run
on re-render.

**Property allowlist.** Animate `transform`, `opacity`, `background-color`,
`border-color`, `box-shadow`, `max-height`. Never `width`, `height`, `top`, or
`left` — they force layout on every frame.

**Reduced motion.** `@media (prefers-reduced-motion: reduce)` collapses every
duration to `0.01ms` globally in `globals.css`. Do not re-implement this
per-component.

### Vocabulary

| Interaction | Behaviour |
|---|---|
| Button press | Ripple from the click point + `scale(.98)` |
| Card hover | `translateY(-3px)` + shadow step, `--dur-base` |
| Surah diamond | Rotates 45° → 90°, border goes gold, `--dur-slow` |
| Bookmark | Icon `scale(1.2)` on `--ease-overshoot` + six gold particles |
| Nav underline | 1.5px rule, `scaleX(0) → 1` from the left, `--dur-slow` |
| Footer link | 11px arrow slides in + gold hairline grows to text width |
| Counters | Count from 0 over 1.2s, `tabular-nums` so digits never jitter |
| List entrance | Fade up 10px, 8ms stagger, capped at 200ms total |
| Accordion | `max-height` over `--dur-slow`, chevron rotates 180° in step |
| Toast | Rise 8px + fade, hold 2.5s, leave |
| Loading | Skeletons in the real layout. Never a spinner. |

---

## 5. Shape and elevation

```css
--radius: 0.625rem   /* 10px — controls, buttons, inputs */
--radius-sm  = radius * .6
--radius-md  = radius * .8
--radius-lg  = radius
--radius-xl  = radius * 1.4  /* cards, panels */
```

Three shadow steps, `--shadow-sm|md|lg`, each darkening in dark mode. Never
more than two floating layers on screen. A third means a dialog, not another
popover.

Borders are `1px solid var(--border)` by default. Use `--border-strong` only
for controls the user is expected to click.

---

## 6. Layout

`site-shell` (`max-w-6xl`, centred) is the single width contract shared by
navbar, page shells, footer, and the audio bar. Do not introduce a second
max-width.

**Breakpoints:** `sm:640` `md:768` `lg:1024` `xl:1280`.

**Reader** is three columns at `lg` and up — nav 236px / reader fluid / study
panel 300px. Below `lg` the side columns become overlays.

**Mobile** is thumb-first: bottom tab bar, mini-player floating above it, all
primary actions in the lower third. Minimum touch target 44×44.

---

## 7. Page anatomy

### Home
1. Ayah of the day — Arabic is the hero, not a marketing headline
2. Continue reading (returning users are the majority of traffic)
3. Quick access tiles
4. All 114 surahs, filterable
5. Footer

### Reader
Ayahs are **hairline-separated rows, not cards.** 110 stacked cards is visual
noise; a continuous column reads like a mushaf. Per-ayah actions fade in on
hover (desktop) or are always present (touch).

### Footer
1. Closing dua — the page ends the way a study session should
2. Five columns mirroring the app, not a marketing site
3. **Attribution band** — mushaf script, translator, API, reciters, corpus.
   This is a first-class section, never fine print. For a Quran app,
   provenance *is* the product.
4. Bottom bar — copyright, three-state theme control, back to top

"Report a mistake" is prominent by design. A typo in Quranic text is a
correctness incident; users need one obvious route to report it.

---

## 8. Accessibility

- Contrast: AA minimum, AAA on body copy. Every pair above is checked in both
  modes.
- Focus: `:focus-visible` only, 2px gold ring with a 2px background offset.
  Never `outline: none` without a replacement.
- Touch targets ≥ 44×44 on mobile; ≥ 32×32 for dense desktop icon rows.
- All Arabic carries `lang="ar"` and `dir="rtl"`.
- Icon-only controls carry `aria-label`. Decorative icons carry `aria-hidden`.
- Live regions on audio state so screen readers announce ayah changes.

---

## 9. Performance rules

These are not suggestions — they are why the reader stays at 60fps with a
6,236-ayah dataset.

- **Word-sync state never goes through React context.** It updates at audio
  frequency. Use `playbackStore` + `useSyncExternalStore` selectors so only the
  active word re-renders.
- **Memoise parsed tajweed.** Parsing is expensive per word and the result is
  pure — cache it.
- **`content-visibility: auto`** on long lists (the 114-surah grid) so the
  browser skips layout and paint for off-screen rows.
- **Server components by default.** `"use client"` only where there is state,
  an effect, or a browser API. Push the boundary as far down the tree as it
  will go.
- **No layout-triggering animation.** See the property allowlist above.
- **Stagger caps.** Entrance delays are `min(index * 8ms, 200ms)`. An
  un-capped stagger on 114 items is a 900ms wait.
- Fonts: `display: swap`, subset to the Arabic unicode ranges, preconnect to
  the CDN.

---

## 10. Conventions

- `cn()` from `src/lib/utils.ts` for every className composition.
- `useEffect` + `.then()` for client fetching — not `async/await` inside the
  effect. Enforced by lint in this project.
- Verse keys are `"surah:ayah"` strings; parse with `parseVerseKey()`.
- Fetch on the server in `page.tsx`, pass down via props or context.
- `getSessionUserId()` at the top of every `/api/account/*` handler.
- Translation IDs are numbers — validate with `isRegisteredTranslationId()`.

---

## 11. Content voice

Sentence case. Contractions. Active voice, verb first. No exclamation marks in
system copy. No "please", no "successfully", no "simply" or "just".

- Buttons: verb first, 1–3 words. "Create collection", not "Submit".
- Errors: what happened, then what to do. No `Error:` prefix, no first person.
- Empty states: an invitation, not an apology. Never "Nothing here yet".
- The user's things are **your** — "Your bookmarks", never "My bookmarks".

Religious terminology is transliterated consistently and never abbreviated:
*ayah*, *surah*, *juz*, *hifz*, *tafsir*, *asbab al-nuzul*, *tajweed*.
