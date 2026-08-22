import type { Reciter } from "@/types/audio"
import type { Word } from "@/types/quran"

/**
 * Chapter-audio reciters verified in M5 Phase 0 (`docs/m5-resource-ids.md`).
 * Adding a row here is enough for player, radio, and settings pickers.
 */
export const RECITERS: Reciter[] = [
  {
    id: 7,
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 3,
    name: "Abdur-Rahman as-Sudais",
    arabicName: "عبدالرحمن السديس",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 97,
    name: "Yasser Ad-Dussary",
    arabicName: "ياسر الدوسري",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 2,
    name: "AbdulBaset AbdulSamad",
    arabicName: "عبد الباسط عبد الصمد",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 1,
    name: "AbdulBaset AbdulSamad",
    arabicName: "عبد الباسط عبد الصمد",
    style: "Mujawwad",
    hasWordTiming: true,
  },
  {
    id: 4,
    name: "Abu Bakr al-Shatri",
    arabicName: "أبو بكر الشاطري",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 5,
    name: "Hani ar-Rifai",
    arabicName: "هاني الرفاعي",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 6,
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 12,
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Muallim",
    hasWordTiming: true,
  },
  {
    id: 10,
    name: "Saud ash-Shuraym",
    arabicName: "سعود الشريم",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 161,
    name: "Khalifah Al Tunaiji",
    arabicName: "خليفة الطنيجي",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 9,
    name: "Mohamed Siddiq al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "Murattal",
    hasWordTiming: true,
  },
  // id 8 (Al-Minshawi, Mujawwad) removed 2026-08-14 — upstream QDC/BunnyCDN
  // audio_url 404s for every chapter (verified live); re-add once fixed.
  {
    id: 168,
    name: "Mohamed Siddiq al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "Kids repeat",
    hasWordTiming: true,
  },

  /**
   * M5 expansion (target 20+ reciters) — verified against
   * `/audio/reciters/{id}/audio_files` directly: each id below returns a
   * complete 1–114 chapter set. None appear in the QDC word-timing
   * roster, and a manual `segments=true` check confirms `verse_timings`
   * with empty `segments` — so these get ayah-level playback/repeat but
   * no word-by-word highlight, which is the brief's documented fallback
   * for reciters without timing files.
   */
  {
    id: 13,
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    style: "Murattal",
    hasWordTiming: false,
  },
  {
    id: 65,
    name: "Maher Al Muaiqly",
    arabicName: "ماهر المعيقلي",
    style: "Murattal",
    hasWordTiming: false,
  },
  {
    id: 170,
    name: "Khalid Al-Jaleel",
    arabicName: "خالد الجليل",
    style: "Murattal",
    hasWordTiming: false,
  },
  {
    id: 167,
    name: "Ali Al-Huthaifi",
    arabicName: "علي الحذيفي",
    style: "Murattal",
    hasWordTiming: false,
  },
  {
    id: 163,
    name: "Abdullah Basfar",
    arabicName: "عبدالله بصفر",
    style: "Murattal",
    hasWordTiming: false,
  },
  {
    id: 91,
    name: "Mohammad Al-Tablawi",
    arabicName: "محمد الطبلاوي",
    style: "Murattal",
    hasWordTiming: false,
  },
  {
    id: 160,
    name: "Bandar Baleela",
    arabicName: "بندر بليلة",
    style: "Murattal",
    hasWordTiming: false,
  },
]

export const DEFAULT_RECITER_ID = 7

/** Unknown/removed ids fall back to the default reciter — never throws */
export function getReciter(id: number): Reciter {
  return (
    RECITERS.find((r) => r.id === id) ??
    RECITERS.find((r) => r.id === DEFAULT_RECITER_ID) ??
    RECITERS[0]
  )
}

const WORD_AUDIO_BASE_URL =
  process.env.NEXT_PUBLIC_QURAN_WORD_AUDIO_URL ?? "https://audio.qurancdn.com/"
const WORD_AUDIO_FILE_RE = /(\d{3}_\d{3}_)\d{3}(\.mp3(?:\?.*)?)$/

export function getWordAudioUrl(word: Word): string | null {
  if (!word.audio_url) return null

  // QDC's audio_url suffix can count pause/end-marker entries, while
  // Word.position counts actual spoken words. After the first marker this
  // makes every clip point at a later word (e.g. 3:4 word 10 → file 11).
  // The WBW CDN filename uses the spoken-word index, so normalize its suffix.
  const position = String(word.position).padStart(3, "0")
  const normalized = word.audio_url.replace(
    WORD_AUDIO_FILE_RE,
    `$1${position}$2`,
  )

  if (/^https?:\/\//.test(normalized)) return normalized
  return WORD_AUDIO_BASE_URL + normalized
}
