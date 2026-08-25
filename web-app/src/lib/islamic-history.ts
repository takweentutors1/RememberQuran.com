/**
 * "On this day in Islamic history" ticker content.
 *
 * A static, curated table rather than a real Hijri-calendar lookup: an
 * accurate Gregorian-to-Hijri mapping needs a maintained conversion table
 * (the Hijri calendar is observation-based and drifts against any fixed
 * arithmetic approximation), which is out of scope here. Instead the ticker
 * rotates deterministically by UTC day through a set of well-established,
 * uncontested events — same "pure function of the date" shape as
 * `lib/quran/ayah-of-the-day.ts`, so the choice is identical on server and
 * client and the page stays statically renderable.
 */

export interface HistoryFact {
  title: string
  body: string
}

const FACTS: readonly HistoryFact[] = [
  {
    title: "The first revelation",
    body: "In the cave of Hira, the Angel Jibril brought the first verses of the Quran to Prophet Muhammad ﷺ, beginning with 'Iqra' — Read.",
  },
  {
    title: "The Hijrah",
    body: "The Prophet ﷺ and Abu Bakr migrated from Makkah to Madinah, an event that later marked the start of the Islamic calendar.",
  },
  {
    title: "The Battle of Badr",
    body: "A small, poorly-equipped Muslim force met a much larger army at Badr — remembered as the first major battle in Islamic history.",
  },
  {
    title: "The Conquest of Makkah",
    body: "The Prophet ﷺ returned to Makkah peacefully, forgave those who had once persecuted the Muslims, and cleared the Kaaba of idols.",
  },
  {
    title: "The Farewell Sermon",
    body: "During his final pilgrimage, the Prophet ﷺ delivered a sermon at Arafat affirming the sanctity of life, property, and equality among people.",
  },
  {
    title: "Compilation of the Quran",
    body: "Under Caliph Abu Bakr, and later standardised under Caliph Uthman, the Quran was compiled into a single authoritative written codex.",
  },
  {
    title: "The Treaty of Hudaybiyyah",
    body: "A ten-year peace agreement between the Muslims of Madinah and the Quraysh of Makkah, later described in the Quran as a clear victory.",
  },
  {
    title: "The Night Journey",
    body: "Al-Isra wal Mi'raj: the Prophet's ﷺ night journey from Makkah to Jerusalem, and his ascension through the heavens.",
  },
  {
    title: "The founding of Bayt al-Hikmah",
    body: "The House of Wisdom in Baghdad became a major centre of learning, where scholars translated and advanced works in science, medicine, and philosophy.",
  },
  {
    title: "Salahuddin and Jerusalem",
    body: "Salah ad-Din Ayyubi retook Jerusalem, granting safe passage to its inhabitants — an event widely noted for its restraint.",
  },
] as const

export const HISTORY_FACT_COUNT = FACTS.length

/** Days since the Unix epoch, in UTC — mirrors `ayah-of-the-day.ts`. */
function utcDayIndex(now: Date): number {
  return Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  )
}

/** All facts, ordered to start from today's pick — for the auto-sliding ticker. */
export function getHistoryFactsFrom(now: Date = new Date()): HistoryFact[] {
  const start =
    ((utcDayIndex(now) % FACTS.length) + FACTS.length) % FACTS.length
  return [...FACTS.slice(start), ...FACTS.slice(0, start)]
}
