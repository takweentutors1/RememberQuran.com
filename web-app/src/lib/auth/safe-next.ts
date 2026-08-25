/**
 * Only allow same-origin relative paths for post-login redirects.
 * Blocks open redirects like `//evil.com` or `https://…`.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/",
): string {
  if (!next) return fallback
  const trimmed = next.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback
  }
  return trimmed
}

export type SoftGateReason =
  | "bookmark"
  | "note"
  | "progress"
  | "goal"
  | "hifz"

export function softGateCopy(reason: SoftGateReason): {
  title: string
  description: string
} {
  switch (reason) {
    case "bookmark":
      return {
        title: "Sign in to save bookmarks",
        description: "Keep this ayah in Favourites and organise your own collections.",
      }
    case "note":
      return {
        title: "Sign in to save notes",
        description: "Private notes on any ayah — only visible to you.",
      }
    case "progress":
      return {
        title: "Sign in to continue reading",
        description: "We’ll remember where you left off across devices.",
      }
    case "goal":
      return {
        title: "Sign in to track your goals",
        description: "Set a daily reading goal and keep your streak.",
      }
    case "hifz":
      return {
        title: "Sign in to track memorisation",
        description: "Mark ayahs you’ve memorised and see progress by surah and juz.",
      }
  }
}
