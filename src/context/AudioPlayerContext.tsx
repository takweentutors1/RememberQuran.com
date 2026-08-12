"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useChapters } from "@/context/ChaptersContext"
import { getChapterAudio, prefetchChapterAudio } from "@/lib/audioApi"
import {
  DEFAULT_RECITER_ID,
  getReciter,
  getWordAudioUrl,
} from "@/lib/audioSources"
import {
  sanitizeTimings,
  findVerseIndex,
  findWordPosition,
  type CleanVerseTiming,
} from "@/lib/wordSync"
import {
  setPosition,
  clearPosition,
  requestScrollToVerse,
} from "@/lib/playbackStore"
import {
  PLAYBACK_SPEEDS,
  type PlaybackSpeed,
  type RepeatConfig,
} from "@/types/audio"
import type { Word } from "@/types/quran"

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error"
export type PlaybackMode = "surah" | "radio"

const REPEAT_OFF: RepeatConfig = {
  mode: "off",
  start: 1,
  end: 1,
  count: 1,
  remaining: 1,
  pauseMs: 0,
}

export interface AudioPlayerState {
  status: PlaybackStatus
  isBuffering: boolean
  mode: PlaybackMode
  repeat: RepeatConfig
  chapterId: number | null
  chapterName: string | null
  versesCount: number | null
  /** Effective: registry flag AND segments actually present in loaded data */
  hasWordTiming: boolean
  durationMs: number | null
  /** verse_key a play button is waiting on while status === "loading" */
  loadingVerseKey: string | null
  errorMessage: string | null
}

export interface AudioPlayerActions {
  playVerse: (chapterId: number, verseNumber: number) => void
  playChapter: (chapterId: number, fromVerse?: number) => void
  startRadio: (fromChapterId?: number) => void
  togglePlayPause: () => void
  nextAyah: () => void
  prevAyah: () => void
  seekToVerse: (verseNumber: number) => void
  seekToTime: (ms: number) => void
  setReciter: (id: number) => void
  setSpeed: (speed: PlaybackSpeed) => void
  setRepeat: (config: Omit<RepeatConfig, "remaining">) => void
  playWord: (word: Word) => void
  retry: () => void
  stop: () => void
}

export type AudioPlayerValue = AudioPlayerState & {
  reciterId: number
  speed: PlaybackSpeed
} & AudioPlayerActions

const INITIAL_STATE: AudioPlayerState = {
  status: "idle",
  isBuffering: false,
  mode: "surah",
  repeat: REPEAT_OFF,
  chapterId: null,
  chapterName: null,
  versesCount: null,
  hasWordTiming: false,
  durationMs: null,
  loadingVerseKey: null,
  errorMessage: null,
}

type Action =
  | {
      type: "LOAD_START"
      chapterId: number
      mode: PlaybackMode
      loadingVerseKey: string
      resetRepeat: boolean
    }
  | {
      type: "LOAD_SUCCESS"
      chapterName: string | null
      versesCount: number | null
      hasWordTiming: boolean
      durationMs: number | null
    }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "PLAYING" }
  | { type: "PAUSED" }
  | { type: "BUFFERING"; buffering: boolean }
  | { type: "SET_MODE"; mode: PlaybackMode }
  | { type: "SET_REPEAT"; repeat: RepeatConfig }
  | { type: "REPEAT_REMAINING"; remaining: number }
  | { type: "STOP" }

function reducer(state: AudioPlayerState, action: Action): AudioPlayerState {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        status: "loading",
        isBuffering: false,
        mode: action.mode,
        chapterId: action.chapterId,
        loadingVerseKey: action.loadingVerseKey,
        errorMessage: null,
        repeat: action.resetRepeat ? REPEAT_OFF : state.repeat,
      }
    case "LOAD_SUCCESS":
      return {
        ...state,
        chapterName: action.chapterName,
        versesCount: action.versesCount,
        hasWordTiming: action.hasWordTiming,
        durationMs: action.durationMs,
        loadingVerseKey: null,
      }
    case "LOAD_ERROR":
      return {
        ...state,
        status: "error",
        isBuffering: false,
        loadingVerseKey: null,
        errorMessage: action.message,
      }
    case "PLAYING":
      return {
        ...state,
        status: "playing",
        isBuffering: false,
        loadingVerseKey: null,
        errorMessage: null,
      }
    case "PAUSED":
      return state.status === "idle"
        ? state
        : { ...state, status: "paused", isBuffering: false }
    case "BUFFERING":
      return { ...state, isBuffering: action.buffering }
    case "SET_MODE":
      return { ...state, mode: action.mode }
    case "SET_REPEAT":
      return { ...state, repeat: action.repeat }
    case "REPEAT_REMAINING":
      return { ...state, repeat: { ...state.repeat, remaining: action.remaining } }
    case "STOP":
      return INITIAL_STATE
  }
}

