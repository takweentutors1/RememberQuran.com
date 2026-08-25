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
        "flex items-center justify-center rounded-full border border-gold/40 size-8 shrink-0 font-mono text-xs tabular-nums text-muted-foreground",
        "transition-colors duration-(--dur-slow) ease-(--ease-out)",
        "group-hover:border-gold group-hover:text-gold group-hover:bg-gold-soft group-focus-within:border-gold group-focus-within:text-gold",
        isTarget && "border-gold text-gold bg-gold-soft",
        className,
      )}
    >
      {number}
    </div>
  )
}
