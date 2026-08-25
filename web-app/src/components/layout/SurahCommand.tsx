"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useUI } from "@/context/UIContext"

const SurahCommandDialog = dynamic(
  () =>
    import("./SurahCommandDialog").then((m) => m.SurahCommandDialog),
  { ssr: false },
)

/** Host: always mounted for ⌘K; dialog + cmdk load only after first open. */
export function SurahCommand() {
  const { commandOpen, setCommandOpen } = useUI()
  const [mounted, setMounted] = useState(false)

  // Latch true the first time commandOpen goes true — setState during
  // render (not in an effect) is the React-endorsed way to derive state
  // from a prop/context value without an extra render+effect round trip.
  if (commandOpen && !mounted) {
    setMounted(true)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setMounted(true)
        setCommandOpen(true)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [setCommandOpen])

  if (!mounted) return null
  return <SurahCommandDialog />
}