interface AudioPrefs {
  reciterId: number
  speed: PlaybackSpeed
}

const DEFAULT_PREFS: AudioPrefs = { reciterId: DEFAULT_RECITER_ID, speed: 1 }

/** Corrupt/unknown stored prefs fall back to defaults — never invalidates
 * the reader's own rq-reader-settings key. */
function migrateAudioPrefs(raw: unknown): AudioPrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_PREFS
  const p = raw as Record<string, unknown>
  return {
    reciterId:
      typeof p.reciterId === "number"
        ? getReciter(p.reciterId).id
        : DEFAULT_RECITER_ID,
    speed: PLAYBACK_SPEEDS.includes(p.speed as PlaybackSpeed)
      ? (p.speed as PlaybackSpeed)
      : 1,
  }
}

const AudioPlayerContext = createContext<AudioPlayerValue | null>(null)

/**
 * Actions only — referentially stable across playback state changes, so
 * high-count consumers (every ArabicWord) never re-render because of the
 * player. Word components use this; the bar and play buttons use the full
 * context above.
 */
const AudioPlayerActionsContext = createContext<AudioPlayerActions | null>(null)

interface LoadIntent {
  reciterId: number
  chapterId: number
  seekToVerse: number
  autoplay: boolean
  mode: PlaybackMode
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const chapters = useChapters()
  const chaptersRef = useRef(chapters)
  useEffect(() => {
    chaptersRef.current = chapters
  }, [chapters])
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [rawPrefs, setRawPrefs] = useLocalStorage<unknown>(
    "rq-audio-settings",
    DEFAULT_PREFS,
  )
  const prefs = migrateAudioPrefs(rawPrefs)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wordAudioRef = useRef<HTMLAudioElement | null>(null)
  const timingsRef = useRef<CleanVerseTiming[]>([])
  const rafRef = useRef(0)
  const lastVerseIdxRef = useRef(-1)
  const lastWordPosRef = useRef<number | null>(null)
  const hasWordTimingRef = useRef(false)
  const loadTokenRef = useRef(0)
  const pendingSeekMsRef = useRef<number | null>(null)
  const repeatRef = useRef<RepeatConfig>(REPEAT_OFF)
  const repeatPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** True while waiting between memorisation loops — ignore pause UI churn */
  const repeatGapRef = useRef(false)
  const statusRef = useRef<PlaybackStatus>("idle")
  const modeRef = useRef<PlaybackMode>("surah")
  const chapterIdRef = useRef<number | null>(null)
  const reciterIdRef = useRef(prefs.reciterId)
  const speedRef = useRef<PlaybackSpeed>(prefs.speed)
  const resumeAfterWordRef = useRef(false)
  const radioFailStreakRef = useRef(0)
  const prefetchedNextRef = useRef<number | null>(null)
  const lastIntentRef = useRef<LoadIntent | null>(null)

  useEffect(() => {
    statusRef.current = state.status
  }, [state.status])

  // Prefs hydrate from localStorage after mount — keep refs and element in sync
  useEffect(() => {
    reciterIdRef.current = prefs.reciterId
    speedRef.current = prefs.speed
    if (audioRef.current) audioRef.current.playbackRate = prefs.speed
  }, [prefs.reciterId, prefs.speed])

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  const clearRepeatPause = useCallback(() => {
    if (repeatPauseTimerRef.current !== null) {
      clearTimeout(repeatPauseTimerRef.current)
      repeatPauseTimerRef.current = null
    }
    repeatGapRef.current = false
  }, [])

