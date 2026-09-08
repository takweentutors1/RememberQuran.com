import type { Chapter } from "@/types/quran"

interface SurahMetaHeaderProps {
  chapter: Chapter
  children?: React.ReactNode
}

/**
 * Surah title block for "verse" display mode — Arabic name, transliteration,
 * translated name, ayah count/revelation place. Used both at the top of a
 * freshly loaded surah and as a divider between surahs when infinite scroll
 * appends the next one below. Bismillah is rendered by the caller
 * immediately after this, matching the original single-surah layout.
 */
export function SurahMetaHeader({ chapter, children }: SurahMetaHeaderProps) {
  return (
    <header className="mb-8 border-b border-border/40 pb-8 text-center">
      <p
        className="font-uthmani text-[2.75rem] leading-[1.7] text-foreground sm:text-[3.25rem]"
        dir="rtl"
        lang="ar"
      >
        {chapter.name_arabic}
      </p>
      <h1 className="mt-3 text-xl font-medium tracking-tight text-foreground">
        {chapter.name_simple}
      </h1>
      <p className="mt-1 font-serif text-sm text-muted-foreground">
        {chapter.translated_name.name}
      </p>
      <p className="mt-2 text-xs tabular-nums text-muted-foreground/70">
        {chapter.verses_count} ayahs ·{" "}
        {chapter.revelation_place === "makkah" ? "Makki" : "Madani"}
      </p>
      {children && <div className="mt-6 flex justify-center">{children}</div>}
    </header>
  )
}
