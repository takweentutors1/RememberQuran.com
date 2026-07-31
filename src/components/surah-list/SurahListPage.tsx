import { getChapters } from "@/lib/quranApi"
import { ContinuePrompt } from "@/components/account/ContinuePrompt"
import { HomeHero } from "./HomeHero"
import { QuickAccess } from "./QuickAccess"
import { SurahCard } from "./SurahCard"

export async function SurahListPage() {
  const chapters = await getChapters()

  return (
    <div className="site-shell space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <HomeHero />

      <ContinuePrompt className="w-full" />

      <QuickAccess />

      <section aria-labelledby="all-surahs-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--brand-gold)]">
              Directory
            </p>
            <h2
              id="all-surahs-heading"
              className="mt-1 font-serif text-xl font-medium tracking-tight"
            >
              All 114 Surahs
            </h2>
          </div>
        </div>

        {/* dir="rtl" makes surahs flow right-to-left (mushaf order); each card
            resets to ltr so its internal layout is unchanged. content-visibility
            lets the browser skip layout/paint for off-screen rows — a real perf
            win with 114 cards, without a client-side fetch. */}
        <div
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          dir="rtl"
          role="list"
          aria-label="List of Surahs"
        >
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              role="listitem"
              dir="ltr"
              className="animate-fade-up [content-visibility:auto] [contain-intrinsic-size:auto_76px]"
              style={{ animationDelay: `${Math.min(index * 8, 200)}ms` }}
            >
              <SurahCard chapter={chapter} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
