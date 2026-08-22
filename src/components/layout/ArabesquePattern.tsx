/**
 * Decorative Islamic geometric star tiling — two overlapping squares per
 * tile (the classic 8-point star silhouette), repeated via an SVG
 * `<pattern>`. Purely decorative (`aria-hidden`); rotates slowly via the
 * `.animate-slow-spin` CSS utility, which the global reduced-motion media
 * query already neutralizes (see globals.css), so no JS motion check is
 * needed here.
 *
 * Oversized relative to its container (`-inset-[20%]`) so a corner never
 * shows a gap while it rotates.
 */
export function ArabesquePattern({
  className,
  id,
}: {
  className?: string
  /** Unique per instance — SVG pattern ids must not collide across the page. */
  id: string
}) {
  const patternId = `arabesque-${id}`

  return (
    <svg
      aria-hidden
      className={`animate-slow-spin pointer-events-none absolute -inset-[20%] -z-10 ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={patternId}
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="12" y="12" width="40" height="40" />
            <rect
              x="12"
              y="12"
              width="40"
              height="40"
              transform="rotate(45 32 32)"
            />
            <circle cx="32" cy="32" r="3" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
