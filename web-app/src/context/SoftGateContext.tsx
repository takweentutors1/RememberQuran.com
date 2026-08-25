"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { SoftGateReason } from "@/lib/auth/safe-next"

interface SoftGateState {
  open: boolean
  reason: SoftGateReason
  nextPath: string
}

interface SoftGateContextValue {
  state: SoftGateState
  requireAuth: (reason: SoftGateReason, nextPath?: string) => void
  close: () => void
}

const SoftGateContext = createContext<SoftGateContextValue | null>(null)

const INITIAL: SoftGateState = {
  open: false,
  reason: "bookmark",
  nextPath: "/",
}

export function SoftGateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SoftGateState>(INITIAL)

  const requireAuth = useCallback((reason: SoftGateReason, nextPath?: string) => {
    const path =
      nextPath ??
      (typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/")
    setState({ open: true, reason, nextPath: path })
  }, [])

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  const value = useMemo(
    () => ({ state, requireAuth, close }),
    [state, requireAuth, close],
  )

  return (
    <SoftGateContext.Provider value={value}>{children}</SoftGateContext.Provider>
  )
}

export function useSoftGate() {
  const ctx = useContext(SoftGateContext)
  if (!ctx) throw new Error("useSoftGate must be used within SoftGateProvider")
  return ctx
}
