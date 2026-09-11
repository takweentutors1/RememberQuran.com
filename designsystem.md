# Quran.com Design System
_Reverse-engineered from the live `/ali-imran` (Surah Aal-i-Imran) reading page — Next.js app, CSS Modules, tokens extracted directly from shipped stylesheets._

---

## 1. Foundations

### 1.1 Color Tokens

Quran.com uses a two-theme token system (`light` / `dark`) driven by CSS custom properties on `:root`, swapped via `prefers-color-scheme` / a theme class. Everything is referenced through semantic aliases, never raw hex, in component CSS.

**Neutral scale (`--shade-0` → `--shade-9`)** — same values in both themes, just applied in reverse:

| Token | Value |
|---|---|
| `--shade-0` | `#f8f9fa` |
| `--shade-1` | `#f4f5f6` |
| `--shade-2` | `#e9ecef` |
| `--shade-3` | `#dee2e6` |
| `--shade-4` | `#ced4da` |
| `--shade-5` | `#adb5bd` |
| `--shade-6` | `#868e96` |
| `--shade-7` | `#495057` |
| `--shade-8` | `#343a40` |
| `--shade-9` | `#212529` |

**Semantic tokens — Light theme**

| Token | Value | Use |
|---|---|---|
| `--color-primary-medium` | `#000` | Primary brand action color |
| `--color-secondary-deep` | `#333` | Secondary text/ink |
| `--color-text-default` | `#272727` | Body text |
| `--color-text-faded` | `#666` | Muted / metadata text |
| `--color-text-link` | `#2ca4ab` | Links, the signature teal |
| `--color-text-inverse` | `#fff` | Text on dark surfaces |
| `--color-background-default` | `#fff` | Page background |
| `--color-background-alternative-faded` | `#f8f9fa` (shade-0) | Verse highlight background |
| `--color-background-alternative-faint` | `#f4f5f6` (shade-1) | Cards, subtle panels |
| `--color-background-backdrop` | `rgba(0,0,0,.6)` | Modal/overlay scrim |
| `--color-borders-hairline` | `#ebeef0` | Dividers, card borders |
| `--color-highlight` | `#79ffe1` | Word-level playback/reading highlight |
| `--color-success-medium` | `#2ca4ab` | Success / brand teal |
| `--color-error-medium` | `#ee0102` | Error state |
| `--color-warning-medium` | `#ffb300` | Warning state |
| `--color-blue-buttons-and-icons` | `#2ca4ab` | Icon/link accent |
| `--color-qdc-blue` | `#22a5ad` | "Quran.com" brand teal |
| `--color-streaks-dark` / `--color-streaks-light` | `#38794b` / `#e4f4e9` | Reading-streak gamification |

**Semantic tokens — Dark theme (overrides)**

| Token | Value |
|---|---|
| `--color-background-default` | `#1f2125` |
| `--color-text-default` | `#e7e9ea` |
| `--color-text-faded` | `#777` |
| `--color-borders-hairline` | `#464b50` |
| `--color-highlight` | `#2ca4ab` (swaps role with light-mode link teal) |
| `--color-background-backdrop` | `rgba(0,0,0,.8)` |

**Design principle:** near-monochrome UI (black/white/gray) with a single consistent teal (`#2ca4ab`) as the only saturated brand accent — used for links, icons, active/success states, and the logo. Warning/error reds and ambers exist only for system feedback, never decoration.

### 1.2 Typography

**Font families**

| Token | Stack | Role |
|---|---|---|
| `--font-family-figtree` | `"Figtree", sans-serif` | All UI chrome — nav, buttons, labels, body copy |
| `--font-family-kitab` | `"Kitab","UthmanicHafs","Figtree", sans-serif` | Generic Arabic fallback text |
| `--font-family-newsreader` | `"Newsreader", Georgia, serif` | Editorial/elegant serif accents (e.g. pull quotes) |
| `UthmanicHafs` | Custom `@font-face` (KFGQPC HAFS Uthmanic Script) | **The Mushaf Arabic text itself** — the actual Uthmani script glyphs |
| `surahnames` | Custom icon-font | Surah name glyphs in navigation |
| Locale fonts | `NotoNastaliq`, `MehrNastaliq` (Urdu), `DroidArabicNaskh` (Kurdish), `NotoSerifBengali`, `BeVietnamPro`, `divehi`, `IndoPak` | Per-language translation typography, loaded conditionally by `:lang()` |

