import type { Metadata } from "next"
import Link from "next/link"
import { amiri, amiriQuran, sourceSerif4 } from "@/lib/fonts"
import { getChapters } from "@/lib/quranApi"
import Providers from "@/components/providers"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { TimezoneSync } from "@/components/TimezoneSync"
import "./globals.css"

const AudioPlayerBar = dynamic(() => import("@/components/audio/AudioPlayerBar").then(mod => mod.AudioPlayerBar))
const SurahSheet = dynamic(() => import("@/components/layout/SurahSheet").then(mod => mod.SurahSheet))
const SurahCommand = dynamic(() => import("@/components/layout/SurahCommand").then(mod => mod.SurahCommand))

export const metadata: Metadata = {
  metadataBase: new URL("https://rememberquran.com"),
  title: {
    default: "RememberQuran — Read, Listen & Understand the Quran",
    template: "%s — RememberQuran",
  },
  description:
    "A free, public-benefit Quran platform. Read the Arabic text, explore word-by-word meanings, and study translations — for everyone.",
  icons: {
    icon: [
      { url: "/rq-favicon.svg", type: "image/svg+xml" },
      { url: "/rq-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/rq-favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/rq-appicon-512.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "RememberQuran",
    title: "RememberQuran — Read, Listen & Understand the Quran",
    description:
      "A free, public-benefit Quran platform. Read Arabic, explore meanings, study translations.",
    url: "https://rememberquran.com",
    images: [
      {
        url: "/rq-mark-512.png",
        width: 512,
        height: 529,
        alt: "Remember Quran",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "RememberQuran — Read, Listen & Understand the Quran",
    description: "A free, public-benefit Quran platform.",
    images: ["/rq-mark-512.png"],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const chapters = await getChapters()

  return (
    <html
      lang="en"
      className={`${amiri.variable} ${amiriQuran.variable} ${sourceSerif4.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href="https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Link
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </Link>
        <Providers chapters={chapters}>
          <TimezoneSync />
          <Navbar />
          <main id="main" tabIndex={-1} className="min-w-0 outline-none">
            {children}
          </main>
          <Footer />
          <SurahSheet />
          <SurahCommand />
          <AudioPlayerBar />
        </Providers>
      </body>
    </html>
  )
}
