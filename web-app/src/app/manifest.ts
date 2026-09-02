import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RememberQuran — Read, Listen & Understand",
    short_name: "RememberQuran",
    description: "A free, public-benefit Quran study and memorisation platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    icons: [
      {
        src: "/rq-favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/rq-appicon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/rq-mark-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
