"use client"

import { useState, type FormEvent } from "react"
import { Flame, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AYAHS_PER_PAGE,
  type GoalType,
} from "@/lib/goals/constants"
import { cn } from "@/lib/utils"

export interface GoalsSnapshot {
  goal: { type: GoalType; target: number } | null
  todayAyahs: number
  todayCount: number
  metToday: boolean
  streak: {
    currentStreak: number
    longestStreak: number
    lastMetDate: string | null
  }
  week: Array<{ date: string; met: boolean }>
}

function weekdayLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: "narrow", timeZone: "UTC" })
}

export function GoalsView({ initial }: { initial: GoalsSnapshot }) {
  const [data, setData] = useState(initial)
  const [type, setType] = useState<GoalType>(initial.goal?.type ?? "ayahs")
  const [target, setTarget] = useState(String(initial.goal?.target ?? 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/account/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, target: Number(target) }),
      })
      const body = (await res.json().catch(() => ({}))) as GoalsSnapshot & {
        error?: string
      }
      if (!res.ok) {
        setError(body.error ?? "Couldn’t save goal.")
        return
      }
      setData(body)
    } catch {
      setError("Couldn’t save goal.")
    } finally {
      setBusy(false)
    }
  }

  async function clearGoal() {
    if (!window.confirm("Clear your daily goal?")) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/account/goals", { method: "DELETE" })
      const body = (await res.json().catch(() => ({}))) as GoalsSnapshot & {
        error?: string
      }
      if (!res.ok) {
        setError(body.error ?? "Couldn’t clear goal.")
        return
      }
      setData(body)
      setTarget("10")
      setType("ayahs")
    } catch {
      setError("Couldn’t clear goal.")
    } finally {
      setBusy(false)
    }
  }

  const unit = data.goal?.type === "pages" ? "pages" : "ayahs"
  const progressPct = data.goal
    ? Math.min(100, Math.floor((data.todayCount / data.goal.target) * 100))
    : 0

  return (
    <div className="space-y-8">
      {/* Streak */}
      <section className="rounded-lg border border-border px-4 py-5">
        <div className="flex items-start gap-3">
          <Flame
            className={cn(
              "mt-0.5 size-5",
              data.streak.currentStreak > 0
                ? "text-primary"
                : "text-muted-foreground",
            )}
            strokeWidth={1.75}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Current streak</p>
            <p className="mt-0.5 font-serif text-3xl font-medium tabular-nums tracking-tight">
              {data.streak.currentStreak}
              <span className="ml-1.5 text-base font-normal text-muted-foreground">
                {data.streak.currentStreak === 1 ? "day" : "days"}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Longest: {data.streak.longestStreak}{" "}
              {data.streak.longestStreak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>

        <ul
          className="mt-5 flex justify-between gap-1"
          aria-label="Last seven days"
        >
          {data.week.map((day) => (
            <li key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  day.met ? "bg-primary" : "bg-muted",
                )}
                title={day.met ? "Goal met" : "Goal not met"}
              />
              <span className="text-[0.65rem] text-muted-foreground">
                {weekdayLabel(day.date)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Today */}
      <section>
        <div className="flex items-center gap-2 text-primary">
          <Target className="size-4" strokeWidth={1.75} />
          <h2 className="text-sm font-medium">Today</h2>
        </div>
        {data.goal ? (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">
                {data.todayCount}
              </span>
              {" / "}
              <span className="tabular-nums">{data.goal.target}</span> {unit}
              {data.metToday && (
                <span className="ml-2 text-primary">Goal met</span>
              )}
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Based on {data.todayAyahs.toLocaleString()} ayahs viewed today
              {data.goal.type === "pages"
                ? ` (${AYAHS_PER_PAGE} ayahs ≈ 1 page)`
                : ""}
              .
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Set a daily goal below to start a streak. Reading stays free either
            way.
          </p>
        )}
      </section>

      {/* Settings */}
      <section>
        <h2 className="text-sm font-medium text-foreground">Daily goal</h2>
        <form onSubmit={save} className="mt-3 space-y-4">
          <fieldset className="flex gap-2">
            <legend className="sr-only">Goal type</legend>
            {(["ayahs", "pages"] as const).map((t) => (
              <button
                key={t}
                type="button"
                disabled={busy}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  type === t
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {t}
              </button>
            ))}
          </fieldset>

          <div>
            <label htmlFor="goal-target" className="text-xs text-muted-foreground">
              Target per day
            </label>
            <Input
              id="goal-target"
              type="number"
              min={1}
              inputMode="numeric"
              value={target}
              disabled={busy}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1.5 max-w-[12rem]"
              required
            />
            {type === "pages" && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                1 page = {AYAHS_PER_PAGE} ayahs viewed.
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : data.goal ? "Update goal" : "Set goal"}
            </Button>
            {data.goal && (
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void clearGoal()}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}
