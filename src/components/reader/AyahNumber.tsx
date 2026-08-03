import { cn } from "@/lib/utils"

interface AyahNumberProps {
  number: number
  className?: string
  isTarget?: boolean
}

export function AyahNumber({ number, className, isTarget }: AyahNumberProps) {
  return (
    <div
      data-numeric
      aria-label={`Ayah ${number}`}
      className={cn(
        "diamond-frame size-8 shrink-0 text-xs tabular-nums text-muted-foreground",
        "transition-colors duration-(--dur-slow) ease-(--ease-out)",
        "group-hover:text-gold group-focus-within:text-gold",
        isTarget && "text-gold [&::before]:border-gold",
        className,
      )}
    >
      {number}
    </div>
  )
}
