"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface UIContextValue {
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  focusMode: boolean
  setFocusMode: (focus: boolean) => void
  toggleFocusMode: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useLocalStorage("rq-sidebar-open", true)
  // Deliberately not persisted: focus mode is a "hide chrome while I'm
  // reading right now" toggle, not a standing preference. Starting every
  // session with it off also sidesteps a stale-true value hiding navigation
  // on a route that has no way to turn it back off.
  const [focusMode, setFocusMode] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((v) => !v)
  }, [setSidebarOpen])

  const toggleFocusMode = useCallback(() => {
    setFocusMode((v) => !v)
  }, [])

  return (
    <UIContext.Provider
      value={{
        commandOpen,
        setCommandOpen,
        mobileNavOpen,
        setMobileNavOpen,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        focusMode,
        setFocusMode,
        toggleFocusMode,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error("useUI must be used within UIProvider")
  return ctx
}
