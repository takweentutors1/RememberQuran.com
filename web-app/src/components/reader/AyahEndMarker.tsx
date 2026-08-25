"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"

interface AyahEndMarkerProps {
  /** Arabic-Indic digits from the API's end-of-ayah word, e.g. "٢٥٥" */
  digits: string
  ariaLabel?: string
}

/**
 * Mushaf-style end-of-ayah medallion (number inside the ornament).
 * UthmanicHafs ligates plain digit runs into the medallion by itself;
 * Amiri Quran only forms it when U+06DD precedes the digits — adding
 * U+06DD under UthmanicHafs draws an extra empty medallion instead.
 */
export function AyahEndMarker({ digits, ariaLabel }: AyahEndMarkerProps) {
  const { quranFont } = useReaderSettings()
  const text = quranFont === "amiri" ? `۝${digits}` : digits

  return (
    <span className="mx-1.5 inline-block text-foreground/90" aria-label={ariaLabel}>
      {text}
    </span>
  )
}
