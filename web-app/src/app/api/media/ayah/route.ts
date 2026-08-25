import type { NextRequest } from "next/server"
import { getChapter, getVerseByKey, TRANSLATION_IDS } from "@/lib/quranApi"
import { plainTranslation } from "@/lib/media/card-presets"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const parsed = parseVerseKey(request.nextUrl.searchParams.get("verse"))
  if (!parsed) {
    return Response.json({ error: "Invalid ayah reference." }, { status: 400 })
  }

  const verseKey = `${parsed.surahId}:${parsed.ayahId}`

  try {
    const [verse, chapter] = await Promise.all([
      getVerseByKey(verseKey, [TRANSLATION_IDS.SAHEEH_INTERNATIONAL]),
      getChapter(parsed.surahId),
    ])
    const qpcWords = verse.words
      .map((word) => word.qpc_uthmani_hafs)
      .filter((word): word is string => Boolean(word))

    const translation =
      verse.translations.find(
        (item) =>
          item.resource_id === TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
      )?.text ??
      verse.translations[0]?.text ??
      ""

    return Response.json({
      verseKey,
      arabic:
        verse.qpc_uthmani_hafs ||
        (qpcWords.length ? qpcWords.join(" ") : verse.text_uthmani),
      translation: plainTranslation(translation),
      surahName: chapter?.name_simple ?? `Surah ${parsed.surahId}`,
      surahArabic: chapter?.name_arabic ?? "",
    })
  } catch (error) {
    console.error("Media ayah fetch failed", error)
    return Response.json(
      { error: "Could not load this ayah." },
      { status: 502 },
    )
  }
}
