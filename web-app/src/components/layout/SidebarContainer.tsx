"use client"

import { useUI } from "@/context/UIContext"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function SidebarContainer({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useUI()

  return (
    <aside
      aria-label="Surah navigation"
      data-state={sidebarOpen ? "open" : "closed"}
      className={cn(
        "hidden shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar md:flex",
        "sticky top-14 h-[calc(100dvh-3.5rem)]",
        "transition-[width,border-color] duration-200 ease-out",
        sidebarOpen ? "w-72" : "w-0 border-r-transparent",
      )}
    >
      <div
        className={cn(
          "flex h-full min-h-0 w-72 flex-col",
          "transition-opacity duration-150",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </aside>
  )
}
