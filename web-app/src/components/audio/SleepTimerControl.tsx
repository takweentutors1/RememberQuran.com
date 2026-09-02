"use client"

import { useEffect, useState } from "react"
import { Moon, Check } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { cn } from "@/lib/utils"

const SLEEP_OPTIONS = [
  { label: "Off", minutes: null },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
]

export function SleepTimerControl({ className }: { className?: string }) {
  const { sleepTimerEnd, setSleepTimer } = useAudioPlayer()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  const isActive = sleepTimerEnd !== null && sleepTimerEnd > Date.now()

  useEffect(() => {
    if (!sleepTimerEnd) {
      setTimeLeft(null)
      return
    }

    function update() {
      if (!sleepTimerEnd) {
        setTimeLeft(null)
        return
      }
      const rem = Math.max(0, Math.ceil((sleepTimerEnd - Date.now()) / 1000))
      if (rem <= 0) {
        setTimeLeft(null)
        return
      }
      const m = Math.floor(rem / 60)
      const s = rem % 60
      setTimeLeft(`${m}:${String(s).padStart(2, "0")}`)
    }

    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [sleepTimerEnd])

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            title={isActive ? `Sleep timer: ${timeLeft ?? "Active"}` : "Sleep timer"}
            aria-label={isActive ? `Sleep timer: ${timeLeft ?? "Active"}` : "Sleep timer"}
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors duration-[120ms]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              className,
            )}
          >
            {isActive ? (
              <span className="font-mono text-[10px] tabular-nums font-semibold">
                {timeLeft ?? <Moon className="size-3.5" />}
              </span>
            ) : (
              <Moon className="size-3.5" strokeWidth={1.75} />
            )}
          </button>
        )}
      />
      <PopoverContent side="top" className="w-36 p-1.5">
        <div role="radiogroup" aria-label="Sleep timer duration" className="flex flex-col gap-0.5">
          <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            Sleep timer
          </div>
          {SLEEP_OPTIONS.map(({ label, minutes }) => {
            const isSelected =
              minutes === null
                ? !isActive
                : isActive &&
                  sleepTimerEnd !== null &&
                  Math.abs(sleepTimerEnd - Date.now() - minutes * 60 * 1000) < 60000

            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSleepTimer(minutes)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium",
                  "transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <span>{label}</span>
                {isSelected && <Check className="size-3.5" strokeWidth={2} />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
