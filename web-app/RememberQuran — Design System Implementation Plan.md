# RememberQuran — Design System Implementation Plan

A concrete, file-by-file upgrade plan to align the codebase with the RememberQuran Design System. No business logic or data-fetching is changed — this is a pure UI/design pass.

> [!IMPORTANT]
> Work through sections in order. Each section depends on the tokens established by the one before it. Do not skip to components before finishing the CSS token layer.

---

## Current State Analysis

| Area | Current State | Target State |
|---|---|---|
| **Primary font** | `Source Serif 4` (prose), `Amiri`/`Amiri Quran` (Arabic) | `Newsreader` (prose), `Public Sans` (UI), `Noto Naskh Arabic` (Arabic UI), `JetBrains Mono` (mono) |
| **Primary color** | `#15161a` (black-ink) as `--primary` | `#0e6b57` (jade) as brand action color |
| **Background** | `#fbfaf7` (near-white) | `#fdfbf6` (warm cream) — nearly identical, minor warmth shift |
| **Dark mode** | `#0c0c0e` (near-black) | `#0b0a08` (warmer near-black) |
| **Border radius** | `--radius: 0.625rem` (10px base) | `--radius-card: 14px`, `--radius-field: 10px`, `--radius-pill: 9999px` |
| **Shadows** | Cool-tinted rgba shadows | Warm-tinted paper shadows (`rgba(43,41,37,…)`) |
| **Nav active state** | Spring-animated pill (`framer-motion`) | Jade underline (2px gold) or jade filled pill — calm, no spring |
| **Logo hover** | `scale(1.035) rotate(-1deg)` spring | Remove scale/rotate — subtle opacity transition only |
| **Motion** | Mix of spring + tween, some overshoots | Strict: 140/220/360ms, ease-out only, no spring, no bounce |
| **Preload tag** | Points to old CDN for UthmanicHafs | Points to `/fonts/UthmanicHafs1Ver18.woff2` (now local) |

---

## Section 1 — Global Styles (`src/app/globals.css`)

### 1.1 — Add Google Fonts `@import`

Add at the very top of `globals.css`, before the Tailwind `@import` lines:

```css
@import url("https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Public+Sans:wght@400;500;600&family=Noto+Naskh+Arabic:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap");
```

> [!NOTE]
> These will be replaced by `next/font/google` imports in `fonts.ts` (Section 2) for production. The `@import` is a quick-start fallback.

### 1.2 — Update `@theme inline` font stack

In the `@theme inline` block (lines 17–70), update the font variables:

```css
/* REPLACE */
--font-sans: var(--font-sans);
--font-mono: var(--font-geist-mono);
--font-serif: var(--font-source-serif);

/* WITH */
--font-sans: var(--font-public-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono: var(--font-jetbrains-mono), ui-monospace, "Cascadia Code", monospace;
--font-serif: var(--font-newsreader), ui-serif, Georgia, serif;
--font-arabic-ui: var(--font-noto-naskh), var(--font-amiri), serif;
```

### 1.3 — Add Design System token extensions to `:root`

Add these new tokens to the `:root` block (after line 92):

