"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/** Ayah deep links keep their own scroll target in QuranReader. */
function isAyahDeepLink(pathname: string) {
  return /^\/\d+\/\d+\/?$/.test(pathname)
}

export function RouteChangeEffect() {
  const pathname = usePathname()

  useEffect(() => {
    // preventScroll: focusing #main must not scroll away from a target ayah
    // when arriving at /surah/ayah URLs (QuranReader owns that scroll)
    document.getElementById("main")?.focus({ preventScroll: true })

    if (!isAyahDeepLink(pathname)) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [pathname])

  return null
}
