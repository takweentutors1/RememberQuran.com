# Nur rollout — status and remaining work

Companion to [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md). That document is the
contract; this one tracks how much of the app actually honours it.

**Phase 1 is complete.** The token layer is live app-wide, so every surface
already picked up the new colours automatically. What remains is the
*component* work — the surfaces that still use the old visual language
(coloured accents, card-heavy layouts, hardcoded durations) even though they
now render in Nur colours.

Last audited: 2026-08-04.

---

## 1. What shipped in phase 1

| Area | File | State |
|---|---|---|
| Token layer | `src/app/globals.css` | Nur light + dark, motion tokens, interaction utilities |
| Interaction primitives | `globals.css` | `lift` · `link-reveal` · `diamond-frame` · `underline-grow` · `ripple-host` · `shimmer` · `spark-dot` |
| Reduced motion | `globals.css` | Global override, including `scroll-behavior` |
| Home page | `surah-list/*`, `app/page.tsx` | Ayah of the day, filter, diamond cards, ISR |
| Footer | `layout/Footer.tsx` | Dua, columns, attribution band, bottom bar |
| Theme control | `layout/ThemeSegmented.tsx` | Three-state, in the footer |
| Back to top | `layout/BackToTop.tsx` | rAF-throttled, appears past 60% depth |
| Ripple | `hooks/useRipple.ts` | Imperative, reduced-motion aware |
| Navbar | `layout/Navbar.tsx` | Underline-grow on links |
| Ayah of the day | `lib/quran/ayah-of-the-day.ts` | 21 ayahs, pure UTC-day selection |

**Bugs fixed in passing**

- Tajweed dark-mode colours were keyed to `[data-theme="dark"]` while
  `next-themes` is configured with `attribute="class"` — they had never
  activated in dark mode.
- Dialog and sheet overlays were `bg-black/10`, effectively invisible against
  the new `#0C0C0E` page.
- `AuthShell`'s radial glow was mixed from `--primary`, which is now ink —
  it had turned into a grey smudge. Re-pointed at `--brand-gold-soft`.

---

## 2. Surfaces still on the old visual language

Ordered by user impact. Each is a self-contained PR.

### 2.1 Reader — highest priority

The reader is where people spend their time and it is the least aligned.

| File | What needs to change |
|---|---|
| `reader/AyahBlock.tsx` | Hardcoded `duration-[120ms]` → motion tokens. Actions should fade in on hover via one shared class, not per-button opacity. |
| `reader/AyahBlock.tsx` | Confirm ayahs render as hairline-separated rows, not bordered cards (system §7). |
| `reader/ArabicWord.tsx` | Word highlight must be `background-color` only — audit for any `transform`, `scale`, or `opacity` on the glyph. |
| `reader/AyahNumber.tsx` | Move to the `diamond-frame` ornament for consistency with the home grid. |
| `reader/ReaderControls.tsx` | Toolbar buttons → shared icon-button treatment (`lift` on press, `--dur-base`). |
| `reader/SurahReaderViewport.tsx` | Add `content-visibility: auto` per ayah — currently only the home grid has it, and Al-Baqarah is 286 ayahs. |
| `reader/TranslationBlock.tsx` | Translation to `--muted-foreground`, source line to `text-subtle`. |

### 2.2 Audio

| File | What needs to change |
|---|---|
| `audio/AudioPlayerBar.tsx` | Rail + thumb per the demo; thumb appears on hover only. Progress must not animate `width`. |
| `audio/PlayAyahButton.tsx` | Circular primary button, `scale(1.07)` hover / `0.95` press. |
| `audio/RepeatControls.tsx`, `SpeedControl.tsx` | Pill treatment, `--dur-base`. |
| `audio/RadioPanel.tsx`, `ReciterSelector.tsx` | Card → `lift`, gold reserved for the active reciter only. |

### 2.3 Account

All seven views still use the jade-era accent pattern (`bg-primary/10`,
`text-primary` as decoration). Under Nur these read as grey-on-grey.

