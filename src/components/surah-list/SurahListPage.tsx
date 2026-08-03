import { getChapters } from "@/lib/quranApi"
import { ContinuePrompt } from "@/components/account/ContinuePrompt"
import { HomeHero } from "./HomeHero"
import { QuickAccess } from "./QuickAccess"
import { SurahCard } from "./SurahCard"
import { SurahFilter } from "./SurahFilter"

/** Shared between the filter control and the grid it drives. */
const SURAH_GRID_ID = "surah-grid"

export async function SurahListPage() {
  const chapters = await getChapters()

  return (
    <div className="site-shell space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <HomeHero />

      <ContinuePrompt className="w-full" />

      <QuickAccess />

      <section aria-labelledby="all-surahs-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
              Directory
            </p>
            <h2
              id="all-surahs-heading"
              className="mt-1 text-xl font-medium tracking-tight"
            >
              The 114 surahs
            </h2>
          </div>
          <SurahFilter targetId={SURAH_GRID_ID} />
        </div>

        {/* dir="rtl" makes surahs flow right-to-left (mushaf order); each card
            resets to ltr so its internal layout is unchanged. content-visibility
            lets the browser skip layout/paint for off-screen rows — a real perf
            win with 114 cards, without a client-side fetch.

            The stagger is capped at 200ms: uncapped, 114 × 8ms would leave the
            last card waiting nearly a second. */}
        <div
          id={SURAH_GRID_ID}
          data-surah-grid
          data-filter="all"
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          dir="rtl"
          role="list"
          aria-label="List of surahs"
        >
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              role="listitem"
              dir="ltr"
              data-place={chapter.revelation_place}
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
