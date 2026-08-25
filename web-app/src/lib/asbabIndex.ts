import asbabIndex from "@/data/asbab-index.json"

/**
 * Curated coverage index for Asbab al-Nuzul (built by
 * scripts/build-asbab-index.mjs — only genuine Wahidi entries, plus empty_ayahs
 * aliased to their group-head; the dataset's mystical-commentary padding is
 * excluded). A few KB, safe to import statically on the client.
 */
const coverage = asbabIndex.coverage as Record<string, number[]>
const redirects = asbabIndex.redirects as Record<string, string>

/** Does this ayah have a recorded reason for revelation? */
export function hasAsbab(verseKey: string): boolean {
  const [surah, ayah] = verseKey.split(":")
  return coverage[surah]?.includes(Number(ayah)) ?? false
}

/**
 * empty_ayahs share text with a neighboring group-head on the CDN.
 * Returns the verse_key whose JSON file actually holds the passage.
 */
export function resolveAsbabKey(verseKey: string): string {
  return redirects[verseKey] ?? verseKey
}
