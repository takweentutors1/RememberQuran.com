/**
 * Client-safe progress date helpers. Must never import Mongoose models
 * (ProgressTracker / ContinuePrompt run in the browser).
 *
 * "Today" for goals/streaks/progress is the user's *local* calendar day, not
 * UTC — a UTC-only day boundary falls in the middle of common reading hours
 * (post-Maghrib/Isha) for most non-UTC timezones, splitting one evening's
 * reading across two "days" or judging a streak against the wrong day
 * entirely. The timezone itself comes from a client-set cookie (see
 * TimezoneSync + getRequestTimeZone) — these helpers just do the tz-aware
 * calendar math once a timezone string is known.
 */

export const DEFAULT_TIME_ZONE = "UTC"
export const TIMEZONE_COOKIE = "rq-tz"

function calendarParts(timeZone: string, at: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at)
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value)
  return { y: get("year"), m: get("month"), d: get("day") }
}

/** UTC-offset (minutes, local-minus-UTC) of `timeZone` at instant `at`. */
function offsetMinutesAt(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at)
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value)
  const asIfUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  )
  return Math.round((asIfUTC - at.getTime()) / 60_000)
}

function dayStartFromParts(timeZone: string, y: number, m: number, d: number): Date {
  // JS Date.UTC normalizes out-of-range day numbers (0, 32, ...) across
  // month/year boundaries, so callers can pass d±N freely.
  const guess = new Date(Date.UTC(y, m - 1, d))
  return new Date(guess.getTime() - offsetMinutesAt(timeZone, guess) * 60_000)
}

/** Midnight of `at`'s calendar day in `timeZone`, as the correct UTC instant. */
export function localDayStart(timeZone: string, at: Date = new Date()): Date {
  const { y, m, d } = calendarParts(timeZone, at)
  return dayStartFromParts(timeZone, y, m, d)
}

/**
 * `localDayStart` for the calendar day `days` before/after `at`'s local day.
 * Each call independently resolves `timeZone`'s offset for its own target
 * date (rather than adding raw milliseconds to an already-computed instant),
 * so this stays correct across a DST transition within the range — with one
 * accepted limitation: this app doesn't carry a full IANA transition
 * database, so the exact transition *instant* isn't modeled — only whole
 * calendar days are, which is what goals/streaks actually need.
 */
export function shiftLocalDay(timeZone: string, at: Date, days: number): Date {
  const { y, m, d } = calendarParts(timeZone, at)
  return dayStartFromParts(timeZone, y, m, d + days)
}

/** "YYYY-MM-DD" for `at`'s calendar day in `timeZone` — a Firestore doc-id segment. */
export function localDayKey(timeZone: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at)
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    const probe = new Intl.DateTimeFormat(undefined, { timeZone })
    return Boolean(probe)
  } catch {
    return false
  }
}

export const TOTAL_SURAHS = 114
export const PROGRESS_DWELL_MS = 3_000
export const POSITION_THROTTLE_MS = 8_000
export const EVENT_DEBOUNCE_MS = 15_000

export const CONTINUE_DISMISS_KEY = "rq-continue-dismissed"