  const scheduleRepeatRestart = useCallback(
    (fromMs: number, pauseMs: number) => {
      const audio = audioRef.current
      if (!audio) return
      clearRepeatPause()
      if (pauseMs <= 0) {
        audio.currentTime = fromMs / 1000
        return
      }
      repeatGapRef.current = true
      audio.pause()
      repeatPauseTimerRef.current = setTimeout(() => {
        repeatPauseTimerRef.current = null
        repeatGapRef.current = false
        const el = audioRef.current
        if (!el) return
        el.currentTime = fromMs / 1000
        const p = el.play()
        if (p) {
          p.catch((err: unknown) => {
            if ((err as DOMException)?.name === "AbortError") return
            dispatch({ type: "PAUSED" })
          })
        }
      }, pauseMs)
    },
    [clearRepeatPause],
  )
  const scheduleRepeatRestartRef = useRef(scheduleRepeatRestart)
  useEffect(() => {
    scheduleRepeatRestartRef.current = scheduleRepeatRestart
  }, [scheduleRepeatRestart])

  const clearRepeatPauseRef = useRef(clearRepeatPause)
  useEffect(() => {
    clearRepeatPauseRef.current = clearRepeatPause
  }, [clearRepeatPause])

  const tickBody = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const t = audio.currentTime * 1000
    const timings = timingsRef.current

