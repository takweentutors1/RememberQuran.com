import type { Word } from "@/types/quran"
import { ArabicWord } from "./ArabicWord"
import { AyahEndMarker } from "./AyahEndMarker"

interface ArabicLineProps {
  words: Word[]
  showEndGlyph?: boolean
  /** Word.position currently being recited — null/undefined when inactive */
  highlightedPosition?: number | null
  verseKey?: string
}

export function ArabicLine({
  words,
  showEndGlyph = true,
  highlightedPosition = null,
  verseKey,
}: ArabicLineProps) {
  const visibleWords = (words ?? []).filter(
    (w) =>
      w.char_type_name === "word" ||
      (showEndGlyph && w.char_type_name === "end"),
  )

  return (
    <div dir="rtl" lang="ar" className="quran-arabic text-foreground">
      {visibleWords.map((word, i) => (
        <span key={word.id}>
          {word.char_type_name === "end" ? (
            <AyahEndMarker digits={word.qpc_uthmani_hafs || word.text_uthmani} />
          ) : (
            <ArabicWord
              word={word}
              isHighlighted={highlightedPosition === word.position}
              verseKey={verseKey}
            />
          )}
          {i < visibleWords.length - 1 && " "}
        </span>
      ))}
    </div>
  )
}
