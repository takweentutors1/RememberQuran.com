"use client"

import { useState, type FormEvent } from "react"
import { Flame, Target, Calendar, BookOpenCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AYAHS_PER_PAGE,
  type GoalType,
} from "@/lib/goals/constants"
import { ActivityHeatmap } from "./ActivityHeatmap"
import { cn } from "@/lib/utils"

export interface GoalsSnapshot {
  goal: {
    type: GoalType
    target: number
    targetDate?: string | null
    dailyTarget?: number
    daysRemaining?: number
  } | null
  todayAyahs: number
  todayCount: number
  metToday: boolean
  streak: {
    currentStreak: number
    longestStreak: number
    lastMetDate: string | null
  }
  week: Array<{ date: string; met: boolean }>
  activityYear?: Record<string, number>
}

export function GoalsView({ initial }: { initial: GoalsSnapshot }) {
  const [data, setData] = useState(initial)
  const [type, setType] = useState<GoalType>(initial.goal?.type ?? "ayahs")
  const [target, setTarget] = useState(String(initial.goal?.target ?? 10))
  const [targetDate, setTargetDate] = useState(initial.goal?.targetDate ?? "")
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
        body: JSON.stringify({
          type,
          target: type === "khatm" ? 0 : Number(target),
          targetDate: type === "khatm" ? targetDate : null,
        }),
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
    if (!window.confirm("Clear your goal?")) return
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
      setTargetDate("")
      setType("ayahs")
    } catch {
      setError("Couldn’t clear goal.")
    } finally {
      setBusy(false)
    }
  }

  const unit =
    data.goal?.type === "pages"
      ? "pages"
      : data.goal?.type === "khatm"
      ? "ayahs daily"
      : "ayahs"

  const goalTarget = data.goal?.target ?? 1
  const progressPct = data.goal
    ? Math.min(100, Math.floor((data.todayCount / goalTarget) * 100))
    : 0

  return (
    <div className="space-y-8">
      {/* Streak Summary */}
      <section className="rounded-xl border border-border px-4 py-5 bg-card">
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
              Longest streak: {data.streak.longestStreak}{" "}
              {data.streak.longestStreak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </section>

      {/* 52-Week GitHub Style Heatmap */}
      <ActivityHeatmap activityMap={data.activityYear ?? {}} />

      {/* Today's Goal Progress */}
      <section className="rounded-xl border border-border p-5 bg-card">
        <div className="flex items-center gap-2 text-primary">
          <Target className="size-4" strokeWidth={1.75} />
          <h2 className="text-sm font-medium">Today's Progress</h2>
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
                <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">✓ Goal met today</span>
              )}
            </p>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
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

            {data.goal.type === "khatm" && data.goal.daysRemaining !== undefined && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground rounded-lg bg-primary/5 p-2.5 border border-primary/15">
                <BookOpenCheck className="size-4 text-primary shrink-0" />
                <span>
                  <strong>{data.goal.daysRemaining} days remaining</strong> to complete the entire Quran by {data.goal.targetDate}. Target adjusts automatically based on your pace.
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Set a reading or Khatm goal below to track daily consistency.
          </p>
        )}
      </section>

      {/* Settings Form */}
      <section className="rounded-xl border border-border p-5 bg-card">
        <h2 className="text-sm font-medium text-foreground">Configure Reading Goal</h2>
        <form onSubmit={save} className="mt-3 space-y-4">
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Goal type</legend>
            {(["ayahs", "pages", "khatm"] as const).map((t) => (
              <button
                key={t}
                type="button"
                disabled={busy}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  type === t
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {t === "khatm" ? "Khatm (Quran Completion)" : t}
              </button>
            ))}
          </fieldset>

          {type === "khatm" ? (
            <div>
              <label htmlFor="goal-target-date" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                Target Completion Date
              </label>
              <Input
                id="goal-target-date"
                type="date"
                value={targetDate}
                disabled={busy}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1.5 max-w-[14rem]"
                required
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                We'll dynamically calculate your required daily ayahs to finish all 6,236 verses by this date.
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="goal-target" className="text-xs text-muted-foreground">
                Target per day ({type})
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
                  1 page ≈ {AYAHS_PER_PAGE} ayahs viewed.
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
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
                Clear Goal
              </Button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}
