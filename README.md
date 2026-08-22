# RememberQuran

A free, distraction-free Quran reading platform built as a public good (sadaqah jariyah) by Haseeb Sajjad for Takween Centre UK Ltd. No ads, no pop-ups, no commercial motive — just the Quran.

**Live site**: [rememberquran.com](https://rememberquran.com)

---

## What it does

### Reading (M1)
- Browse all 114 surahs with Arabic names, English meanings, ayah counts, and Makki/Madani labels
- Read the full Quran in authentic Uthmani script with correct diacritics
- Hover or tap any Arabic word to instantly see its English meaning and transliteration
- Choose between two English translations: Saheeh International and The Clear Quran (Dr Mustafa Khattab)
- Switch between verse-by-verse and continuous reading modes
- Adjust Arabic font style and text size to your preference
- Light and dark mode, saved automatically across visits
- Direct shareable links to any specific ayah (e.g. `/2/255`)
- Copy or share any ayah with one click

### Audio (M2)
- Listen with 21 reciters (Alafasy, Sudais, Saad Al-Ghamdi, Maher Al Muaiqly, and more)
- Per-ayah, continuous surah, and gapless playback with a persistent mini player
- Word-by-word highlight sync and click-to-hear word pronunciation
- Repeat single ayah or a range (including infinite), plus playback speed control
- Quran Radio at `/radio`

### Study tools (M3)
- Tafsir (5 books incl. Ibn Kathir, English) in a shared study panel
- Tajweed colour coding on Arabic text
- Keyword search across Arabic and English (`/search`)
- Word morphology (root, lemma, grammatical form)
- Asbab al-Nuzul (reasons for revelation) where coverage exists

### Accounts & personal features (M4)
- Email/password accounts with password reset (Auth.js)
- Bookmarks and collections; private per-ayah notes
- Reading progress tracking, daily goals, and streaks
- Media Maker — design and export shareable ayah images (`/media-maker`)
- Reading, audio, and study stay fully usable without an account (soft-gate for personal features)

### Expansion (M5)
- 21 reciters in the audio player and Quran Radio
- 10 English/Urdu translations (Saheeh Intl., Clear Quran, Abdel Haleem, Pickthall, Yusuf Ali, Usmani, Hilali-Khan, Maududi, Bridges, Junagarhi)
- 5 tafsir books (Ibn Kathir, Ma'arif al-Qur'an, Tazkirul Quran, Al-Sa'di, Muyassar)
- Hide Arabic mode for memorisation testing
- Hifz progress tracker by surah/juz on `/account/hifz`
- Range repeat with a pause between repetitions for memorisation drills

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui + Base UI |
| Icons | Lucide React |
| Animation | Motion (Framer Motion) |
| Auth | Auth.js (NextAuth v5) — credentials + bcrypt |
| Database | Firebase Firestore (via `firebase-admin`, user data only) |
| Email | Resend (password-reset) |
| Media Maker | `html-to-image` + OG image route |
| Package manager | pnpm |

---

## Data sources

| Source | Used for |
|---|---|
| Quran.com API v4 (`api.quran.com/api/v4`) | Chapters, verses, words, translations |
| Quran.com CDN / QDC (`api.qurancdn.com`) | Audio + segments, tafsir, search, tajweed fields |
| Quran.com audio CDN | Word pronunciation MP3s and chapter recitations |
| 21 reciters via QDC `audio/reciters` (14 with word-timing segments, 7 ayah-level only) | Recitation audio + Quran Radio — see `docs/m5-resource-ids.md` |
| 10 translations (Saheeh Intl. 20, Clear Quran 131 — CDN, Abdel Haleem 85, Pickthall 19, Yusuf Ali 22, Usmani 84, Hilali-Khan 203, Maududi 95, Bridges 149, Junagarhi/Urdu 54) | English + Urdu translations |
| 5 tafsir books via QDC (Ibn Kathir `en-tafisr-ibn-kathir`, Ma'arif al-Qur'an, Tazkirul Quran, Al-Sa'di, Muyassar) | Study panel tafsir |
| spa5k/tafsir_api (Asbab al-Nuzul) | Reasons for revelation |
| Quranic Arabic Corpus (build-time morphology) | Root / lemma / form data |
| KFGQPC Uthmanic Hafs font | Primary Arabic script font |
| Amiri (Google Fonts) | Secondary Arabic font option |

Quran text is always fetched from the APIs — never stored in our database. Firestore holds **user data only** (accounts, bookmarks, notes, progress, goals) — server-only, accessed via `firebase-admin` in Route Handlers, never a client-side SDK. API access is centralised under `src/lib/` (`quranApi.ts`, `audioApi.ts`, `studyApi.ts`, etc.) so sources can change in one place.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                         # "/" Surah list
│   ├── [surahId]/                       # Surah reader + ayah deep links
│   ├── search/                          # Keyword search
│   ├── radio/                           # Quran Radio
│   ├── media-maker/                     # Ayah image designer
│   ├── login/ · register/ · reset/      # Auth flows
│   ├── account/                         # Bookmarks, notes, progress, goals, settings
│   └── api/                             # Auth, account, surah, tafsir, search, media, health
├── components/
│   ├── layout/ · reader/ · surah-list/
│   ├── audio/ · study/ · search/
│   ├── account/ · auth/ · media-maker/
│   └── ui/                              # shadcn primitives
├── context/                             # Reader, audio, study, bookmarks, notes, soft-gate, UI
├── lib/
│   ├── quranApi.ts · audioApi.ts · studyApi.ts · searchApi.ts
│   ├── models/                          # User, Bookmark, Note, Progress, Streak, …
│   ├── auth/ · goals/ · bookmarks/ · media/ · quran/
│   └── db.ts
├── hooks/ · types/
docs/                                    # Design system notes + M5 resource inventory
```

---

## Running locally

```bash
# Install dependencies
pnpm install

# Copy env template and fill in values (required for auth / account features)
cp .env.example .env

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Environment variables** (see `.env.example`):

| Variable | Purpose |
|---|---|
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `AUTH_SECRET` | Auth.js secret |
| `FIREBASE_PROJECT_ID` | Firebase project id |
| `FIREBASE_CLIENT_EMAIL` | Firestore service account email |
| `FIREBASE_PRIVATE_KEY` | Firestore service account private key |
| `FIRESTORE_EMULATOR_HOST` | Local dev only — points at the Firestore emulator instead of production |
| `RESEND_API_KEY` | Password-reset email |
| `EMAIL_FROM` | From address for transactional email |

Reading, audio, and study work without MongoDB/auth. Account features need the env vars above.

---

## Deployment

Deployed on Vercel with the custom domain rememberquran.com. Every push to `main` auto-deploys to the live site. Set the same env vars in the Vercel project for production auth and account features.

---

## Milestones

| # | Milestone | Status |
|---|---|---|
| M1 | Core reading experience | Complete |
| M2 | Audio & recitation | Complete |
| M3 | Study tools (tafsir, tajweed, search, morphology, asbab) | Complete |
| M4 | User accounts, bookmarks, notes, progress, goals, media maker | Complete |
| M5 | Expansion (21 reciters, 10 translations, hifz tracker) | Complete |
| M6 | Final polish & performance | Complete |

Status vs. the original brief lives in `plan.md`; the shipped M5 reciter/translation/tafsir registry is in `docs/m5-resource-ids.md`.

---

## Guiding principles

- Quran content is never stored in our database — always fetched from the API; Firestore holds user data only
- No ads, no pop-ups, no commercial aesthetics
- Account features are additive — guests keep full reading, audio, and study access
- Every previous milestone's features are regression-tested before the next milestone begins
- The live domain reflects ongoing progress at all times
