import {
  Newsreader,
  Public_Sans,
  Noto_Naskh_Arabic,
  JetBrains_Mono,
  Amiri,
  Amiri_Quran,
} from "next/font/google"

/** Display, long-form prose, headings — regular weight only. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  axes: ["opsz"],
})

/** All UI chrome: nav, labels, buttons, metadata. */
export const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-public-sans",
  display: "swap",
})

/** Arabic UI text — surah names in lists, NOT revelation text. */
export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  variable: "--font-noto-naskh",
  display: "swap",
})

/** Verse references, ayah numbers, numerals in metadata. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

/**
 * Kept as fallback for Quranic Arabic.
 * Primary Arabic is UthmanicHafs (local @font-face in globals.css).
 */
export const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
})

export const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-amiri-quran",
  display: "swap",
})
