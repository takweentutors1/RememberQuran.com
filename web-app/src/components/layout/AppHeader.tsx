import React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AppHeaderProps {
  title: React.ReactNode
  backTo?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
  className?: string
}

export function AppHeader({ title, backTo, onAction, actionIcon, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center justify-between px-4 border-b border-border/40",
        "bg-background/80 backdrop-blur-md",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-start">
        {backTo && (
          <Link
            href={backTo}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"
          >
            <ChevronLeft className="size-5" />
          </Link>
        )}
      </div>

      <div className="flex flex-[2] items-center justify-center">
        <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
      </div>

      <div className="flex flex-1 items-center justify-end">
        {onAction && actionIcon && (
          <button
            onClick={onAction}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"
          >
            {actionIcon}
          </button>
        )}
      </div>
    </header>
  )
}
