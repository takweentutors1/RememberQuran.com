import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  BookmarksView,
  type BookmarkDto,
  type CollectionDto,
} from "@/components/account/BookmarksView"
import { getOrCreateFavourites, listCollections } from "@/lib/firestore/bookmarkCollections"
import { listBookmarks } from "@/lib/firestore/bookmarks"
import { getChapters } from "@/lib/quranApi"

export const metadata: Metadata = {
  title: "Bookmarks",
}

export const dynamic = "force-dynamic"

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/bookmarks")
  }
  const userId = session.user.id

  // Seed Favourites in parallel with bookmarks/chapters; collections after seed
  const [, bookmarks, chapters] = await Promise.all([
    getOrCreateFavourites(userId),
    listBookmarks(userId),
    getChapters(),
  ])
  const collections = await listCollections(userId)

  const chapterById = new Map(chapters.map((c) => [c.id, c]))

  const collectionDtos: CollectionDto[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    isDefault: c.isDefault,
  }))

  const bookmarkDtos: BookmarkDto[] = bookmarks
    .map((b) => {
      const [surahId, ayahId] = b.verseKey.split(":").map(Number)
      const chapter = chapterById.get(surahId)
      return {
        verseKey: b.verseKey,
        surahId,
        ayahId,
        collectionId: b.collectionId,
        surahName: chapter?.name_simple ?? `Surah ${surahId}`,
        surahArabic: chapter?.name_arabic ?? "",
      }
    })
    .sort((a, b) => a.surahId - b.surahId || a.ayahId - b.ayahId)

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Your account
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Bookmarks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saved ayahs, organised into collections. Tap any ayah to continue
          reading from it.
        </p>
      </div>

      <BookmarksView
        initialCollections={collectionDtos}
        initialBookmarks={bookmarkDtos}
      />
    </div>
  )
}