This is a deliberate **three-tier type system**: a humanist grotesque (Figtree) for interface, a purpose-built Uthmani Quranic typeface for scripture, and dozens of locale-specific serif/naskh faces so every translation renders in its native, correct script.

**Type scale** (rem-based, with pixel-anchored aliases for consistency across zoom levels):

| Token | rem | px |
|---|---|---|
| `--font-size-xsmall` | 0.75rem | 12px |
| `--font-size-small` | 0.875rem | 14px |
| `--font-size-normal` | 1rem | 16–20px* |
| `--font-size-large` | 1.125rem | 18–24px* |
| `--font-size-large2` | 1.25rem | 20px |
| `--font-size-xlarge` | 1.5rem | 24–26px* |
| `--font-size-jumbo` | 2rem | 32–40px* |

_\*Note: the "-px" aliases (`--font-size-normal-px: 20px` etc.) are **not** 1:1 with the rem tokens of the same name — they're a separate legacy scale still used in some components. Treat rem tokens as canonical for new work._

**Font weights:** `light 300 · normal 400 · medium 500 · semibold 600 · bold 700 · extra-bold 800`

**Quranic text scale (Mushaf reading view):** a dedicated 10-step size ramp (`font-size-1` … `font-size-10`) exists per script style (`qpc_uthmani_hafs`, `tajweed_v4`, `code_v1/v2`, `indopak_15_lines`, `indopak_16_lines`). Line-height is computed in **viewport-height units** (`3.2vh` → `22vh` across the ramp) rather than fixed rem, so Arabic line spacing scales fluidly with screen size and user font-size preference simultaneously — this is what keeps the Mushaf page proportions authentic at any zoom level.

### 1.3 Spacing Scale

