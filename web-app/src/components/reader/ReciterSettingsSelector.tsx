"use client"

import { ReciterCombobox } from "@/components/audio/ReciterCombobox"
import { useAudioPlayer } from "@/context/AudioPlayerContext"

export function ReciterSettingsSelector() {
  const { reciterId, setReciter } = useAudioPlayer()

  return (
    <ReciterCombobox
      value={reciterId}
      onChange={setReciter}
      label="Reciter"
    />
  )
}
