import { getChapters } from "@/lib/quranApi"
import { HeroSection } from "./HeroSection"
import { AyahOfTheDayCard } from "./AyahOfTheDayCard"
import { IslamicHistoryCard } from "./IslamicHistoryCard"
import { QuickAccess } from "./QuickAccess"
import { SurahExplorer } from "./SurahExplorer"

export async function SurahListPage() {
  const chapters = await getChapters()

  return (
    <div className="flex flex-col">
      {/* Full width hero section */}
      <HeroSection />

      <div className="site-shell space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Bento Grid layout matching the new design */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-5">
          {/* Ayah of the day taking 3/5 width on desktop */}
          <div className="lg:col-span-3">
            <AyahOfTheDayCard />
          </div>
          
          {/* Right column taking 2/5 width, stacking vertically */}
          <div className="flex flex-col gap-2.5 lg:col-span-2">
            <div className="flex-1">
              <IslamicHistoryCard />
            </div>
            <div className="flex-1">
              <QuickAccess className="grid-cols-2 lg:grid-cols-2 lg:grid-rows-2" />
            </div>
          </div>
        </div>

        <SurahExplorer chapters={chapters} />
      </div>
    </div>
  )
}
