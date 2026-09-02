"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface ActivityHeatmapProps {
  activityMap: Record<string, number>
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-muted/60 dark:bg-muted/30"
  if (count <= 10) return "bg-emerald-500/30 text-emerald-900 dark:bg-emerald-500/25"
  if (count <= 30) return "bg-emerald-500/55 text-emerald-950 dark:bg-emerald-500/50"
  if (count <= 60) return "bg-emerald-500/80 text-white dark:bg-emerald-500/75"
  return "bg-emerald-500 text-white dark:bg-emerald-400"
}

export function ActivityHeatmap({ activityMap }: ActivityHeatmapProps) {
  const { weeks, monthLabels, totalAyahsRead, activeDaysCount } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Compute past 52 weeks (364 days), aligning to Sunday start
    const days: Array<{ date: Date; key: string; count: number }> = []
    let totalAyahs = 0
    let activeDays = 0

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      const key = `${yyyy}-${mm}-${dd}`
      const count = activityMap[key] ?? 0
      if (count > 0) {
        totalAyahs += count
        activeDays += 1
      }
      days.push({ date: d, key, count })
    }

    // Group into 52 weeks (columns of 7 days)
    const weekGroups: Array<Array<{ date: Date; key: string; count: number }>> = []
    for (let i = 0; i < days.length; i += 7) {
      weekGroups.push(days.slice(i, i + 7))
    }

    // Generate Month Labels
    const labels: Array<{ label: string; weekIndex: number }> = []
    let lastMonth = -1
    weekGroups.forEach((week, wIdx) => {
      const firstDay = week[0]?.date
      if (firstDay && firstDay.getMonth() !== lastMonth) {
        lastMonth = firstDay.getMonth()
        labels.push({ label: MONTH_NAMES[lastMonth]!, weekIndex: wIdx })
      }
    })

    return {
      weeks: weekGroups,
      monthLabels: labels,
      totalAyahsRead: totalAyahs,
      activeDaysCount: activeDays,
    }
  }, [activityMap])

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Annual Reading Activity</h3>
          <p className="text-xs text-muted-foreground">
            {totalAyahsRead.toLocaleString()} ayahs read across {activeDaysCount} active days in the last 52 weeks
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Less</span>
          <span className="size-2.5 rounded-xs bg-muted/60" />
          <span className="size-2.5 rounded-xs bg-emerald-500/30" />
          <span className="size-2.5 rounded-xs bg-emerald-500/55" />
          <span className="size-2.5 rounded-xs bg-emerald-500/80" />
          <span className="size-2.5 rounded-xs bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[640px]">
          {/* Month headers */}
          <div className="relative h-4 mb-1 text-[10px] text-muted-foreground">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${(m.weekIndex / 52) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* 52 Columns x 7 Rows */}
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => (
                  <span
                    key={day.key}
                    title={`${day.key}: ${day.count} ayahs`}
                    className={cn(
                      "size-2.5 rounded-xs transition-transform hover:scale-125 hover:z-10",
                      getIntensityClass(day.count),
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
