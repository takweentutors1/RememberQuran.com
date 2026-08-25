import type { Metadata } from "next"
import { AyahCardDesigner } from "@/components/media-maker/AyahCardDesigner"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const metadata: Metadata = {
  title: "Media Maker",
  description:
    "Create a shareable Quran ayah card with Arabic, translation, and RememberQuran branding.",
}

export default async function MediaMakerPage({
  searchParams,
}: {
  searchParams: Promise<{ verse?: string; preset?: string }>
}) {
  const params = await searchParams
  const parsed = parseVerseKey(params.verse ?? "")
  const initialVerse = parsed
    ? `${parsed.surahId}:${parsed.ayahId}`
    : "2:255"

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Share
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Media Maker
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Turn any ayah into a carefully typeset card using the official
          Uthmani script. Free for everyone.
        </p>
      </header>

      <AyahCardDesigner
        initialVerse={initialVerse}
        initialPreset={params.preset}
      />
    </div>
  )
}
