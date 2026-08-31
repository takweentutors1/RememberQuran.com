"use client"

import { useIsTouch } from "@/hooks/useIsTouch"
import { useAudioPlayerActions } from "@/context/AudioPlayerContext"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { getWordAudioUrl } from "@/lib/audioSources"
import { buildTajweedSpans } from "@/lib/tajweed"
import type { Word } from "@/types/quran"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { WordMeaningContent } from "./WordMeaningContent"
import { cn } from "@/lib/utils"

interface ArabicWordProps {
  word: Word
  onWordClick?: (word: Word, verseKey?: string) => void
  isHighlighted?: boolean
  isPlaying?: boolean
  verseKey?: string
  disableTooltip?: boolean
}

export function ArabicWord({
  word,
  onWordClick,
  isHighlighted = false,
  verseKey,
  disableTooltip = false,
}: ArabicWordProps) {
  const isTouch = useIsTouch()
  // Stable actions context — never re-renders words on playback state changes
  const actions = useAudioPlayerActions()
  const { tajweedEnabled } = useReaderSettings()

  // When tajweed is off this is the plain fallback (identical to pre-M3 behaviour)
  const plainText = word.qpc_uthmani_hafs || word.text_uthmani

  function wordContent() {
    if (tajweedEnabled && word.text_uthmani_tajweed) {
      return buildTajweedSpans(plainText, word.text_uthmani_tajweed).map(
        ({ text, rule }, i) =>
          rule ? (
            <span key={i} className={`tj-span tj-${rule}`}>
              {text}
            </span>
          ) : (
            <span key={i} className="tj-span">
              {text}
            </span>
          ),
      )
    }
    return plainText
  }

  const triggerClass = cn(
    "inline cursor-pointer rounded-xs px-0 py-0.5",
    "touch-manipulation select-text",
    "transition-colors duration-(--dur-fast) ease-(--ease-out)",
    "hover:bg-gold/20 hover:text-gold",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    isHighlighted && "bg-primary/20 text-primary font-bold rounded-xs",
  )

  function handleClick() {
    if (onWordClick) {
      onWordClick(word, verseKey)
    }
  }

  if (disableTooltip) {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick()
          }
        }}
        className={triggerClass}
      >
        {wordContent()}
      </span>
    )
  }

  /* Touch: tap keeps opening the meaning popover exactly as before —
     word audio lives on a button inside it (WordMeaningContent) */
  if (isTouch) {
    return (
      <Popover>
        <PopoverTrigger
          render={(props) => (
            <span {...props} className={triggerClass} tabIndex={0}>
              {wordContent()}
            </span>
          )}
        />
        <PopoverContent side="top" className="w-auto p-3">
          <WordMeaningContent word={word} verseKey={verseKey} />
        </PopoverContent>
      </Popover>
    )
  }

  /* Desktop: hover shows meaning (unchanged); click/Enter speaks the word */
  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <span
            {...props}
            className={triggerClass}
            tabIndex={0}
            onClick={(e) => {
              props.onClick?.(e)
              if (actions && getWordAudioUrl(word)) actions.playWord(word)
            }}
            onKeyDown={(e) => {
              props.onKeyDown?.(e)
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                if (actions && getWordAudioUrl(word)) actions.playWord(word)
              }
            }}
          >
            {wordContent()}
          </span>
        )}
      />
      <TooltipContent side="top">
        <WordMeaningContent word={word} verseKey={verseKey} />
      </TooltipContent>
    </Tooltip>
  )
}
