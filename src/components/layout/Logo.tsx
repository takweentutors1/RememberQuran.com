import { cn } from "@/lib/utils"

/**
 * Brand assets (SVG preferred in UI; PNG for favicons / Apple / OG):
 * - Mark: /rq-mark.svg
 * - Wordmark light UI: /rq-logo-horizontal-light.svg  (dark ink on parchment)
 * - Wordmark dark UI:  /rq-logo-horizontal-dark.svg   (cream ink on dark)
 */

interface LogoMarkProps {
  size?: number
  className?: string
}

/** Gradient Q + open book mark. */
export function LogoMark({ size = 24, className }: LogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG brand mark; next/image adds little value here
    <img
      src="/rq-mark.svg"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      decoding="async"
    />
  )
}

interface LogoWordmarkProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

/** Full horizontal logo — theme-aware light/dark SVG pair. */
export function LogoWordmark({ className, size = "md" }: LogoWordmarkProps) {
  // Source artboard 562×124. Height scales up on ≥sm screens so the
  // wordmark doesn't look undersized on desktop.
  const sizes = {
    sm: { height: 22, cls: "h-[22px] sm:h-6" },
    md: { height: 28, cls: "h-7 sm:h-8" },
    lg: { height: 36, cls: "h-9 sm:h-10" },
  } as const
  const { height, cls } = sizes[size]
  const width = Math.round(height * (562 / 124))

  return (
    <span className={cn("inline-flex items-center", className)}>
      {/* Light mode: dark wordmark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/rq-logo-horizontal-light.svg"
        alt="Remember Quran"
        width={width}
        height={height}
        className={cn("w-auto dark:hidden", cls)}
        decoding="async"
        fetchPriority="high"
      />
      {/* Dark mode: light wordmark — slight lift on near-black chrome */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/rq-logo-horizontal-dark.svg"
        alt=""
        width={width}
        height={height}
        className={cn("hidden w-auto dark:block dark:brightness-110", cls)}
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
      />
    </span>
  )
}
