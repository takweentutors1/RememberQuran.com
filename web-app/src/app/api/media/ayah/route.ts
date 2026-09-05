import type { NextRequest } from "next/server"
import { getChapter, getVerseByKey, TRANSLATION_IDS } from "@/lib/quranApi"
import { plainTranslation } from "@/lib/media/card-presets"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const verseParam = request.nextUrl.searchParams.get("verse") ?? ""

  // Match single "2:255" or range "2:255-257" or "2:255-2:257"
  const rangeMatch = verseParam.match(/^(\d+):(\d+)(?:-(\d+)(?::(\d+))?)?$/)
  if (!rangeMatch) {
    return Response.json({ error: "Invalid ayah reference." }, { status: 400 })
  }

  const surahId = Number(rangeMatch[1])
  const startAyah = Number(rangeMatch[2])
  const endAyah = rangeMatch[4]
    ? Number(rangeMatch[4])
    : rangeMatch[3]
    ? Number(rangeMatch[3])
    : startAyah

  if (surahId < 1 || surahId > 114 || startAyah < 1 || endAyah < startAyah || endAyah - startAyah > 10) {
    return Response.json({ error: "Passage range must be 1–10 verses within the same surah." }, { status: 400 })
  }

  const verseKeys = Array.from({ length: endAyah - startAyah + 1 }, (_, i) => `${surahId}:${startAyah + i}`)
  const displayKey = startAyah === endAyah ? `${surahId}:${startAyah}` : `${surahId}:${startAyah}–${endAyah}`

  try {
    const [verses, chapter] = await Promise.all([
      Promise.all(verseKeys.map((k) => getVerseByKey(k, [TRANSLATION_IDS.SAHEEH_INTERNATIONAL]))),
      getChapter(surahId),
    ])

    const arabics = verses.map((v) => {
      const qpcWords = v.words
        .map((word) => word.qpc_uthmani_hafs)
        .filter((word): word is string => Boolean(word))
      return v.qpc_uthmani_hafs || (qpcWords.length ? qpcWords.join(" ") : v.text_uthmani)
    })

    // Per-word breakdown for the video export's word-by-word highlight —
    // `position` matches the wordPosition in QDC's audio segment timings
    // (see src/types/audio.ts), so this is the join key between text and audio.
    // "end" entries are the ayah-number ornament glyph, not spoken words —
    // kept so the marker still renders, but excluded from highlight timing.
    const words = verses.map((v) => ({
      verseNumber: v.verse_number,
      words: v.words
        .filter((w) => w.char_type_name === "word" || w.char_type_name === "end")
        .map((w) => ({
          position: w.position,
          text: w.qpc_uthmani_hafs || w.text_uthmani,
          isEndMarker: w.char_type_name === "end",
        })),
    }))

    const translations = verses.map((v) => {
      const t =
        v.translations.find(
          (item) => item.resource_id === TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
        )?.text ??
        v.translations[0]?.text ??
        ""
      return plainTranslation(t)
    })

    return Response.json({
      verseKey: displayKey,
      arabic: arabics.join(" "),
      words,
      translation: translations.join(" "),
      surahName: chapter?.name_simple ?? `Surah ${surahId}`,
      surahArabic: chapter?.name_arabic ?? "",
      startAyah,
      endAyah,
      surahId,
    })
  } catch (error) {
    console.error("Media ayah fetch failed", error)
    return Response.json(
      { error: "Could not load this passage." },
      { status: 502 },
    )
  }
}
