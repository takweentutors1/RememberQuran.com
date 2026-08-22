"use client"

import { useEffect } from "react"
import { useReaderSettings, type LayoutMode } from "@/context/ReaderSettingsContext"

export function LayoutSync({ layoutMode }: { layoutMode: LayoutMode }) {
  const { setLayoutMode } = useReaderSettings()

  useEffect(() => {
    setLayoutMode(layoutMode)
  }, [layoutMode, setLayoutMode])

  return null
}
