import { SurahListPage } from "@/components/surah-list/SurahListPage"

/**
 * The home page is fully static — the surah list and the ayah of the day are
 * both pure functions of data already in hand, so nothing here needs a
 * request-time render.
 *
 * It is revalidated hourly for one reason: the ayah of the day is keyed to the
 * UTC calendar day, and without ISR the page would stay frozen on whatever day
 * it was built. An hour is well inside the tolerance for a daily rotation and
 * keeps the route CDN-cacheable.
 */
export const revalidate = 3600

export default function HomePage() {
  return <SurahListPage />
}