```css
/* ── Typography scale ── */
--text-xs: 0.6875rem;    /* 11px */
--text-sm: 0.8125rem;    /* 13px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--tracking-caps: 0.09em;

/* ── Quran typography ── */
--quran-sm:      1.5rem;   /* 24px */
--quran-md:      2rem;     /* 32px */
--quran-lg:      2.5rem;   /* 40px */
--quran-display: 4.5rem;   /* 72px — media card only */
--quran-leading: 2.15;

/* ── Spacing ── */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-16: 64px;

/* ── Layout ── */
--container-sm:  640px;
--container-md:  820px;   /* reading view */
--container-lg:  1024px;
--container-xl:  1240px;  /* global max */
--measure-prose: 66ch;
--measure-quran: 44rem;

/* ── Fixed chrome heights ── */
--header-h: 56px;
--tab-bar-h: 60px;
--player-h: 72px;

/* ── Radius ── */
--radius-pill:   9999px;
--radius-field:  10px;
--radius-card:   14px;
--radius-modal:  28px;

/* ── Jade palette ── */
--jade-400: #4ec9a0;
--jade-500: #2aa583;
--jade-600: #1e8a6d;
--jade-700: #0e6b57;
--jade-800: #0c5f4d;
--jade-900: #094c3d;

/* ── Gold palette ── */
--gold-100: #faf5e4;
--gold-200: #f5ecc8;
--gold-300: #e6c982;
--gold-400: #d4a843;
--gold-500: #c49530;
--gold-600: #b58a45;

/* ── Warm shadows (paper-tinted) ── */
--shadow-paper-sm: 0 1px 2px rgba(43,41,37,0.06);
--shadow-paper-md: 0 2px 4px rgba(43,41,37,0.05), 0 8px 24px -8px rgba(43,41,37,0.14);
--shadow-paper-lg: 0 4px 8px rgba(43,41,37,0.06), 0 24px 56px -16px rgba(43,41,37,0.22);
--shadow-player:   0 -2px 12px rgba(43,41,37,0.1), 0 -1px 3px rgba(43,41,37,0.06);

/* ── Motion (strict ceiling) ── */
--dur-fast: 140ms;
--dur-base: 220ms;
--dur-slow: 360ms;
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);

/* ── Interaction ── */
--press-scale: 0.985;
--hover-lift: -1px;
--focus-ring: 2px solid var(--jade-600);
--focus-ring-offset: 2px;
```

### 1.4 — Update light theme color tokens (`:root` block, ~lines 99–148)

```css
/* Primary action → jade */
--primary: #0e6b57;
--primary-foreground: #ffffff;

/* Backgrounds → warmer cream */
--background: #fdfbf6;
--card: #ffffff;

/* Ring → jade */
--ring: #0e6b57;

/* Shadows → warm paper */
--elev-sm: var(--shadow-paper-sm);
--elev-md: var(--shadow-paper-md);
--elev-lg: var(--shadow-paper-lg);
```

### 1.5 — Update dark theme (`.dark` block, ~lines 154–197)

```css
--background: #0b0a08;
--card: #131210;
--primary: #4ec9a0;        /* jade-400 — lifted for contrast */
--primary-foreground: #0b0a08;
--ring: #2aa583;           /* jade-500 */
--reader-ink: #f5f3ee;
```

> [!WARNING]
> Remove the `apple`, `spotify`, and `airtable` theme blocks entirely (lines 201–399 approx). RememberQuran has one design identity. Multiple brand themes are a distraction and a maintenance burden. If the ThemeSwitcher only offers light/dark, remove those entries from `ThemeSwitcher.tsx` too.

### 1.6 — Update global body and typography

```css
body {
  font-family: var(--font-sans);
  background-color: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Quranic text — always Uthmanic Hafs */
.font-uthmani,
[data-quran-text] {
  font-family: var(--font-uthmani);
  line-height: var(--quran-leading);
  direction: rtl;
}

/* Arabic UI (surah names in lists) */
.font-arabic-ui {
  font-family: var(--font-arabic-ui);
}

/* Numerals / verse refs */
[data-numeric],
.font-mono {
  font-family: var(--font-mono);
}

/* Eyebrow labels */
.eyebrow {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}

/* Prose / display headings */
h1, h2, h3, .font-serif {
  font-family: var(--font-serif);
  font-weight: 400; /* size does the work, not bold */
}
```

### 1.7 — Add `prefers-reduced-motion` global collapse

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
```

### 1.8 — Fix the font preload tag in `src/app/layout.tsx`

Change the `<link rel="preload">` from the CDN URL to the local file:

```tsx
/* REMOVE */
href="https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2"

