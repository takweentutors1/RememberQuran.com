"use client"

import { useUI } from "@/context/UIContext"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import type { ReactNode } from "react"

/**
 * Exposes sidebar open state and the active layout mode to CSS
 * (`group-data-[sidebar=open]`, `group-data-[layout=child]`, …) — avoids
 * hydration mismatch from JS breakpoints and keeps layout-mode styling
 * declarative in descendant components.
 */
export function SurahLayoutShell({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useUI()
  const { layoutMode } = useReaderSettings()
  // single-page/child/flow force the sidebar collapsed (see SidebarContainer)
  // regardless of the user's last toggle — reflect that here too, so every
  // consumer of `data-sidebar` (picker trigger, navbar logo column, …) sees
  // the same effective state.
  const sidebarEffectivelyOpen = sidebarOpen && layoutMode === "classic"

  return (
    <div
      className="group flex"
      data-sidebar={sidebarEffectivelyOpen ? "open" : "closed"}
      data-layout={layoutMode}
    >
      {children}
    </div>
  )
}
