/**
 * Soft client navigation after Auth.js credentials sign-in / sign-out.
 * Prefer this over `window.location.assign` so the app shell (providers,
 * chapters cache, audio) stays mounted instead of a full document reload.
 */
export async function navigateAfterAuth(
  router: { push: (href: string) => void; refresh: () => void },
  path: string,
) {
  router.push(path)
  router.refresh()
}
