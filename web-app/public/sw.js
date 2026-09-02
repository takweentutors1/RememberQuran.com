const CACHE_NAME = "rememberquran-v1"

const STATIC_ASSETS = [
  "/",
  "/fonts/UthmanicHafs1Ver18.woff2",
  "/fonts/aqf_bsml.woff2",
  "/rq-favicon.svg",
  "/rq-favicon-192.png",
  "/rq-appicon-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Only handle GET requests
  if (event.request.method !== "GET") return

  // Cache-first for web fonts
  if (url.pathname.startsWith("/fonts/") || url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached
        const res = await fetch(event.request)
        if (res.status === 200) cache.put(event.request, res.clone())
        return res
      })
    )
    return
  }

  // Network-first with cache fallback for Surah APIs & Next static pages
  if (url.pathname.startsWith("/api/surah/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(event.request)
          if (cached) return cached
          return new Response(JSON.stringify({ error: "Offline — surah not cached yet." }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          })
        })
    )
    return
  }

  // Stale-while-revalidate for static assets
  if (url.pathname.startsWith("/_next/static/") || url.pathname.endsWith(".png") || url.pathname.endsWith(".svg")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()))
          }
          return networkResponse
        }).catch(() => cached)
        return cached || fetchPromise
      })
    )
  }
})
