import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const surahParam = request.nextUrl.searchParams.get("surah") ?? "1"
  const ayahParam = request.nextUrl.searchParams.get("ayah") ?? "1"

  const surahNum = Number(surahParam)
  const ayahNum = Number(ayahParam)

  if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114 || ayahNum < 1) {
    return new Response("Invalid audio parameters", { status: 400 })
  }

  const sStr = String(surahNum).padStart(3, "0")
  const aStr = String(ayahNum).padStart(3, "0")

  const candidateUrls = [
    `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`,
    `https://verses.qurancdn.com/Alafasy/mp3/${sStr}${aStr}.mp3`,
    `https://everyayah.com/data/Alafasy_64kbps/${sStr}${aStr}.mp3`,
  ]

  for (const audioUrl of candidateUrls) {
    try {
      const upstreamRes = await fetch(audioUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; RememberQuran/1.0)",
        },
      })
      if (upstreamRes.ok) {
        const arrayBuffer = await upstreamRes.arrayBuffer()
        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      }
    } catch (err) {
      console.warn(`Upstream audio attempt failed for ${audioUrl}`, err)
    }
  }

  return new Response("Failed to fetch recitation audio from any upstream source", { status: 502 })
}
