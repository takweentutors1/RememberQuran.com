"use client"

import { Check } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { PLAYBACK_SPEEDS } from "@/types/audio"
import { cn } from "@/lib/utils"

const barBtn = cn(
  "flex h-8 items-center justify-center rounded-md px-1.5",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
)

export function SpeedControl() {
  const { speed, setSpeed } = useAudioPlayer()

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            title="Playback speed"
            aria-label={`Playback speed ${speed}x`}
            className={cn(barBtn, "min-w-10 text-xs font-medium tabular-nums")}
          >
            {speed}×
          </button>
        )}
      />
      <PopoverContent side="top" className="w-32 p-1.5">
        <div role="radiogroup" aria-label="Playback speed" className="flex flex-col gap-0.5">
          {PLAYBACK_SPEEDS.map((s) => {
            const active = s === speed
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSpeed(s)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm",
                  "transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary/10 text-primary" : "hover:bg-accent",
                )}
              >
                <span className="tabular-nums">{s}×</span>
                {active && <Check className="size-3.5" strokeWidth={2} />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
