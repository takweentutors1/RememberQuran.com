"use client"

import { useUI } from "@/context/UIContext"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import type { ReactNode } from "react"

/**
 * Exposes sidebar open state to CSS (`group-data-[sidebar=open]`)
 * — avoids hydration mismatch from JS breakpoints.
 */
export function SurahLayoutShell({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useUI()

  return (
    <div
      className="group flex"
      data-sidebar={sidebarOpen ? "open" : "closed"}
    >
      {children}
    </div>
  )
}
