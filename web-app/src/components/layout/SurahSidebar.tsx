"use client"

import { useChapters } from "@/context/ChaptersContext"
import { useUI } from "@/context/UIContext"
import { SurahNavigationPanel } from "./SurahNavigationPanel"
import { SidebarContainer } from "./SidebarContainer"

export function SurahSidebar() {
  const chapters = useChapters()
  const { setSidebarOpen } = useUI()

  return (
    <SidebarContainer>
      <SurahNavigationPanel
        chapters={chapters}
        onClose={() => setSidebarOpen(false)}
        showPickerTrigger
      />
    </SidebarContainer>
  )
}
