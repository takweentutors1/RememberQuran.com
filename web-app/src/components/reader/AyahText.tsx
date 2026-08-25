import React from "react"
import { cn } from "@/lib/utils"

const SIZES = {
  sm: "text-[length:var(--quran-sm)]",
  md: "text-[length:var(--quran-md)]",
  lg: "text-[length:var(--quran-lg)]",
  xl: "text-[length:var(--quran-xl,3rem)]",
  display: "text-[length:var(--quran-display)]",
}

export interface AyahTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  size?: keyof typeof SIZES
  number?: number
  highlighted?: boolean
}

export function toArabicDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d])
}

export function AyahText({
  children,
  size = "md",
  number,
  highlighted,
  className,
  ...rest
}: AyahTextProps) {
  return (
    <p
      lang="ar"
      dir="rtl"
      className={cn(
        "font-uthmani leading-[var(--quran-leading)] text-right m-0 transition-colors duration-[var(--dur-base)] ease-[var(--ease-standard)]",
        SIZES[size],
        highlighted ? "bg-[var(--brand-gold-soft)] rounded-[var(--radius-sm)]" : "bg-transparent",
        className
      )}
      {...rest}
    >
      <span className="text-[var(--reader-ink)]">{children}</span>
      {number != null && (
        <span className="text-muted-foreground text-[0.62em] mx-[0.25em] whitespace-nowrap">
          {"\u06DD"}
          {toArabicDigits(number)}
        </span>
      )}
    </p>
  )
}
