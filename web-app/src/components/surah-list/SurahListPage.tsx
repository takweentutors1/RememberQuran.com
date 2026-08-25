import { getChapters } from "@/lib/quranApi"
import { HeroTile } from "./HeroTile"
import { QuickAccess } from "./QuickAccess"
import { SurahExplorer } from "./SurahExplorer"

export async function SurahListPage() {
  const chapters = await getChapters()

  return (
    <div className="site-shell space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Bento: the resume-reading feature tile takes 3/4 of the row; the
          remaining column is quick access, which grid's default
          `align-items: stretch` matches to the hero's height, so the two
          columns always read as one deliberate block. Ayah of the day lives
          inside HeroTile itself now, not as a separate section. */}
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <HeroTile />
        </div>
        <QuickAccess className="lg:col-span-1" />
      </div>

      <SurahExplorer chapters={chapters} />
    </div>
  )
}
