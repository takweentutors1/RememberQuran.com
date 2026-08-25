import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { getChapter, getVerseByKey, TRANSLATION_IDS } from "@/lib/quranApi"
import {
  arabicFontSize,
  getMediaPreset,
  plainTranslation,
  truncateText,
} from "@/lib/media/card-presets"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

const WIDTH = 1200
const HEIGHT = 630

/**
 * Font handling here is heavily constrained by satori (the engine behind
 * next/og) — see vercel/satori#745:
 *
 * 1. Amiri, Noto Naskh Arabic and Noto Sans Arabic all use OpenType
 *    lookupType 5 substFormat 3, which satori's parser rejects. Markazi
 *    Text is a naskh-style font that parses and shapes correctly.
 * 2. Registering a second (Latin) font alongside the Arabic one makes
 *    satori's shaper crash on Arabic runs ("codePointAt of undefined"),
 *    so the whole card uses the single Markazi Text font — it covers
 *    Latin too.
 * 3. Quranic annotation marks (small waw/yeh, sajdah/stop signs…) also
 *    crash the shaper and are stripped before rendering.
 *
 * The font comes from Google Fonts' text-subsetting endpoint (a small TTF
 * with only the characters we actually render).
 */
const CARD_FONT = "Markazi Text"

/** Quranic annotation marks that satori's shaper cannot handle. */
const QURAN_ANNOTATION_MARKS =
  /[\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g
async function loadGoogleFont(
  family: string,
  text: string,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}&text=${encodeURIComponent(text)}`
  const css = await (
    await fetch(url, {
      // Legacy UA makes Google return TTF instead of woff2 (satori needs TTF/OTF/WOFF)
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.100 Safari/534.30",
      },
    })
  ).text()

  // Accept ttf/otf/woff — satori supports all three (only woff2 is unsupported)
  const resource = css.match(/src:\s*url\((.+?)\)/)
  if (!resource) throw new Error(`No font resource for ${family}`)

  const response = await fetch(resource[1])
  if (!response.ok) throw new Error(`Font download failed for ${family}`)
  return response.arrayBuffer()
}

export async function GET(request: NextRequest) {
  const verseParam = request.nextUrl.searchParams.get("verse")
  const presetId = request.nextUrl.searchParams.get("preset")
  const parsed = parseVerseKey(verseParam)
  if (!parsed) {
    return new Response("Invalid verse", { status: 400 })
  }

  const verseKey = `${parsed.surahId}:${parsed.ayahId}`
  const preset = getMediaPreset(presetId)

  try {
    const [verse, chapter] = await Promise.all([
      getVerseByKey(verseKey, [TRANSLATION_IDS.SAHEEH_INTERNATIONAL]),
      getChapter(parsed.surahId),
    ])

    const surahName = chapter?.name_simple ?? `Surah ${parsed.surahId}`
    const arabic = (verse.text_uthmani ?? "")
      .replace(QURAN_ANNOTATION_MARKS, "")
      .trim()
    const translationRaw =
      verse.translations.find(
        (t) => t.resource_id === TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
      )?.text ??
      verse.translations[0]?.text ??
      ""
    const translation = truncateText(plainTranslation(translationRaw), 280)
    const arabicSize = arabicFontSize(arabic.length)

    const allText = `${arabic} ${translation} ${surahName} ${verseKey} RememberQuran.com 0123456789:`
    const cardFont = await loadGoogleFont(CARD_FONT, allText)

    // Satori lays words out LTR even for Arabic (no bidi word reordering),
    // so render each word as a flex item in a row-reverse wrapping row.
    const arabicWords = arabic.split(/\s+/).filter(Boolean)

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: preset.background,
            padding: "56px 64px",
            fontFamily: CARD_FONT,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              flex: 1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                columnGap: Math.round(arabicSize * 0.28),
                width: "100%",
                fontSize: arabicSize,
                lineHeight: 1.7,
                color: preset.foreground,
              }}
            >
              {arabicWords.map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </div>
            {translation ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  lineHeight: 1.45,
                  color: preset.muted,
                  maxWidth: 980,
                }}
              >
                {translation}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: `1px solid ${preset.accent}55`,
              paddingTop: 24,
              marginTop: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: preset.accent,
                }}
              >
                {surahName}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: preset.muted,
                }}
              >
                {verseKey}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                color: preset.muted,
              }}
            >
              RememberQuran.com
            </div>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
          {
            name: CARD_FONT,
            data: cardFont,
            style: "normal",
            weight: 400,
          },
        ],
      },
    )
  } catch (error) {
    console.error("OG ayah image failed", error)
    return new Response("Could not generate image", { status: 500 })
  }
}