`account/BookmarksView` · `NotesView` · `NoteEditor` · `ProgressView` ·
`GoalsView` · `HifzView` · `SettingsForms` · `ContinuePrompt` · `AccountNav`,
plus the seven `app/account/*/page.tsx` shells.

Specific work: metric cards per system §5, the goal ring, count-up numbers,
and the hifz juz grid from the mobile demo.

### 2.4 Auth, study, search, and the rest

| Area | Files |
|---|---|
| Auth | `LoginForm` · `RegisterForm` · `ForgotPasswordForm` · `ResetPasswordForm` · `AuthNav` · `AuthSwitchLink` · `SoftGateDialog` |
| Study panel | `StudyPanel` · `TafsirView` · `AsbabView` · `WordDetailView` · `TafsirBookSelector` |
| Search | `SearchPageClient` · `SearchResultItem` · `SearchEmptyState` — highlight must use `bg-gold-soft` / `text-gold-strong` |
| Media maker | `AyahCardDesigner` — its own palette presets need a Nur set |
| Static | `LegalDoc` · `app/not-found.tsx` · `app/[surahId]/not-found.tsx` |
| Primitives | `ui/button.tsx` — variants still assume a coloured primary |

---

## 3. Functionality in the design that does not exist yet

These are **features**, not restyling. Sized honestly.

### Should build

| # | Gap | Why it matters | Size |
|---|---|---|---|
| 1 | **Mobile bottom tab bar** | Navigation is sheet-only today. The design is thumb-first: Read · Radio · Saved · You, with the mini-player floating above it. This is the single biggest mobile UX gap. | L |
| 2 | **Toast system** | There is no toast component anywhere in the codebase. Every save, bookmark, and copy currently succeeds silently. | M |
| 3 | **Bookmark spring + spark** | `useRipple` shipped; the spring and gold particles from the demo are not wired to `BookmarkButton` / `HifzButton` / `NoteButton`. | S |
| 4 | **Count-up counters** | Streak, goal, and memorised totals should animate from zero once on mount with `tabular-nums`. Nothing implements this. | S |
| 5 | **Goal progress ring** | Designed for the home strip and the mobile progress screen. Not built. | S |
| 6 | **Play control on surah cards** | Hover a surah, start listening without opening the reader. Needs care: the card is an RSC `<Link>`, so the button must be an isolated client island — do not convert the whole card. | M |
| 7 | **Juz filter** | `lib/quran/juz.ts` already has canonical ranges but nothing surfaces them. The filter chip row is built and has room. | S |
| 8 | **Bookmarked filter** | Same row. Needs the bookmark set client-side, so it must not force the grid to hydrate — filter by attribute like the others. | M |
| 9 | **Mobile footer accordions** | Columns currently stack into a long link wall. Design collapses them to four tap sections, with attribution left open. | S |
| 10 | **Grid / list view toggle** | Designed, not built. Low value — consider dropping. | S |

### Deliberately deferred

| Gap | Reason |
|---|---|
| **Footer language switcher** | The demo shows one, but there is no i18n layer. Shipping a picker with one language is a lie in the UI. Blocked on real localisation. |
| **"Report a mistake" form** | Currently a `mailto:`. That is the right call until there is somewhere to route submissions; a form that drops reports is worse than an email link. |
| **Ayah-of-the-day audio** | Would pull the audio context onto the home page's critical path. Revisit once the player is lazy-loaded. |
| **Ayah-of-the-day corpus** | 21 curated ayahs means a ~3-week cycle. Expand to 60+ before anyone notices the repeat. Needs a scholar review pass, not an engineering one. |

---

## 4. Engineering debt found during the audit

Ordered by risk.

### 4.1 No dark-mode or contrast gate

Two real dark-mode bugs shipped to production and survived (tajweed colours,
overlay opacity). Both were invisible in light mode. **Nothing in CI looks at
dark mode.**