Two parallel scales coexist: a **rem-based semantic scale** (fluid with root font-size) and a **fixed px scale** (used for chrome that shouldn't reflow, e.g. navbar height).

| Token | Value |
|---|---|
| `--spacing-xmicro` | 0.125rem |
| `--spacing-micro` | 0.1875rem |
| `--spacing-xxsmall` | 0.375rem |
| `--spacing-xsmall` | 0.625rem |
| `--spacing-small` | 0.8125rem |
| `--spacing-medium` | 1rem |
| `--spacing-medium2` | 1.25rem |
| `--spacing-large` | 1.1875rem |
| `--spacing-mega` | 2rem |
| `--spacing-max` | 3rem |

Fixed-px counterparts run `2px → 100px` (`--spacing-micro-px` … `--spacing-mega-px`) for edge padding, page gutters (`--spacing-edge-horizontal-px: 20px`), and layout scaffolding.

### 1.4 Radius, Elevation, Motion

| Category | Tokens |
|---|---|
| **Radius** | `sharp: 0` · `default: 0.25rem` · `xsmall: 5px` · `small: 10px` · `rounded: 15px` · `large: 20px` · `xlarge/pill: 50px–20rem` · `circle: 50%` |
| **Shadows** | Layered, soft, low-opacity black (`rgba(0,0,0,.1–.3)`). Named by purpose, not size: `--shadow-sticky`, `--shadow-tooltip`, `--shadow-popover-menu`, `--shadow-end-surah-card`, `--shadow-surah-search`. In dark mode, shadows shift to opaque `var(--shade-9)` instead of translucent black. |
| **Transitions** | `fast: 0.16s` · `moderate: 0.2s` · `regular: 0.4s` · `slow: 0.6s` — short and snappy; nothing lingers past 600ms |
| **Z-index scale** | `sticky 300 → header 400 → overlay 500 → dropdown 600 → spinner 700 → modal 800 → onboarding 801-804 → ultra 1200` — a fully reserved, collision-free stacking system |

### 1.5 Breakpoints

Mobile-first-adjacent, but expressed mostly as `max-width` component overrides:

| Breakpoint | Width |
|---|---|
| `xs` | ≤374px |
| `sm` | ≤767px (mobile ceiling) |
| `md` | 768px–1023px (tablet) |
| `lg` | ≥1024px (desktop) |
| Content max-width | **1230px** (page/reader container cap, seen in `ChapterHeader`, `EndOfScrollingControls`) |

---

## 2. Layout Anatomy (Surah Reading Page)

```
┌─────────────────────────────────────────────┐
│ Navbar (fixed, 54px, z-index:400)            │  ← translate3d hide-on-scroll
├─────────────────────────────────────────────┤
│ Context/Reading-mode bar (56px / 47px mobile)│  ← sticky, page progress + tabs
├─────────────────────────────────────────────┤
│  ChapterHeader (max-width 1230px, centered)  │
│  ┌───────────────────────────────────────┐  │
│  │ [Surah #]  Surah Name (AR + translit)  │  │  ← CSS grid: auto | minmax(0,1fr)
│  │            meta row (verses, revelation)│  │
│  │ [Play] [Bookmark] [Options] ...        │  │  ← primary action row
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Bismillah (centered, calligraphic)          │
├─────────────────────────────────────────────┤
│  Verse blocks (repeating):                   │
│   RTL Arabic verse text (Uthmani glyphs)     │
│   Translation text (LTR/RTL by locale)       │
│   [translator credit · reference link]       │
├─────────────────────────────────────────────┤
│  EndOfSurah card grid (3-col → 1-col mobile) │
│  Next/Prev surah CTA row                     │
└─────────────────────────────────────────────┘
```

**Key structural rules extracted from CSS:**
- Verse Arabic text container: `direction: rtl`, `text-align: center`, `display:flex; flex-direction:column`, gapped with `--spacing-medium`.
- Translation text switches `direction`/`text-align` per-locale (`ltr`/`rtl` variants), and swaps font-family per language automatically via `[lang]` attribute selectors — not manual class toggling.
- Chapter header uses **CSS Grid** (`auto minmax(0,1fr)`) so the surah-number badge and title block align regardless of title length.
- Word-level highlight during audio playback is a background-color swap (`--color-highlight`), not an outline/border — keeps the Mushaf line metrics stable.

---

## 3. Components

### 3.1 Button

Single base class + modifier tokens driving CSS variables (`--themed-bg/fg/border`) — a clean variant pattern:

```css
.Button_base { 
  display:inline-flex; align-items:center; justify-content:center;
  border-radius: var(--border-radius-default);
  font-weight: var(--font-weight-medium);
  transition: transform var(--transition-fast);
  block-size: var(--button-size);
}
```

| Variant | Background | Foreground |
|---|---|---|
| `primary` | `--color-primary-medium` (black) | white |
| `secondary` | page background | `--color-text-faded`, hairline border |
| `success` / `warning` / `error` | semantic color | white |
| `inverse` | white | black |

Sizes set `--button-size` directly: `large = 3× spacing-medium`, `small = 2× spacing-medium`, `xsmall = 27px`, `xxsmall = spacing-medium2-px`. Shape modifiers (`square`, `circle`, `pill`) are purely `border-radius` + `inline-size` overrides layered on top — every button is one flexbox primitive with swappable geometry.

### 3.2 Verse / Quran Text Block

- `.VerseText_verseTextContainer`: `direction:rtl; text-align:center; flex-direction:column`.
- Per-script CSS classes (`qpc_uthmani_hafs`, `tajweed_v4`, `indopak_16_lines`, …) each carry their own 10-step font-size + viewport-relative line-height ramp — the reading experience is font-accurate per Mushaf script, not just a generic Arabic font swap.
- `.VerseText_highlighted` = background-color only (word/verse playback sync).
- Skeleton loading states use matching `vw`-based heights per font-size step, so the loading placeholder never causes layout shift once real Arabic glyphs paint in.

### 3.3 Translation Text

- `.TranslationText_ltr` / `.TranslationText_rtl` toggle direction and alignment.
- `.TranslationText_translationName`: small, faded, sits under the translation as attribution.
- `.TranslationText_referenceLink`: teal link color, verse-jump reference.
- Locale-specific overrides (`urdu`, `kurdish`, `divehi`) force `!important` font-family swaps — a pragmatic override layer for languages that must not fall back to Figtree.

### 3.4 Navbar

- `position: fixed`, `block-size: 54px`, `z-index: 400`.
- Hide-on-scroll via `translate3d(0, -100%, 0)` with staggered easing (`ease-out` on show, `ease-in` on hide) — asymmetric motion so it disappears quickly but reappears smoothly.

### 3.5 Cards (End of Surah)

- Grid: `repeat(3, 1fr)` desktop → `repeat(2, 1fr)` tablet → `1fr` mobile, consistent `--spacing-medium2` gap at every step — a single responsive grid formula, no separate mobile stylesheet.

---

## 4. Design Principles (inferred)

1. **Scripture is sacred, chrome is invisible.** UI uses near-grayscale (blacks, whites, grays) so nothing competes visually with the Arabic text or translation. The only color accent (`#2ca4ab` teal) is reserved for interactive/brand elements, never decoration.
2. **Typography does the heavy lifting.** Three font families cover three jobs (UI / Quranic script / editorial), plus ~10 more for locale-correct translation rendering — visual identity comes from type choice, not color or ornament.
3. **Viewport-relative Quran typography.** Arabic line-height in `vh` units (not `rem`/`px`) is the key technical decision that keeps Mushaf-style pagination proportions authentic across screen sizes and 10-step user font preferences.
4. **Token-driven theming, not duplicated CSS.** Dark mode is a `:root` variable swap, not parallel stylesheets — every component references semantic tokens (`--color-text-default`), never raw values.
5. **Motion is utilitarian.** Sub-second transitions (160–600ms) exist only to soften state changes (nav hide, hover) — no decorative animation.
6. **Single grid formula, three breakpoints.** Layouts collapse column counts (3→2→1) rather than restructuring, keeping spacing rhythm (`--spacing-medium2`) constant regardless of viewport.

---

## 5. Raw Token Reference

Full extracted `:root` block (light theme) for direct reuse:

```css
:root {
  /* spacing */
  --spacing-xmicro: 0.125rem; --spacing-micro: 0.1875rem; --spacing-xxsmall: 0.375rem;
  --spacing-xsmall: 0.625rem; --spacing-small: 0.8125rem; --spacing-medium: 1rem;
  --spacing-medium2: 1.25rem; --spacing-large: 1.1875rem; --spacing-mega: 2rem; --spacing-max: 3rem;

  /* type */
  --font-size-xsmall: 0.75rem; --font-size-small: 0.875rem; --font-size-normal: 1rem;
  --font-size-large: 1.125rem; --font-size-large2: 1.25rem; --font-size-xlarge: 1.5rem; --font-size-jumbo: 2rem;
  --font-weight-light: 300; --font-weight-normal: 400; --font-weight-medium: 500;
  --font-weight-semibold: 600; --font-weight-bold: 700; --font-weight-extra-bold: 800;
  --font-family-figtree: "Figtree", sans-serif;
  --font-family-kitab: "Kitab","UthmanicHafs","Figtree", sans-serif;
  --font-family-newsreader: "Newsreader", Georgia, serif;

  /* radius */
  --border-radius-sharp: 0; --border-radius-default: 0.25rem; --border-radius-rounded: 15px;
  --border-radius-pill: 20rem; --border-radius-circle: 50%;

  /* color (light) */
  --color-text-default: #272727; --color-text-faded: #666; --color-text-link: #2ca4ab;
  --color-background-default: #fff; --color-background-alternative-faded: #f8f9fa;
  --color-borders-hairline: #ebeef0; --color-highlight: #79ffe1;
  --color-primary-medium: #000; --color-success-medium: #2ca4ab;
  --color-error-medium: #ee0102; --color-warning-medium: #ffb300;

  /* motion */
  --transition-fast: 0.16s; --transition-moderate: 0.2s; --transition-regular: 0.4s; --transition-slow: 0.6s;

  /* z-index */
  --z-index-sticky: 300; --z-index-header: 400; --z-index-overlay: 500;
  --z-index-dropdown: 600; --z-index-modal: 800; --z-index-ultra: 1200;
}
```

---

_Extracted from live `_next/static/css/*.css` bundles served on `quran.com/ali-imran`, Next.js build `ohWkp5mdgh1z8lwH81N6Z`. Values are exact as-shipped; verify against the current deployment before treating as a long-term contract, as Quran.com ships frequent frontend updates._