    if (timings.length > 0) {
      // Hot path: current verse or its neighbour before binary search
      const within = (i: number) =>
        i >= 0 && i < timings.length && timings[i].from <= t && t < timings[i].to
      let idx = lastVerseIdxRef.current
      if (!within(idx)) {
        idx = within(idx + 1) ? idx + 1 : findVerseIndex(timings, t)
      }
      if (idx !== lastVerseIdxRef.current) {
        lastVerseIdxRef.current = idx
        lastWordPosRef.current = null
      }
      const timing = timings[idx]
      if (timing) {
        const pos = hasWordTimingRef.current
          ? findWordPosition(timing, t)
          : null
        // Gaps (pauses, madd tails) keep the previous word lit — no flicker
        if (pos !== null) lastWordPosRef.current = pos
        setPosition({
          verseKey: timing.verseKey,
          wordPosition: lastWordPosRef.current,
          timeMs: t,
        })
      }

      const rep = repeatRef.current
      if (rep.mode !== "off" && !repeatGapRef.current) {
        const startTiming = timings[rep.start - 1]
        const endTiming = timings[rep.end - 1]
        if (startTiming && endTiming && t >= endTiming.to) {
          if (rep.remaining > 1) {
            rep.remaining -= 1
            dispatch({ type: "REPEAT_REMAINING", remaining: rep.remaining })
            scheduleRepeatRestartRef.current(
              startTiming.from,
              rep.pauseMs ?? 0,
            )
          } else {
            clearRepeatPauseRef.current()
            repeatRef.current = REPEAT_OFF
            dispatch({ type: "SET_REPEAT", repeat: REPEAT_OFF })
          }
        }
      }

      // Radio: warm the next chapter's data as we enter the last verse
      if (
        modeRef.current === "radio" &&
        idx === timings.length - 1 &&
        chapterIdRef.current !== null
      ) {
        const next = (chapterIdRef.current % 114) + 1
        if (prefetchedNextRef.current !== next) {
          prefetchedNextRef.current = next
          prefetchChapterAudio(reciterIdRef.current, next)
        }
      }
    }

  }, [])

  const startLoop = useCallback(() => {
    stopLoop()
    const loop = () => {
      tickBody()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [stopLoop, tickBody])

  const safePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const p = audio.play()
    if (p) {
      p.catch((err: unknown) => {
        // AbortError = interrupted by a user pause — their intent won
        if ((err as DOMException)?.name === "AbortError") return
        // NotAllowedError (autoplay policy) etc — settle into paused
        dispatch({ type: "PAUSED" })
      })
    }
  }, [])

  const clampVerse = useCallback((n: number) => {
    const count = timingsRef.current.length
    return Math.min(Math.max(Math.round(n) || 1, 1), Math.max(count, 1))
  }, [])

  /** Seek within the loaded chapter and publish the position immediately */
  const seekToVerseInternal = useCallback(
    (verseNumber: number) => {
      const timing = timingsRef.current[clampVerse(verseNumber) - 1]
      const audio = audioRef.current
      if (!timing || !audio) return
      if (audio.readyState >= 1) {
        audio.currentTime = timing.from / 1000
      } else {
        pendingSeekMsRef.current = timing.from
      }
      lastVerseIdxRef.current = -1
      lastWordPosRef.current = null
      setPosition({
        verseKey: timing.verseKey,
        wordPosition: null,
        timeMs: timing.from,
      })
    },
    [clampVerse],
  )

  /** Load a chapter's audio + timings; returns whether it succeeded */
  const loadChapter = useCallback(
    async (intent: LoadIntent): Promise<boolean> => {
      const token = ++loadTokenRef.current
      const chapterChanged = chapterIdRef.current !== intent.chapterId
      modeRef.current = intent.mode
      chapterIdRef.current = intent.chapterId
      prefetchedNextRef.current = null
      lastIntentRef.current = intent
      if (chapterChanged) {
        clearRepeatPauseRef.current()
        repeatRef.current = REPEAT_OFF
      }
      dispatch({
        type: "LOAD_START",
        chapterId: intent.chapterId,
        mode: intent.mode,
        loadingVerseKey: `${intent.chapterId}:${intent.seekToVerse}`,
        resetRepeat: chapterChanged,
      })

      try {
        const file = await getChapterAudio(intent.reciterId, intent.chapterId)
        if (token !== loadTokenRef.current) return false

        const chapter =
          chaptersRef.current.find((c) => c.id === intent.chapterId) ?? null

        const timings = sanitizeTimings(file.verse_timings)
        timingsRef.current = timings
        hasWordTimingRef.current =
          getReciter(intent.reciterId).hasWordTiming &&
          timings.some((t) => t.segments.length > 0)
        lastVerseIdxRef.current = -1
        lastWordPosRef.current = null

        const audio = audioRef.current
        if (!audio) throw new Error("Audio element unavailable")

        const target =
          timings[Math.min(Math.max(intent.seekToVerse, 1), timings.length) - 1]
        pendingSeekMsRef.current = target ? target.from : 0
        audio.src = file.audio_url

        dispatch({
          type: "LOAD_SUCCESS",
          chapterName: chapter?.name_simple ?? null,
          versesCount: timings.length || chapter?.verses_count || null,
          hasWordTiming: hasWordTimingRef.current,
          durationMs: file.duration ?? null,
        })
        if (target) {
          setPosition({
            verseKey: target.verseKey,
            wordPosition: null,
            timeMs: target.from,
          })
        }
        if (intent.autoplay) safePlay()
        return true
      } catch {
        if (token !== loadTokenRef.current) return false
        dispatch({ type: "LOAD_ERROR", message: "Couldn't load audio" })
        return false
      }
    },
    [safePlay],
  )

  const playVerse = useCallback(
    (chapterId: number, verseNumber: number) => {
      const audio = audioRef.current
      const sameChapterReady =
        chapterIdRef.current === chapterId &&
        timingsRef.current.length > 0 &&
        !!audio?.currentSrc &&
        statusRef.current !== "error" &&
        statusRef.current !== "loading"
      if (sameChapterReady) {
        if (modeRef.current !== "surah") {
          modeRef.current = "surah"
          dispatch({ type: "SET_MODE", mode: "surah" })
        }
        seekToVerseInternal(verseNumber)
        safePlay()
        return
      }
      void loadChapter({
        reciterId: reciterIdRef.current,
        chapterId,
        seekToVerse: verseNumber,
        autoplay: true,
        mode: "surah",
      })
    },
    [loadChapter, seekToVerseInternal, safePlay],
  )

  const playChapter = useCallback(
    (chapterId: number, fromVerse = 1) => playVerse(chapterId, fromVerse),
    [playVerse],
  )

  const startRadio = useCallback(
    (fromChapterId?: number) => {
      radioFailStreakRef.current = 0
      void loadChapter({
        reciterId: reciterIdRef.current,
        chapterId: fromChapterId ?? chapterIdRef.current ?? 1,
        seekToVerse: 1,
        autoplay: true,
        mode: "radio",
      })
    },
    [loadChapter],
  )

  const advanceRadio = useCallback(
    async (chapterId: number) => {
      let next = chapterId
      // Skip at most one broken chapter — never loop through failures
      while (radioFailStreakRef.current < 2) {
        const ok = await loadChapter({
          reciterId: reciterIdRef.current,
          chapterId: next,
          seekToVerse: 1,
          autoplay: true,
          mode: "radio",
        })
        if (ok) {
          radioFailStreakRef.current = 0
          return
        }
        radioFailStreakRef.current += 1
        next = (next % 114) + 1
      }
    },
    [loadChapter],
  )

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.currentSrc) return
    if (audio.paused) safePlay()
    else audio.pause()
  }, [safePlay])

  const nextAyah = useCallback(() => {
    const idx = Math.max(lastVerseIdxRef.current, 0)
    seekToVerseInternal((timingsRef.current[idx]?.verseNumber ?? 0) + 1)
  }, [seekToVerseInternal])

  const prevAyah = useCallback(() => {
    const idx = Math.max(lastVerseIdxRef.current, 0)
    seekToVerseInternal((timingsRef.current[idx]?.verseNumber ?? 2) - 1)
  }, [seekToVerseInternal])

  const seekToVerse = useCallback(
    (verseNumber: number) => seekToVerseInternal(verseNumber),
    [seekToVerseInternal],
  )

  /** Keep the lock-screen scrubber in step with the real audio position */
  const syncMediaPosition = useCallback(() => {
    if (!("mediaSession" in navigator)) return
    const audio = audioRef.current
    if (!audio?.currentSrc || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return
    }
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        position: Math.min(audio.currentTime, audio.duration),
        playbackRate: audio.playbackRate || 1,
      })
    } catch {
      // some browsers reject partial position data — cosmetic only
    }
  }, [])

  /** Seek to an arbitrary position (scrubber) and publish it immediately */
  const seekToTime = useCallback((ms: number) => {
    const audio = audioRef.current
    if (!audio || !audio.currentSrc) return
    const clamped = Math.max(0, ms)
    if (audio.readyState >= 1) {
      audio.currentTime = clamped / 1000
    } else {
      pendingSeekMsRef.current = clamped
    }
    lastVerseIdxRef.current = -1
    lastWordPosRef.current = null
    const timing = timingsRef.current[findVerseIndex(timingsRef.current, clamped)]
    setPosition({
      verseKey: timing?.verseKey ?? null,
      wordPosition: null,
      timeMs: clamped,
    })
    if (timing) requestScrollToVerse(timing.verseKey)
    syncMediaPosition()
  }, [syncMediaPosition])

  const setReciter = useCallback(
    (id: number) => {
      const reciter = getReciter(id)
      setRawPrefs((prev: unknown) => ({
        ...migrateAudioPrefs(prev),
        reciterId: reciter.id,
      }))
      reciterIdRef.current = reciter.id
      if (chapterIdRef.current !== null && statusRef.current !== "idle") {
        const wasPlaying =
          statusRef.current === "playing" || statusRef.current === "loading"
        const currentVerse =
          timingsRef.current[lastVerseIdxRef.current]?.verseNumber ?? 1
        void loadChapter({
          reciterId: reciter.id,
          chapterId: chapterIdRef.current,
          seekToVerse: currentVerse,
          autoplay: wasPlaying,
          mode: modeRef.current,
        })
      }
    },
    [setRawPrefs, loadChapter],
  )

  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      setRawPrefs((prev: unknown) => ({ ...migrateAudioPrefs(prev), speed }))
      speedRef.current = speed
      if (audioRef.current) audioRef.current.playbackRate = speed
    },
    [setRawPrefs],
  )

  const setRepeatAction = useCallback((config: Omit<RepeatConfig, "remaining">) => {
    clearRepeatPause()
    if (config.mode === "off") {
      repeatRef.current = REPEAT_OFF
      dispatch({ type: "SET_REPEAT", repeat: REPEAT_OFF })
      return
    }
    const count = timingsRef.current.length || 286
    let start = Math.min(Math.max(Math.round(config.start) || 1, 1), count)
    let end =
      config.mode === "ayah"
        ? start
        : Math.min(Math.max(Math.round(config.end) || start, 1), count)
    if (start > end) [start, end] = [end, start]
    const plays =
      config.count === Infinity ? Infinity : Math.max(Math.round(config.count) || 1, 1)
    const pauseMs = Math.max(0, Math.round(config.pauseMs) || 0)
    const repeat: RepeatConfig = {
      mode: config.mode,
      start,
      end,
      count: plays,
      remaining: plays,
      pauseMs,
    }
    repeatRef.current = repeat
    dispatch({ type: "SET_REPEAT", repeat })
  }, [clearRepeatPause])

  const playWord = useCallback((word: Word) => {
    const url = getWordAudioUrl(word)
    if (!url) return
    const wordAudio = (wordAudioRef.current ??= new Audio())
    const main = audioRef.current
    if (main && main.currentSrc && !main.paused) {
      main.pause()
      resumeAfterWordRef.current = true
    }
    const finish = () => {
      if (resumeAfterWordRef.current) {
        resumeAfterWordRef.current = false
        main?.play().catch(() => {})
      }
    }
    wordAudio.onended = finish
    wordAudio.onerror = finish
    wordAudio.src = url
    wordAudio.play().catch(finish)
  }, [])

  const retry = useCallback(() => {
    const intent = lastIntentRef.current
    if (!intent) return
    void loadChapter({
      ...intent,
      reciterId: reciterIdRef.current,
      seekToVerse:
        timingsRef.current[lastVerseIdxRef.current]?.verseNumber ??
        intent.seekToVerse,
      autoplay: true,
    })
  }, [loadChapter])

  const stop = useCallback(() => {
    ++loadTokenRef.current // invalidate any in-flight load
    clearRepeatPause()
    stopLoop()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
    }
    timingsRef.current = []
    lastVerseIdxRef.current = -1
    lastWordPosRef.current = null
    repeatRef.current = REPEAT_OFF
    chapterIdRef.current = null
    lastIntentRef.current = null
    clearPosition()
    dispatch({ type: "STOP" })
  }, [stopLoop, clearRepeatPause])

  useEffect(() => stopLoop, [stopLoop])
  useEffect(() => () => clearRepeatPause(), [clearRepeatPause])

  const handlePlay = useCallback(() => {
    dispatch({ type: "PLAYING" })
    startLoop()
  }, [startLoop])

  // Also fires on OS-level interruptions (calls, other apps taking audio)
  const handlePause = useCallback(() => {
    stopLoop()
    if (repeatGapRef.current) return // memorisation inter-loop pause
    if (!audioRef.current?.currentSrc) return // src cleared by stop()
    dispatch({ type: "PAUSED" })
  }, [stopLoop])

  const handleEnded = useCallback(() => {
    // A range ending on the last ayah reaches the file's end before the
    // tick check can fire — honour the repeat here, not just in tickBody
    const rep = repeatRef.current
    const audio = audioRef.current
    if (rep.mode !== "off" && audio && !repeatGapRef.current) {
      const startTiming = timingsRef.current[rep.start - 1]
      if (rep.remaining > 1 && startTiming) {
        rep.remaining -= 1
        dispatch({ type: "REPEAT_REMAINING", remaining: rep.remaining })
        const pauseMs = rep.pauseMs ?? 0
        if (pauseMs <= 0) {
          audio.currentTime = startTiming.from / 1000
          safePlay()
        } else {
          scheduleRepeatRestart(startTiming.from, pauseMs)
        }
        return
      }
      clearRepeatPause()
      repeatRef.current = REPEAT_OFF
      dispatch({ type: "SET_REPEAT", repeat: REPEAT_OFF })
    }
    stopLoop()
    if (modeRef.current === "radio" && chapterIdRef.current !== null) {
      void advanceRadio((chapterIdRef.current % 114) + 1)
    } else {
      dispatch({ type: "PAUSED" })
    }
  }, [stopLoop, advanceRadio, safePlay, scheduleRepeatRestart, clearRepeatPause])

  const handleError = useCallback(() => {
    if (!audioRef.current?.currentSrc) return // fired by clearing src
    if (statusRef.current === "idle") return
    stopLoop()
    dispatch({ type: "LOAD_ERROR", message: "Audio playback failed" })
  }, [stopLoop])

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    // Safari resets playbackRate on src change — always re-apply
    audio.playbackRate = speedRef.current
    if (pendingSeekMsRef.current !== null) {
      audio.currentTime = pendingSeekMsRef.current / 1000
      pendingSeekMsRef.current = null
    }
    syncMediaPosition()
  }, [syncMediaPosition])

  const handleWaiting = useCallback(
    () => dispatch({ type: "BUFFERING", buffering: true }),
    [],
  )
  const handlePlaying = useCallback(
    () => dispatch({ type: "BUFFERING", buffering: false }),
    [],
  )

  // Media Session: surah + reciter on the lock screen / earbuds / media keys
  useEffect(() => {
    if (!("mediaSession" in navigator)) return
    const ms = navigator.mediaSession
    if (state.status === "idle") {
      ms.metadata = null
      ms.playbackState = "none"
      return
    }
    ms.playbackState = state.status === "playing" ? "playing" : "paused"
    ms.metadata = new MediaMetadata({
      title:
        state.chapterName ??
        (state.chapterId !== null ? `Surah ${state.chapterId}` : "Quran"),
      artist: getReciter(prefs.reciterId).name,
      album: "RememberQuran",
    })
    syncMediaPosition()
  }, [
    state.status,
    state.chapterName,
    state.chapterId,
    prefs.reciterId,
    prefs.speed,
    syncMediaPosition,
  ])

  useEffect(() => {
    if (!("mediaSession" in navigator)) return
    const ms = navigator.mediaSession
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => togglePlayPause()],
      ["pause", () => togglePlayPause()],
      ["previoustrack", () => prevAyah()],
      ["nexttrack", () => nextAyah()],
      [
        "seekto",
        (d) => {
          if (d.seekTime != null) seekToTime(d.seekTime * 1000)
        },
      ],
    ]
    for (const [action, handler] of handlers) {
      try {
        ms.setActionHandler(action, handler)
      } catch {
        // action not supported on this browser
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          ms.setActionHandler(action, null)
        } catch {}
      }
    }
  }, [togglePlayPause, prevAyah, nextAyah, seekToTime])

  const actions = useMemo<AudioPlayerActions>(
    () => ({
      playVerse,
      playChapter,
      startRadio,
      togglePlayPause,
      nextAyah,
      prevAyah,
      seekToVerse,
      seekToTime,
      setReciter,
      setSpeed,
      setRepeat: setRepeatAction,
      playWord,
      retry,
      stop,
    }),
    [
      playVerse,
      playChapter,
      startRadio,
      togglePlayPause,
      nextAyah,
      prevAyah,
      seekToVerse,
      seekToTime,
      setReciter,
      setSpeed,
      setRepeatAction,
      playWord,
      retry,
      stop,
    ],
  )

  const value = useMemo<AudioPlayerValue>(
    () => ({
      ...state,
      reciterId: prefs.reciterId,
      speed: prefs.speed,
      ...actions,
    }),
    [state, prefs.reciterId, prefs.speed, actions],
  )

  return (
    <AudioPlayerContext.Provider value={value}>
      <AudioPlayerActionsContext.Provider value={actions}>
        {children}
      </AudioPlayerActionsContext.Provider>
      <audio
        ref={audioRef}
        preload="auto"
        hidden
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
      />
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer(): AudioPlayerValue {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider")
  }
  return ctx
}

/** Null outside the provider — for components that may render elsewhere */
export function useAudioPlayerOptional(): AudioPlayerValue | null {
  return useContext(AudioPlayerContext)
}

/** Stable actions — never triggers re-renders from playback state changes */
export function useAudioPlayerActions(): AudioPlayerActions | null {
  return useContext(AudioPlayerActionsContext)
}