/* REPLACE WITH */
href="/fonts/UthmanicHafs1Ver18.woff2"
```

---

## Section 2 — Font Configuration (`src/lib/fonts.ts`)

Replace the entire file:

```ts
import {
  Newsreader,
  Public_Sans,
  Noto_Naskh_Arabic,
  JetBrains_Mono,
  Amiri,
  Amiri_Quran,
} from "next/font/google"

/** Display, long-form prose, headings — regular weight only. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  axes: ["opsz"],
})

/** All UI chrome: nav, labels, buttons, metadata. */
export const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-public-sans",
  display: "swap",
})

/** Arabic UI text — surah names in lists, NOT revelation text. */
export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  variable: "--font-noto-naskh",
  display: "swap",
})

/** Verse references, ayah numbers, numerals in metadata. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

/**
 * Kept as fallback for Quranic Arabic.
 * Primary Arabic is UthmanicHafs (local @font-face in globals.css).
 */
export const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
})

export const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-amiri-quran",
  display: "swap",
})
```

Update `src/app/layout.tsx` to inject the new font variables on `<html>`:

```tsx
import { newsreader, publicSans, notoNaskhArabic, jetbrainsMono, amiri, amiriQuran } from "@/lib/fonts"

// In the <html> className:
className={`
  ${newsreader.variable}
  ${publicSans.variable}
  ${notoNaskhArabic.variable}
  ${jetbrainsMono.variable}
  ${amiri.variable}
  ${amiriQuran.variable}
  h-full
`}
```

---

## Section 3 — Layout & Navigation Components (`src/components/layout/`)

### 3.1 — `Navbar.tsx`

**Issues:** Spring animation on logo hover, `size-3.5` icons (14px — too small per Design System's 24px nav icons), spring-based active pill.

**Changes:**
1. **Logo hover** — Remove the `motion.span` with `whileHover={{ scale, rotate }}` spring. Replace with a simple opacity transition:
   ```tsx
   /* REMOVE the motion.span wrapper around LogoWordmark */
   /* REPLACE WITH */
   <span className="inline-flex transition-opacity duration-[var(--dur-base)] hover:opacity-80">
     <LogoWordmark size="md" />
   </span>
   ```
2. **Nav icon size** — Change `className="size-3.5"` → `className="size-5"` (20px inline icons) on all `<Icon>` elements in `NavLinks`.
3. **Active pill** — Replace the `motion.span` spring pill with a CSS-only jade indicator:
   ```tsx
   /* REMOVE */
   {active && (
     <motion.span layoutId="navbar-active-pill" ... />
   )}
   /* ADD to the link className */
   active ? "text-primary border-b-2 border-primary rounded-none" : "text-muted-foreground hover:text-foreground"
   ```
4. **Scroll scale** — Remove `motion.div animate={{ scale: scrolled ? 0.96 : 1 }}`. The navbar should not physically shrink — it's disorienting. Keep the blur/border transition only.
5. **Icon stroke** — Confirm all `strokeWidth` values are `1.5` not `1.75`. Update `BookOpenText`, `Headphones`, `ImagePlus`, `Search` to `strokeWidth={1.5}`.

### 3.2 — `BottomNav.tsx`

**Changes:**
1. Set fixed height to `var(--tab-bar-h)` = 60px.
2. Active tab: jade text + 2px jade top border (not a filled pill).
3. Icon size: `size-6` (24px), `strokeWidth={1.5}`.
4. Background: `bg-background/95 backdrop-blur-xl` (glass — one of the two allowed blur surfaces).

### 3.3 — `ThemeSwitcher.tsx`

Remove all theme options except **light** and **dark**. The switcher should only toggle between the Nur light and Nur dark themes. Remove references to `apple`, `spotify`, `airtable`.

### 3.4 — `ArabesquePattern.tsx`

Confirm the pattern is used **only** in the hero/search band and in the floating Navbar. It should not appear on card hover states, in the reader, or in the player. Opacity must be ≤ 16% over cream-200.

### 3.5 — `Footer.tsx`

**Changes:**
1. Background: `bg-background` (cream) with `border-t border-border` (hairline top divider).
2. No gradient backgrounds.
3. Ensure "© 2026 RememberQuran · Public-benefit, ad-free" uses `·` (middle dot U+00B7) and `font-mono` for the dot.
4. Font: all footer copy in `font-sans`.

---

## Section 4 — Surah Directory (`src/components/surah-list/`)

### 4.1 — `SurahCard.tsx`

The card is already well-structured. Targeted changes:

1. **Border radius** — Change `rounded-xl` (12px) → `rounded-[14px]` to match `--radius-card`.
2. **Shadow** — Add `shadow-sm` class (which now resolves to `var(--shadow-paper-sm)`). On hover add `shadow-md` and `translate-y-[-1px]` — no scale transform.
3. **Arabic name** — Change `font-uthmani` → `font-arabic-ui` (`Noto Naskh Arabic`). The surah name in a list is UI text, not revelation. Uthmanic Hafs is reserved for the actual Quranic text.
4. **Metadata font** — The `{chapter.id}` numeral and `{chapter.verses_count} ayahs` span should have `font-mono` class.
5. **Primary color** — The hover color on the rosette SVG (`group-hover:text-gold`) is correct — gold for decoration. Keep it.

### 4.2 — `SurahFilter.tsx`

**Changes:**
1. Filter chips: `rounded-full` (pill), `border border-border`, `bg-transparent`.
2. Active chip: `border-primary bg-primary text-primary-foreground` (jade fill).
3. Transition: `duration-[var(--dur-base)] ease-[var(--ease-out)]`.
4. Font: `font-sans font-medium text-sm`.

### 4.3 — `HeroTile.tsx`

**Issues:** Uses `framer-motion` pointer-tracking for parallax. Design System prohibits parallax.

**Changes:**
1. **Remove pointer parallax** — Delete the `useMotionValue`, `useSpring`, `useTransform` hooks and the `style={{ x, y }}` transform applied to the calligraphy watermark. Replace with a static, centered watermark at 6% opacity.
2. **Remove `Sparkles` icon** — The Lucide `Sparkles` icon is a filled/sparkle glyph. Replace with `BookOpenText` or remove entirely.
3. **Eyebrow labels** — "Ayah of the day" and "On this day in Islamic history" should use the `.eyebrow` class (small-caps, tracked, `font-sans font-semibold text-xs uppercase tracking-[0.09em]`).
4. **Action buttons** — "Read in context" and "Make a card" should use the standard ghost button style (jade border on hover, not filled).
5. **Background** — Keep the cream-200 tint (`bg-secondary` or similar). Confirm the ArabesquePattern tile appears here at correct opacity.

### 4.4 — `QuickAccess.tsx`

**Changes:**
1. Each shortcut tile: house card style (`bg-card border border-border rounded-[14px] shadow-[var(--shadow-paper-sm)]`).
2. Icons: Lucide, `size-5`, `strokeWidth={1.5}`, `text-primary` (jade).
3. Labels: `font-sans font-medium text-sm`.
4. Hover: `translate-y-[-1px] shadow-[var(--shadow-paper-md)]` — no scale.

---

## Section 5 — Reader Components (`src/components/reader/`)

### 5.1 — `QuranReader.tsx`

**Changes:**
1. Reading container must have `max-w-[var(--container-md)] mx-auto` (820px, centred).
2. Mushaf column (Arabic-only): `max-w-[var(--measure-quran)]` (44rem), centred within the 820px container.
3. Scroll margin for ayah anchor targets: `scroll-mt-[calc(var(--header-h)+var(--space-4))]`.

### 5.2 — `AyahBlock.tsx`

**Issues:** `icon strokeWidth={1.75}` on all meta bar icons. `size-3.5` (14px) icons — too small.

**Changes:**
1. Change all `strokeWidth={1.75}` → `strokeWidth={1.5}` on `BookOpen`, `Copy`, `Share2`, `Check`, `ScrollText`, `ImageIcon`.
2. Icon size: keep `size-3.5` for the dense meta bar (this is the 18px dense metadata exception in the Design System). Acceptable.
3. **Active/playing highlight**: The `isTarget` state shows `bg-primary/5`. With jade as primary this will now be a jade wash — correct behaviour, no change needed.
4. **Dimmed state** — `opacity-60` is acceptable.

### 5.3 — `AyahNumber.tsx`

**Changes:**
1. Ayah number badge: gold-bordered rounded square, `font-mono`, `text-gold`, `border-gold/50`.
2. Class: `rounded-md border border-gold/40 text-gold font-mono text-xs px-1.5 py-0.5`.

### 5.4 — `TranslationBlock.tsx`

**Changes:**
1. Add `font-serif` (Newsreader) and `max-w-[var(--measure-prose)]` (66ch).
2. Text color: `text-muted-foreground` (warm ink, muted).
3. Font size: `text-base` (1rem) at default scale.

### 5.5 — `BismillahHeader.tsx`

**Changes:**
1. Font: `font-uthmani` (Uthmanic Hafs). Already likely correct.
2. Size: `text-[var(--quran-md)]` (32px) or larger.
3. Add a 1px gold rule above and below: `border-y border-gold/30 py-6 my-8`.
4. Centred: `text-center`.

### 5.6 — `FontTypeSelector.tsx` / `ReaderFonts`

The existing `uthmani`/`amiri` option labels already match the Design System. No functional change needed. Ensure the UI chip/toggle uses the pill radius and jade active state.

### 5.7 — `ReadingModeView.tsx`

**Changes:**
1. Container max-width: `max-w-[var(--measure-quran)]` (44rem).
2. Arabic text: `font-uthmani text-[var(--quran-md)] leading-[var(--quran-leading)]`.
3. Ensure the continuous mushaf view does not have dividers between verses — the reading mode should flow like a printed page.

---

## Section 6 — Audio Components (`src/components/audio/`)

### 6.1 — `MiniPlayer.tsx`

**Issues:** Uses `framer-motion AnimatePresence`. Entry animation may use spring or bounce.

**Changes:**
1. **Height** — Ensure the player bar height is exactly `var(--player-h)` = 72px.
2. **Background** — `bg-background/95 backdrop-blur-xl border-t border-border` (glass — one of the two allowed surfaces).
3. **Shadow** — `shadow-[var(--shadow-player)]` (upward-facing warm shadow).
4. **Button icons** — `size-5` (20px), `strokeWidth={1.5}` for Play, Pause, SkipBack, SkipForward, X.
5. **Progress bar** — Jade fill: `bg-primary` (now jade).
6. **Now playing label** — `font-sans font-medium text-sm`. Verse ref in `font-mono text-xs text-muted-foreground`.
7. **Entry animation** — Replace spring with: `initial={{ y: 72, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}` — this matches `--dur-slow` and `--ease-out`.
8. **Radio badge** — Change `bg-primary/10 text-primary uppercase tracking-wider` — this is now jade/10 which is correct. Keep it.

### 6.2 — `RadioPanel.tsx`

**Changes:**
1. Reciter rows separated by `<hr>` with `border-border` (hairline divider — 1px).
2. Active reciter: `text-primary font-medium` (jade text).
3. No card elevation on individual rows — only hairline dividers.

---

## Section 7 — Media Maker (`src/components/media-maker/AyahCardDesigner.tsx`)

**Changes:**
1. **Canvas border radius** — `rounded-[28px]` (`--radius-modal`).
2. **Card preset gradients** — Only two gradient options: jade gradient and gold gradient. No other gradient presets.
3. **Download/Copy buttons** — Standard jade primary button style (`bg-primary text-primary-foreground rounded-[10px]`).
4. **Reassurance copy** — "Free — no account needed" in `text-sm text-muted-foreground` — not in a badge or banner.
5. **Arabic font** — Canvas must render Uthmanic Hafs. Verify the OG image route (`src/app/api/og/ayah/route.tsx`) keeps Markazi Text for the satori constraint.

---

## Section 8 — Primitive UI Components (`src/components/ui/`)

### `button.tsx`
- Primary variant: `bg-primary text-primary-foreground hover:bg-[#0c5f4d] active:scale-[0.985] rounded-[10px]`.
- Ghost variant: `hover:bg-accent` (cream wash). No opacity fade on hover.
- Focus ring: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- Disabled: `opacity-45 cursor-not-allowed`.

### `input.tsx`
- `rounded-[10px] border border-border focus:border-primary focus:ring-2 focus:ring-primary/20`.

### `dialog.tsx` / `sheet.tsx`
- Modal radius: `rounded-[28px]`.
- Entry: fade + translateY(-8px → 0) at 360ms `ease-out`. No spring.

### `skeleton.tsx`
- Change from grey pulse to cream-toned: `bg-secondary animate-pulse rounded-[var(--radius-card)]`.

### `separator.tsx`
- `bg-border` (1px warm hairline). Correct by default — confirm it's not using a hard `#000`.

### `toggle.tsx` / `toggle-group.tsx`
- Active: `bg-primary text-primary-foreground` (jade).
- Pill radius: `rounded-full` for filter chips.

---

## Section 9 — Page Routes (`src/app/`)

### `layout.tsx`
- Fix font variables (Section 2).
- Fix preload `href` to local font path (Section 1.8).
- Add `font-sans` to `<body>` class to establish the UI font baseline.

### `[surahId]/layout.tsx`
- Ensure the reading container has `max-w-[var(--container-md)] mx-auto`.
- Add bottom padding `pb-[calc(var(--player-h)+var(--space-6))]` to account for the docked player.

### `not-found.tsx`
- Copy: Quiet, on-brand. No "Oops" or "Something went wrong" jokes.
- Suggested copy: "Page not found. The surah or page you are looking for does not exist."
- CTA: "Return to Quran" — jade primary button.

### `loading.tsx`
- Replace spinner with cream skeleton tiles (using updated `skeleton.tsx`).
- No spinner/loader icon — use pulsing card-shaped skeletons.

---

## Section 10 — Prioritised Step-by-Step Checklist

### Phase 1 — Foundation (do first, everything depends on this)
- [x] Add Google Fonts `@import` to `globals.css`
- [x] Add all new CSS custom properties to `:root` (jade palette, gold palette, radii, shadows, spacing, motion tokens)
- [x] Update `--primary` to jade `#0e6b57`
- [x] Update shadow tokens to warm paper values
- [x] Update dark theme background to `#0b0a08`
- [x] Remove `apple`, `spotify`, `airtable` theme blocks from `globals.css`
- [x] Add global `.eyebrow`, `.font-arabic-ui`, `[data-numeric]` helper classes
- [x] Add `prefers-reduced-motion` global collapse rule (was already present)

### Phase 2 — Font wiring
- [x] Replace `src/lib/fonts.ts` (add Newsreader, Public Sans, Noto Naskh Arabic, JetBrains Mono)
- [x] Update `src/app/layout.tsx` to inject new font CSS variables on `<html>`
- [x] Fix `<link rel="preload">` to point to `/fonts/UthmanicHafs1Ver18.woff2`
- [x] Update `@theme inline` font stack variables in `globals.css`

### Phase 3 — Primitive UI components
- [x] `button.tsx` — jade primary, ghost cream, 10px radius, press scale
- [x] `input.tsx` / `textarea.tsx` — 10px radius, jade focus ring
- [x] `dialog.tsx` / `sheet.tsx` — 28px radius, 360ms ease-out entry (no spring)
- [x] `skeleton.tsx` — cream-toned pulse, not grey
- [x] `separator.tsx` — confirm warm color
- [x] `toggle.tsx` / `toggle-group.tsx` — jade active state

### Phase 4 — Layout shell
- [x] `Navbar.tsx` — remove logo spring, resize icons to 20px / 1.5px stroke, replace spring active pill, remove scale-on-scroll
- [x] `BottomNav.tsx` — 60px height, 24px icons / 1.5px stroke, jade top-border active state
- [x] `ThemeSwitcher.tsx` — remove non-brand themes (keep light/dark only)
- [x] `Footer.tsx` — cream background, hairline top border

### Phase 5 — Surah directory & home
- [x] `SurahCard.tsx` — 14px radius, warm shadow, hover lift (-1px), `font-arabic-ui` for Arabic name, `font-mono` for numerals
- [x] `SurahFilter.tsx` — pill chips, jade active fill
- [x] `HeroTile.tsx` — remove pointer parallax, `.eyebrow` labels, remove Sparkles icon, static watermark
- [x] `HeroVideo` — smartly add this video to hero section (`/public/rememberquran_herosection_video.mp4`)
- [x] `QuickAccess.tsx` — house card style, jade icons, hover lift

### Phase 6 — Quran reader
- [x] `QuranReader.tsx` — 820px max-width container, centred
- [x] `ReadingModeView.tsx` — 44rem mushaf column, `font-uthmani`, `line-height: var(--quran-leading)`
- [x] `AyahBlock.tsx` — icon strokeWidth → 1.5
- [x] `AyahNumber.tsx` — gold-bordered medallion, `font-mono`
- [x] `TranslationBlock.tsx` — `font-serif` (Newsreader), 66ch max-width
- [x] `BismillahHeader.tsx` — gold hairline rules above/below, centred

### Phase 7 — Audio
- [x] `MiniPlayer.tsx` — 72px height, glass blur, upward shadow, 1.5px icon stroke, 360ms ease-out entry (no spring)
- [x] `RadioPanel.tsx` — hairline dividers between reciter rows

### Phase 8 — Media Maker
- [x] `AyahCardDesigner.tsx` — 28px canvas radius, jade/gold gradient presets only, jade buttons

### Phase 9 — Page routes
- [x] `[surahId]/layout.tsx` — 820px container, player spacer padding
- [x] `not-found.tsx` — quiet on-brand copy, jade CTA
- [x] `loading.tsx` — cream skeleton, no spinner

### Phase 10 — Accessibility audit
- [x] Confirm every icon-only button has `aria-label`
- [x] Confirm focus rings are visible in both light and dark mode
- [x] Test `prefers-reduced-motion` — all transitions should collapse to 0ms
- [x] Verify Arabic text has `dir="rtl"` and `lang="ar"` on every instance
- [x] Check color contrast ratios: jade on cream ≥ 4.5:1, gold on cream ≥ 3:1

---

## Open Questions

> [!IMPORTANT]
> These need a decision before implementation can be finalised.

1. **Multiple themes** — The codebase has Apple, Spotify, and Airtable themes in `globals.css` and (presumably) `ThemeSwitcher.tsx`. Are these used in production or are they dev experiments? The Design System calls for a single identity. **Recommendation: Remove them.** Confirm before deleting.

2. **Framer Motion** — The Design System says no springs, no bounce. `Navbar.tsx` and `HeroTile.tsx` use `framer-motion` springs. Should we remove the Framer Motion dependency entirely (lighter bundle) and replace with CSS transitions? Or keep FM but restrict to permitted easings?

3. **Newsreader optical size** — Newsreader is a variable font with an `opsz` axis. Should headings use `font-optical-sizing: auto` (browser-handled) or a fixed optical size (e.g., `opsz` 36 for display)?

4. **Noto Naskh Arabic weight** — The Arabic name in `SurahCard` currently uses `font-uthmani text-[26px]`. Should it stay large (26px) with Noto Naskh, or should we reduce the size now that it's a UI font rather than the sacred text script?
