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

  const audioUrl = `https://verses.qurancdn.com/Alafasy/mp3/${String(surahNum).padStart(3, "0")}${String(ayahNum).padStart(3, "0")}.mp3`

  try {
    const upstreamRes = await fetch(audioUrl)
    if (!upstreamRes.ok) {
      return new Response("Upstream audio not found", { status: upstreamRes.status })
    }

    const arrayBuffer = await upstreamRes.arrayBuffer()

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (err) {
    console.error("Audio proxy failed", err)
    return new Response("Failed to fetch recitation audio", { status: 502 })
  }
}
