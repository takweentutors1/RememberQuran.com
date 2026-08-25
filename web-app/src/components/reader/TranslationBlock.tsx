import type { VerseTranslation } from "@/types/quran"
import { getTranslation, getTranslationName } from "@/lib/translations"

interface TranslationBlockProps {
  translation: VerseTranslation
}

export function TranslationBlock({ translation }: TranslationBlockProps) {
  const meta = getTranslation(translation.resource_id)
  const name = getTranslationName(translation.resource_id)
  const dir = meta?.direction ?? "ltr"
  const lang = meta?.lang ?? "en"

  return (
    <div className="mt-3 border-l-2 border-border/70 pl-3">
      <p
        dir={dir}
        lang={lang}
        className="quran-translation max-w-[66ch] font-serif text-muted-foreground"
      >
        {translation.text}
      </p>
      <p className="mt-1 text-[11px] text-subtle">— {name}</p>
    </div>
  )
}
