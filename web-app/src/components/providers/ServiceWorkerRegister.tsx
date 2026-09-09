"use client"

import { useEffect, useState } from "react"

export function ServiceWorkerRegister() {
  // The service worker calls skipWaiting() + clients.claim() unconditionally
  // on every deploy, so a new one takes control of already-open tabs almost
  // immediately — but that only updates the *worker*. The React app already
  // running in the tab keeps executing the old JS it loaded at page-load
  // time until an actual page reload happens. Without this, a deploy can
  // sit fully live on the server while every tab that was open beforehand
  // keeps showing old behavior indefinitely, with no way for the user to
  // know a fix is one refresh away.
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return
    }

    let controllerAtLoad = navigator.serviceWorker.controller
    function onControllerChange() {
      // Only surfaces the banner for a controller that *changed after this
      // tab loaded* — a fresh tab's first-ever controller isn't an update.
      if (!controllerAtLoad) {
        controllerAtLoad = navigator.serviceWorker.controller
        return
      }
      setUpdateAvailable(true)
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA] Service Worker registered:", reg.scope)
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration failed:", err)
      })

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  if (!updateAvailable) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-center gap-3 border-t border-border bg-background px-4 py-3 text-sm shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
    >
      <span className="text-foreground">A new version of RememberQuran is available.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Refresh
      </button>
    </div>
  )
}