- Add a Playwright pass that screenshots every route in both modes.
- Add an automated contrast check on the token pairs in `DESIGN-SYSTEM.md` §2
  so a palette edit cannot silently break AA.

### 4.2 Tokens are bypassed across ~55 files

`var(--brand-gold)` is written inline in arbitrary values throughout the app
instead of the `text-gold` / `bg-gold-soft` / `border-gold` utilities that now
exist. It works, but it means a token rename is a 55-file find-and-replace
rather than a one-line change.

- Codemod the inline `var(--brand-gold)` usages to utilities.
- Add an ESLint rule banning raw hex and `var(--brand-*)` inside `className`.

### 4.3 Motion durations are hardcoded

`duration-150`, `duration-200`, `duration-[120ms]` appear across the reader
and audio components. The tokens exist; nothing enforces them.

- Lint rule: no numeric `duration-*` in `className`; use `duration-(--dur-*)`.

### 4.4 Tailwind v4 variable syntax is a live footgun

`duration-[--dur-base]` compiles without error and emits invalid CSS. v4
requires `duration-(--dur-base)`. This was caught here by compiling the
stylesheet and grepping the output — nothing would have caught it otherwise.

- Add a build step that compiles the stylesheet and greps for unresolved
  `--` values. Cheap, and catches the whole class of mistake.

### 4.5 `content-visibility` is under-applied

Only the 114-card home grid uses it. The reader renders every ayah of
Al-Baqarah eagerly — 286 blocks, each with Arabic, tajweed spans, and
translations.

### 4.6 No component catalogue

Nine interaction utilities now exist with no single page that renders them.
The demo HTML files at the repo root serve this purpose informally and will
drift. Either promote them to a real `/dev/kitchen-sink` route or delete them
once the rollout finishes.

### 4.7 No CSS budget

The compiled stylesheet is ~150 KB uncompressed with `@source` scanning all of
`src`. Worth tracking as a number in CI before it becomes a problem.

---

## 5. Best practices to hold to for the rest of the rollout

Beyond the rules already in `DESIGN-SYSTEM.md` §9–10.

1. **One surface per PR.** Reader, then audio, then account. A single
   "restyle everything" PR is unreviewable and unrevertable.
2. **Never widen a client boundary to add a flourish.** The surah-card play
   button is the test case: it must be a client island inside an RSC card, not
   an excuse to make the card client-side. If an interaction can only be built
   by hydrating a list, it is not worth the interaction.
3. **Filter and toggle by attribute, not by state,** wherever the list is
   server-rendered. The `data-filter` pattern on the home grid is the
   reference implementation.
4. **Animate `transform`, `opacity`, `background-color`, `border-color`,
   `box-shadow`, `max-height`. Nothing else.** No `width`, `height`, `top`,
   `left`.
5. **Arabic is untouchable.** Any PR that adds a transform, scale, or opacity
   transition to a Quranic glyph gets rejected on sight.
6. **Every new interactive component ships with:** a `:focus-visible` style, an
   `aria-label` if icon-only, a 44×44 touch target on mobile, and a check that
   it still works with reduced motion.
7. **Skeletons in the real layout, never spinners.** A skeleton that is not the
   shape of the content it replaces is just a spinner with extra steps.
8. **Delete as you go.** The three `ui-demo*.html` files at the repo root are
   phase-0 artefacts. They should not outlive the rollout.

---

## 6. Suggested order

| Phase | Scope | Rationale |
|---|---|---|
| **2** | Reader + audio components | Where users actually are |
| **3** | Toast system, then bookmark spring, counters, goal ring | Toast unblocks the others |
| **4** | Mobile bottom tab bar | Largest single piece; needs its own design pass for the reader route |
| **5** | Account views | High surface area, lower traffic |
| **6** | Auth, study, search, media maker, static pages | Long tail |
| **7** | Lint rules, dark-mode CI, contrast gate, CSS budget | Locks the system in so it cannot drift back |

Phase 7 is the one that gets skipped. It is also the only one that stops this
document from being needed again in a year.
