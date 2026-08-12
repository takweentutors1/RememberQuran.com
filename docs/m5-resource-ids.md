# M5 — Resource inventory (shipped)

**Last verified:** 2026-08-12  
**Hosts:** `api.qurancdn.com/api/qdc` (audio + tafsirs + Clear Quran CDN), `api.quran.com/api/v4` (translations + recitation metadata)  
**Single source of truth:** this file mirrors exactly what is registered in the app — every ID below appears in the corresponding registry in `src/lib/`. Do not add IDs unless they are verified live (see the [Re-verify](#re-verify) section).

Registries tracked here:
- Reciters → `src/lib/audioSources.ts` (`RECITERS`)
- Translations → `src/lib/translations.ts` (`TRANSLATIONS`)
- Tafsirs → `src/lib/studyApi.ts` (`TAFSIR_RESOURCES`)

---

## Reciters — 21 shipped (`src/lib/audioSources.ts`)

### Timed (word-level sync available) — `hasWordTiming: true`

All verified against `/audio/reciters/{id}/audio_files?chapter=1&segments=true` (chapter 2 also checked for QDC-listed IDs). These get word-by-word highlight sync in the reader.

| ID | Name | Style |
|---:|------|-------|
| 7 | Mishary Rashid Alafasy | Murattal |
| 3 | Abdur-Rahman as-Sudais | Murattal |
| 97 | Yasser Ad-Dussary | Murattal |
| 2 | AbdulBaset AbdulSamad | Murattal |
| 1 | AbdulBaset AbdulSamad | Mujawwad |
| 4 | Abu Bakr al-Shatri | Murattal |
| 5 | Hani ar-Rifai | Murattal |
| 6 | Mahmoud Khalil Al-Husary | Murattal |
| 12 | Mahmoud Khalil Al-Husary | Muallim |
| 10 | Saud ash-Shuraym | Murattal |
| 161 | Khalifah Al Tunaiji | Murattal |
| 9 | Mohamed Siddiq al-Minshawi | Murattal |
| 8 | Mohamed Siddiq al-Minshawi | Mujawwad |
| 168 | Mohamed Siddiq al-Minshawi | Kids repeat |

### Untimed (ayah-level playback only) — `hasWordTiming: false`

Each ID was checked directly via `/audio/reciters/{id}/audio_files` and returns a complete 1–114 chapter set. None appear in the QDC word-timing roster; a manual `segments=true` check confirms `verse_timings` with empty `segments`. Per the brief, these get ayah-level playback/repeat but no word-by-word highlight.

| ID | Name | Style |
|---:|------|-------|
| 13 | Saad Al-Ghamdi | Murattal |
| 65 | Maher Al Muaiqly | Murattal |
| 170 | Khalid Al-Jaleel | Murattal |
| 167 | Ali Al-Huthaifi | Murattal |
| 163 | Abdullah Basfar | Murattal |
| 91 | Mohammad Al-Tablawi | Murattal |
| 160 | Bandar Baleela | Murattal |

**M5 target:** 20+ reciters — **met** (21 shipped). Default reciter stays **7** (Alafasy).

> Note: the Phase 0 caution about V4 id **11** (`Mohamed al-Tablawi`) never shipped. The shipped **91** is a different, verified resource — part of the direct `audio_files` check above.

---

## Translations — 10 shipped (`src/lib/translations.ts`)

| ID | Language | Name | Direction | Source |
|---:|----------|------|-----------|--------|
| 20 | English | Saheeh International | LTR | API |
| 131 | English | The Clear Quran — Dr Mustafa Khattab | LTR | **CDN only** (never sent to quran.com/QDC) |
| 85 | English | M.A.S. Abdel Haleem | LTR | API |
| 19 | English | M. Pickthall | LTR | API |
| 22 | English | A. Yusuf Ali | LTR | API |
| 84 | English | T. Usmani (Mufti Taqi Usmani) | LTR | API |
| 203 | English | Al-Hilali & Khan | LTR | API |
| 95 | English | A. Maududi (Tafhim commentary) | LTR | API |
| 149 | English | Fadel Soliman, Bridges’ translation | LTR | API |
| 54 | Urdu | Maulana Muhammad Junagarhi | RTL | API |

**M5 target:** 10+ translations — **met** (10 shipped). Default pair: **20 + 131**. Reader caps simultaneous active translations at **3** (`MAX_ACTIVE_TRANSLATIONS`, `src/lib/translations.ts`).

**Do not use** resource **57** (Transliteration) as a translation option.

---

## Tafsirs — 5 shipped (`src/lib/studyApi.ts`)

Spot-checked `…/tafsirs/{slug}/by_ayah/2:255` on QDC.

| ID | Slug | Name | Lang |
|---:|------|------|------|
| 169 | `en-tafisr-ibn-kathir` | Ibn Kathir (Abridged) | English |
| 168 | `en-tafsir-maarif-ul-quran` | Ma'arif al-Qur'an | English |
| 817 | `tazkirul-quran-en` | Tazkirul Quran (Wahiduddin Khan) | English |
| 91 | `ar-tafseer-al-saddi` | Al-Sa'di | Arabic |
| 16 | `ar-tafsir-muyassar` | Tafsir Muyassar | Arabic |

**M5 target:** 5+ tafsir books — **met** (5 shipped, default `en-tafisr-ibn-kathir`). The `/api/tafsir` route validates slugs against `TAFSIR_RESOURCES`, so this table is the full allowlist. Optional extras verified in Phase 0 but **not shipped**: `ru-tafseer-al-saddi`, `tafseer-ibn-e-kaseer-urdu`, `tazkiru-quran-ur`, `tafsir-bayan-ul-quran`.

---

## Phase 0 gaps closed (recap)

| # | Phase 0 open question | Resolution |
|---|-----------------------|------------|
| 1 | "20+ reciters not reachable on public QDC" | Met — 14 timed + 7 additional verified chapter reciters = **21** |
| 2 | Translation IDs | Shipped exactly as Phase 0 recommended (20, 131, 85, 19, 22, 84, 203, 95, 149, 54) |
| 3 | Only 3 EN tafsirs | Padded to **5** with Al-Sa'di + Muyassar (Arabic) |
| 4 | Max simultaneous translations | Implemented — cap **3** |
| 5 | Hide mode scope | Shipped per-ayah via `HideArabicToggle` / `HideableArabic` |

---

## Re-verify

All checks below are read-only API calls; none mutate data.

```bash
# Reciters (timed surface)
curl -s "https://api.qurancdn.com/api/qdc/audio/reciters?locale=en"
# One untimed reciter (should return a complete 1–114 chapter set)
curl -s "https://api.qurancdn.com/api/qdc/audio/reciters/13/audio_files?chapter=1"
# Word timing check (empty `segments` = untimed, keep hasWordTiming: false)
curl -s "https://api.qurancdn.com/api/qdc/audio/reciters/13/audio_files?chapter=1&segments=true"
# Translations (spot-check any ID above)
curl -s "https://api.qurancdn.com/api/qdc/verses/by_key/2:255?translations=131"
# Tafsir (spot-check any slug above)
curl -s "https://api.qurancdn.com/api/qdc/tafsirs/en-tafisr-ibn-kathir/by_ayah/2:255"
```

Compare counts against this file **before** expanding any registry: reciters **21**, translations **10**, tafsirs **5**.