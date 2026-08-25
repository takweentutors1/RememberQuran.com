/**
 * Word timing segment: [wordPosition, startMs, endMs].
 * wordPosition is 1-based and matches Word.position for words with
 * char_type_name === "word". Timestamps are absolute within the chapter
 * audio file. (Verified live 2026-07 — the quran.com reference repo's
 * "[chapter, verse, word]" comment is outdated.)
 */
export type Segment = [number, number, number]

export interface VerseTiming {
  verse_key: string
  timestamp_from: number
  timestamp_to: number
  duration: number
  /** Raw from the API — sanitize before use; malformed entries exist */
  segments: number[][]
}

export interface ChapterAudioFile {
  id: number
  chapter_id: number
  file_size: number
  format: string
  /** Absolute URL of the full-chapter MP3 */
  audio_url: string
  /** Milliseconds */
  duration: number
  verse_timings: VerseTiming[]
}

export interface ChapterAudioResponse {
  audio_files: ChapterAudioFile[]
}

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

export type RepeatMode = "off" | "ayah" | "range"

export interface RepeatConfig {
  mode: RepeatMode
  /** verse_number of range start (== end for "ayah") */
  start: number
  end: number
  /** total plays; Infinity allowed */
  count: number
  remaining: number
  /** Pause after each loop before restarting (ms). 0 = immediate. */
  pauseMs: number
}

/** Common pause choices for memorisation repeat UI */
export const REPEAT_PAUSE_OPTIONS_MS = [0, 1000, 2000, 3000, 5000] as const


export interface Reciter {
  /** Recitation id — path param of the QDC audio_files endpoint */
  id: number
  name: string
  arabicName: string
  style?: string
  /** Whether the QDC endpoint provides word segments for this reciter */
  hasWordTiming: boolean
}
